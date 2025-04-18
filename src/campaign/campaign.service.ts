import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Campaign } from "src/entity/campaign.entity";
import { SessionStatus } from "src/entity/session.entity";
import { Repository } from "typeorm";
import * as dotenv from 'dotenv';
 
dotenv.config();

@Injectable({})
export class CampaignService {
    constructor(
        @InjectRepository(Campaign)
        private readonly campaignRepository: Repository<Campaign>,
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

    // async getAllCampaign(empcode: string) {
    //     try {
    //         // Fetch doctor list from external api
    //         const externalAPI = `http://localhost:4444/api/doctorlist?empCode=${empcode}`;

    //         const external_response = await axios.get(externalAPI);

    //         const validDoctorCodes: string[] = external_response.data?.doctors?.map(d => d.drCode) || [];
    //         // the sessions will fiter by doctorlist ---

    //         const all_campaign = await this.campaignRepository.find({
    //             relations: ['sessions', 'sessions.patients']
    //         });
    
    //         if (!all_campaign || all_campaign.length === 0) {
    //             throw new HttpException("No Campaign found", HttpStatus.NOT_FOUND);
    //         }
    
    //         let total_scheduled_sessions = 0;
    //         let total_session_completed = 0;
    //         const doctorSet = new Set<string>();
    //         let total_patients = 0;
    
    //         all_campaign.forEach((campaign) => {
    //             campaign.sessions.forEach(async (session) => {
    //                 if (session.status === SessionStatus.Scheduled) {
    //                     total_scheduled_sessions++;
    //                 }
    
    //                 if (session.status === SessionStatus.Ended) {
    //                     total_session_completed++;
    //                 }
    
    //                 if (session.dr_code) {
    //                     doctorSet.add(session.dr_code);
    //                 }
    
    //                 total_patients += session.patients?.length || 0;
    //             });
    //         });
    
    //         return {
    //             status: "success",
    //             stats: {
    //                 scheduled_sessions: total_scheduled_sessions,
    //                 session_completed: total_session_completed,
    //                 associated_doctor: doctorSet.size,
    //                 total_patients: total_patients
    //             },
    //             all_campaign
    //         };
    //     } catch (err) {
    //         throw new HttpException(
    //             err instanceof HttpException ? err.getResponse() : "Internal Server Error",
    //             err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }
    async getAllCampaign(empcode: string) {
        try {
            // Fetch doctor list from external api
            const externalAPI = `${process.env.EXTERNAL_URL}/doctorlist?empCode=${empcode}`;
            
            const external_response = await axios.get(externalAPI);
            
            const validDoctorCodes: string[] = external_response.data?.doctors?.map(d => d.drCode) || [];
            
            // Fetch all campaigns with their sessions and patients
            const all_campaign = await this.campaignRepository.find({
                relations: ['sessions', 'sessions.patients', 'sessions.campaign']
            });
            
            if (!all_campaign || all_campaign.length === 0) {
                throw new HttpException("No Campaign found", HttpStatus.NOT_FOUND);
            }
            
            // Filter and process campaigns based on valid doctor codes
            let total_scheduled_sessions = 0;
            let total_session_completed = 0;
            let targeted_doctors = 0;
            let targeted_sessions = 0;
            const doctorSet = new Set<string>();
            let total_patients = 0;
            
            // Create deep copy of campaigns to manipulate
            const filtered_campaigns = all_campaign.map(campaign => {
                // Create a new object for the filtered campaign
                const filteredCampaign = {
                    ...campaign,
                    sessions: campaign.sessions.filter(session => 
                        validDoctorCodes.includes(session.dr_code)
                    )
                };
                
                // Count statistics for filtered sessions
                filteredCampaign.sessions.forEach(session => {
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
                
                targeted_sessions += filteredCampaign.sessions.length;
                targeted_doctors = external_response?.data?.doctors?.length || 0;
                return filteredCampaign;
            });
            
            return {
                status: "success",
                stats: {
                    scheduled_sessions: total_scheduled_sessions,
                    targeted_sessions: targeted_sessions,
                    targeted_doctors: targeted_doctors,
                    session_completed: total_session_completed,
                    associated_doctor: doctorSet.size,
                    total_patients: total_patients
                },
                all_campaign: filtered_campaigns
            };
        } catch (err) {
            if (err.response) {
                console.error('Error status:', err.response.status);
                console.error('Error data:', err.response.data);
        
                // Bubble up microservice error
                throw new HttpException(
                    err.response.data?.message || 'External service error',
                    err.response.status
                );
            }
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getCampaignbasedsessions(campaignid: number, empcode: string) {
        try {
            // 1. Fetch valid doctor codes from external API
            const externalAPI = `${process.env.EXTERNAL_URL}/doctorlist?empCode=${empcode}`;
            
            const external_response = await axios.get(externalAPI);
            
            const validDoctorCodes: string[] = external_response.data?.doctors?.map(d => d.drCode) || [];
            
            // 2. Fetch campaign with sessions and patients
            const campaign = await this.campaignRepository.findOne({
                where: {
                    id: campaignid
                },
                relations: ['sessions', 'sessions.patients']
            });
    
            if (!campaign) {
                throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
            }
    
            // 3. Filter sessions by valid doctor codes
            const filteredSessions = campaign.sessions.filter(session => 
                validDoctorCodes.includes(session.dr_code)
            );
    
            // 4. Create a filtered campaign object
            const filteredCampaign = {
                ...campaign,
                sessions: filteredSessions
            };
    
            // 5. Calculate statistics based on filtered sessions
            const scheduled_sessions_count = filteredSessions.filter(session => 
                session.status === SessionStatus.Scheduled
            ).length;
    
            const session_completed_count = filteredSessions.filter(session => 
                session.status === SessionStatus.Ended
            ).length;
    
            const uniqueDoctors = [...new Set(filteredSessions.map(session => 
                session.dr_code
            ).filter(Boolean))];
    
            let totalPatients = 0;
            for (const session of filteredSessions) {
                totalPatients += session.patients?.length || 0;
            }
    
            return {
                status: "success",
                scheduled_sessions: scheduled_sessions_count,
                associated_doctor: uniqueDoctors.length,
                session_completed: session_completed_count,
                total_patients: totalPatients,
                data: filteredCampaign,
            }
    
        } catch (err) {
            if (err.response) {
                console.error('Error status:', err.response.status);
                console.error('Error data:', err.response.data);
        
                // Bubble up microservice error
                throw new HttpException(
                    err.response.data?.message || 'External service error',
                    err.response.status
                );
            }
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}