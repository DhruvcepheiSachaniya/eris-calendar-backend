import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DoctorService } from "src/doctor/doctor.service";
import { Campaign } from "src/entity/campaign.entity";
import { SessionStatus } from "src/entity/session.entity";
import { Repository } from "typeorm";

@Injectable({})
export class CampaignService {
    constructor(
        @InjectRepository(Campaign)
        private readonly campaignRepository: Repository<Campaign>,
        private doctorservice: DoctorService
    ) { }

    async PostCampaign(name: string, description: string, img_Url: string) {
        try {
            const find_campaign = await this.campaignRepository.findOne({
                where: {
                    name: name,
                }
            })

            if (find_campaign) {
                throw new HttpException("Campaign already exist", HttpStatus.BAD_REQUEST)
            }

            const campaign = new Campaign();
            campaign.name = name;
            campaign.description = description;
            campaign.campaign_img = img_Url;
            campaign.created_at = new Date();
            // campaign.updated_at = new Date();

            const new_campaign = await this.campaignRepository.save(campaign);

            return {
                status: "success",
                new_campaign
            };

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllCampaign() {
        try {
            const all_campaign = await this.campaignRepository.find({
                relations: ['sessions', 'sessions.patients']
            });
    
            if (!all_campaign || all_campaign.length === 0) {
                throw new HttpException("No Campaign found", HttpStatus.NOT_FOUND);
            }
    
            let total_scheduled_sessions = 0;
            let total_session_completed = 0;
            const doctorSet = new Set<string>();
            let total_patients = 0;
    
            all_campaign.forEach((campaign) => {
                campaign.sessions.forEach(async (session) => {
                    if (session.status === SessionStatus.Scheduled) {
                        total_scheduled_sessions++;
                    }
    
                    if (session.status === SessionStatus.Ended) {
                        total_session_completed++;
                    }
    
                    if (session.dr_code) {
                        doctorSet.add(session.dr_code);
                    }
    
                    total_patients += session.patients?.length || 0;
                });
            });
    
            return {
                status: "success",
                stats: {
                    scheduled_sessions: total_scheduled_sessions,
                    session_completed: total_session_completed,
                    associated_doctor: doctorSet.size,
                    total_patients: total_patients
                },
                all_campaign
            };
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    

    async getCampaignbasedsessions(campaignid: number) {
        try {
            // ! Need to return --> Scheduled Sessions, Assoiated doctor, Session completed, Total Patients
            const campaign = await this.campaignRepository.findOne({
                where: {
                    id: campaignid
                },
                relations: ['sessions', 'sessions.patients']
            });

            if (!campaign) {
                throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
            }

            const sessions = campaign.sessions;

            // Scheduled sessions
            const scheduled_sessions_count = sessions.filter(session => session.status === SessionStatus.Scheduled).length;

            // Completed sessions
            const session_completed_count = sessions.filter(session => session.status === SessionStatus.Ended).length;

            // Unique doctors (remove duplicates)
            const uniqueDoctors = [...new Set(sessions.map(session => session.dr_code).filter(Boolean))];

            // Total patients across all sessions
            let totalPatients = 0;
            for (const session of sessions) {
                totalPatients += session.patients?.length || 0;
            }

            const total_patient_count = campaign.sessions;

            return {
                status: "success",
                scheduled_sessions: scheduled_sessions_count,
                associated_doctor: uniqueDoctors.length,
                session_completed: session_completed_count,
                total_patients: totalPatients,
                data: campaign,
            }

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}