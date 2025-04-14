import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AddSessionDto } from "./dto/addsession.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "src/entity/session.entity";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Campaign } from "src/entity/campaign.entity";
import { EditSessionDto } from "./dto/editsession.dto";

@Injectable({})
export class SessionService {
    constructor (
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>
    ) {}

    async AddSession (dto: AddSessionDto) {
        try {
            // ! Note1:- time will come in ISOstring fromat from frontend side

            // check if the session active at this time
            const is_session_active = await this.sessionRepository.findOne({
                where: {
                    date: dto.date,
                    start_time: LessThanOrEqual(dto.startTime),
                    end_time: MoreThanOrEqual(dto.endTime),
                }
            });

            if (is_session_active) {
                throw new HttpException("Session already exists at this time", HttpStatus.BAD_REQUEST);
            }

            // find campaign by name
            const campaign = await this.campaignRepository.findOne({
                where: {
                    name: dto.Study
                }
            })

            if (!campaign) {
                throw new HttpException("Campaign not found", HttpStatus.BAD_REQUEST);
            }

            //Create new session
            const new_session = new Session();
            new_session.campaign = campaign;//assign campaign object
            new_session.dr_code = dto.drCode;
            new_session.empCode = dto.empCode;
            new_session.date = dto.date;
            new_session.start_time = dto.startTime;
            new_session.end_time = dto.endTime;

            const save_session = await this.sessionRepository.save(new_session);

            return {
                status: "success",
                save_session,
            }
            
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async EditSession(dto: EditSessionDto) {
        try {
            // Find the session by ID
            const session = await this.sessionRepository.findOne({
                where: {
                    id: dto.sessionId
                }
            });
            
            if (!session) {
                throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
            }
            
            // Update the session properties
            if (dto.Study) {
                // Find the campaign by name if Study is being updated
                const campaign = await this.campaignRepository.findOne({
                    where: {
                        name: dto.Study
                    }
                });
                
                if (!campaign) {
                    throw new HttpException("Campaign/Study not found", HttpStatus.NOT_FOUND);
                }
                
                session.campaign = campaign;
            }
            
            // Update other fields if provided
            if (dto.drCode) session.dr_code = dto.drCode;
            if (dto.empCode) session.empCode = dto.empCode;
            if (dto.date) session.date = dto.date;
            if (dto.startTime) session.start_time = dto.startTime;
            if (dto.endTime) session.end_time = dto.endTime;
            if (dto.select_reason) session.select_reson = dto.select_reason;
            
            // Save the updated session
            const updated_session = await this.sessionRepository.save(session);
            
            return {
                status: "success",
                session: updated_session
            };
            
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async GetSessions(startDate: Date, endDate: Date, empCode?: string) {
        try {
            // Build query with date range filter
            const queryBuilder = this.sessionRepository.createQueryBuilder('session')
                .leftJoinAndSelect('session.campaign', 'campaign')
                .where('session.date >= :startDate', { startDate })
                .andWhere('session.date <= :endDate', { endDate });
            
            // Add employee filter if provided
            if (empCode) {
                queryBuilder.andWhere('session.empCode = :empCode', { empCode });
            }
            
            // Execute query
            const sessions = await queryBuilder.getMany();
            
            return {
                status: "success",
                sessions
            };
            
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async GetSessionDetails() {
        try {
            // ? Perticular Session details
            const Get_session = await this.sessionRepository.findOne({
                where: {
                    // date:
                }
            })
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}