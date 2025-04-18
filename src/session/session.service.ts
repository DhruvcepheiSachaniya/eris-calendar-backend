import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AddSessionDto } from "./dto/addsession.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Session, SessionStatus } from "src/entity/session.entity";
import { LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { Campaign } from "src/entity/campaign.entity";
import { EditSessionDto } from "./dto/editsession.dto";
import * as moment from 'moment';
import axios from "axios";
import { EndSessionDto } from "./dto/endsession.dto";
import * as dotenv from 'dotenv';
 
dotenv.config();

@Injectable({})
export class SessionService {
    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>
    ) { }

    async AddSession(dto: AddSessionDto) {
        try {
            // Ensure proper Date objects
            const startTime = new Date(dto.startTime);
            const endTime = new Date(dto.endTime);
            const date = new Date(dto.date);

            // Validate time order
            if (startTime >= endTime) {
                throw new HttpException("End time must be after start time", HttpStatus.BAD_REQUEST);
            }

            return await this.sessionRepository.manager.transaction(async (manager) => {
                // Overlap check with precise comparisons
                const existing = await manager.createQueryBuilder(Session, "session")
                    // .where("session.dr_code = :drCode", { drCode: dto.drCode })
                    .andWhere("DATE(session.date) = DATE(:date)", { date })
                    .andWhere("session.start_time < :end AND session.end_time > :start", {
                        start: startTime,
                        end: endTime
                    })
                    .getOne();

                if (existing) {
                    throw new HttpException(`Conflict with existing session (ID: ${existing.id})`, HttpStatus.CONFLICT);
                }

                const campaign = await manager.findOne(Campaign, {
                    where: { name: dto.Study }
                });

                if (!campaign) {
                    throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
                }

                const newSession = manager.create(Session, {
                    campaign,
                    dr_code: dto.drCode,
                    dr_speciality: dto.drspeciality,
                    empCode: dto.empCode,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    status: SessionStatus.Scheduled
                });

                return await manager.save(newSession);
            });

        } catch (err) {
            throw new HttpException(
                err.message || "Session creation failed",
                err.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async StartSession(sessionId: number) {
        return await this.sessionRepository.manager.transaction(async (manager) => {
            // 1. Find session with lock to prevent concurrent starts
            const session = await manager.findOne(Session, {
                where: { id: sessionId },
                lock: { mode: "pessimistic_write" }
            });

            if (!session) {
                throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
            }

            // 2. Status validation
            if (session.status !== SessionStatus.Scheduled) {
                throw new HttpException(
                    `Session cannot be started (current status: ${session.status})`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // 3. Time calculations (all in UTC)
            const now = new Date();
            const scheduledStart = new Date(session.start_time);
            const scheduledEnd = new Date(session.end_time);
            const originalDuration = scheduledEnd.getTime() - scheduledStart.getTime();

            // 4. Buffer period calculation (UTC)
            const bufferEnd = new Date(scheduledStart);
            bufferEnd.setUTCDate(bufferEnd.getUTCDate() + 1);
            bufferEnd.setUTCHours(23, 59, 59, 999);

            // 5. Time validations
            if (now < scheduledStart) {
                throw new HttpException(
                    `Cannot start before scheduled time (${scheduledStart.toISOString()})`,
                    HttpStatus.BAD_REQUEST
                );
            }

            if (now > bufferEnd) {
                throw new HttpException(
                    'Session can only be started within 1 day after scheduled date',
                    HttpStatus.BAD_REQUEST
                );
            }

            // 6. Calculate new time slot
            const newStart = now;
            const newEnd = new Date(now.getTime() + originalDuration);

            // 7. Check for conflicts (global time slot check)
            const conflictingSession = await manager.createQueryBuilder(Session, "s")
                .where("s.id != :sessionId", { sessionId })
                .andWhere("s.status NOT IN (:...excludedStatuses)", {
                    excludedStatuses: [SessionStatus.Ended]
                })
                .andWhere("(s.start_time < :newEnd AND s.end_time > :newStart)", {
                    newStart,
                    newEnd
                })
                .getOne();

            if (conflictingSession) {
                throw new HttpException({
                    statusCode: HttpStatus.CONFLICT,
                    message: "Time slot already booked",
                    conflictDetails: {
                        existingSessionId: conflictingSession.id,
                        existingTime: `${conflictingSession.start_time.toISOString()} - ${conflictingSession.end_time.toISOString()}`
                    }
                }, HttpStatus.CONFLICT);
            }

            // 8. Update session
            session.status = SessionStatus.Started;
            session.start_time = newStart;
            session.end_time = newEnd;
            session.buffer_used = this.isBufferPeriodUsed(scheduledStart, newStart);
            // session.actual_start_time = now;

            await manager.save(session);

            return {
                status: "success",
                session: {
                    id: session.id,
                    newTimeSlot: `${newStart.toISOString()} - ${newEnd.toISOString()}`,
                    bufferUsed: session.buffer_used
                }
            };
        });
    }

    private isBufferPeriodUsed(scheduledStart: Date, actualStart: Date): boolean {
        const scheduledDay = new Date(scheduledStart);
        scheduledDay.setUTCHours(0, 0, 0, 0);

        const actualDay = new Date(actualStart);
        actualDay.setUTCHours(0, 0, 0, 0);

        return actualDay.getTime() !== scheduledDay.getTime();
    }

    async EditSession(dto: EditSessionDto) {
        return await this.sessionRepository.manager.transaction(async (transactionalEntityManager) => {
            // 1. Find session with locking to prevent concurrent edits
            const session = await transactionalEntityManager.findOne(Session, {
                where: { id: dto.sessionId },
                lock: { mode: "pessimistic_write" }
            });

            if (!session) {
                throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
            }

            // 2. Prevent editing ended sessions
            if (session.status === SessionStatus.Ended) {
                throw new HttpException("Cannot edit an ended session", HttpStatus.BAD_REQUEST);
            }

            // 3. Apply 1-day buffer logic
            const now = new Date();
            const scheduledStart = new Date(session.start_time);
            const bufferEnd = new Date(scheduledStart);
            bufferEnd.setUTCDate(bufferEnd.getUTCDate() + 1);
            bufferEnd.setUTCHours(23, 59, 59, 999);

            if (now > bufferEnd) {
                throw new HttpException(
                    'Session can only be edited within 1 day after scheduled date',
                    HttpStatus.BAD_REQUEST
                );
            }

            // 3. Validate time consistency
            if (dto.startTime || dto.endTime) {
                const startTime = dto.startTime ? new Date(dto.startTime) : session.start_time;
                const endTime = dto.endTime ? new Date(dto.endTime) : session.end_time;

                if (startTime >= endTime) {
                    throw new HttpException("End time must be after start time", HttpStatus.BAD_REQUEST);
                }
            }

            // 4. Check for session overlaps (excluding current session)
            if (dto.startTime || dto.endTime || dto.date) {
                const checkDate = dto.date ? new Date(dto.date) : session.date;
                const checkStart = dto.startTime ? new Date(dto.startTime) : session.start_time;
                const checkEnd = dto.endTime ? new Date(dto.endTime) : session.end_time;

                const overlappingSession = await transactionalEntityManager
                    .createQueryBuilder(Session, "s")
                    .where("s.id != :sessionId", { sessionId: session.id })
                    .andWhere("s.dr_code = :drCode", { drCode: dto.drCode || session.dr_code })
                    .andWhere("s.status NOT IN (:...excludedStatuses)", {
                        excludedStatuses: [SessionStatus.Ended]
                    })
                    .andWhere(`
                        (s.start_time < :end AND s.end_time > :start)
                    `, {
                        start: checkStart,
                        end: checkEnd
                    })
                    .getOne();

                if (overlappingSession) {
                    throw new HttpException({
                        statusCode: HttpStatus.CONFLICT,
                        message: "Session conflicts with existing appointment",
                        conflictWith: {
                            id: overlappingSession.id,
                            time: `${overlappingSession.start_time} - ${overlappingSession.end_time}`
                        }
                    }, HttpStatus.CONFLICT);
                }
            }

            // 5. Update campaign if changed
            if (dto.Study) {
                const campaign = await transactionalEntityManager.findOne(Campaign, {
                    where: { name: dto.Study }
                });
                if (!campaign) {
                    throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
                }
                session.campaign = campaign;
            }

            // 6. Apply updates
            if (dto.drCode) session.dr_code = dto.drCode;
            if (dto.empCode) session.empCode = dto.empCode;
            if (dto.date) session.date = new Date(dto.date);
            if (dto.startTime) session.start_time = new Date(dto.startTime);
            if (dto.endTime) session.end_time = new Date(dto.endTime);
            if (dto.select_reason) session.select_reson = dto.select_reason;

            const updatedSession = await transactionalEntityManager.save(session);

            return {
                status: "success",
                session: updatedSession
            };
        });
    }

    async GetSessionDetails(sessionId: number) {
        try {
            // Get session with related entities
            const session: any = await this.sessionRepository.findOne({
                where: {
                    id: sessionId
                },
                relations: ['campaign', "patients"]
            });

            if (!session) {
                throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
            }

            // Doctor Details from external API
            const external_doc_api = `${process.env.EXTERNAL_URL}/drdetails?drcode=${session.dr_code}`
            let doctorData;
            try {
                const doctorResponse = await axios.get(external_doc_api);
                doctorData = doctorResponse.data.doctor;
                // console.log(doctorData)
            } catch (error) {
                console.error("Failed to fetch doctor details:", error.message);
                throw new HttpException("Failed to fetch doctor details", HttpStatus.SERVICE_UNAVAILABLE);
            }

            // Calculate campaign summary metrics
            const totalPatients = session.patient ? session.patient.length : 0;
            const totalRxGenerated = session.patient ? session.patient.filter(p => p.prescription_img).length : 0;
            const totalReportsGenerated = session.patient ? session.patient.filter(p => p.report_img).length : 0;

            const result = {
                sessionId: session.id,
                date: session.date,
                startTime: session.start_time,
                endTime: session.end_time,
                status: session.status,

                // Doctor details
                drcode: session.dr_code,
                division: doctorData?.divisionname,
                drname: doctorData?.drname,
                speciality: doctorData?.speciality,
                empcode: doctorData?.empcode,
                hq: doctorData?.hq,
                empname: doctorData?.empname,
                region: doctorData?.regionname,

                // Campaign details
                campaignName: session.campaign?.name,
                campaignDescription: session.campaign?.description,
                campaignDate: session.campaign?.created_at,

                // Campaign summary (uncomment when ready)
                camp_total_patient: totalPatients,
                total_rx_generated: totalRxGenerated,
                total_report_generated: totalReportsGenerated
            };

            return {
                status: "success",
                result
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

    async EndSession(dto: EndSessionDto) {
        return await this.sessionRepository.manager.transaction(async (transactionalEntityManager) => {
            // 1. Find session with lock to prevent concurrent modifications
            const session = await transactionalEntityManager.findOne(Session, {
                where: { id: dto.sessionid },
                lock: { mode: "pessimistic_write" },
            });

            if (!session) {
                throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
            }

            // 2. Validate session state
            if (session.status === SessionStatus.Ended) {
                throw new HttpException("Session already ended", HttpStatus.BAD_REQUEST);
            }

            if (session.status === SessionStatus.Scheduled) {
                throw new HttpException("Cannot end a session that hasn't started", HttpStatus.BAD_REQUEST);
            }

            // 3. Validate end time consistency
            const now = new Date();
            if (now < session.start_time) {
                throw new HttpException(
                    "Cannot end session before start time",
                    HttpStatus.BAD_REQUEST
                );
            }

            // 4. Update session
            session.status = SessionStatus.Ended;
            session.end_time = now; // Record actual end time
            session.camp_executed = dto.cam_excecuted;
            session.dr_kit_delivered = dto.kit_distributed;

            // 5. Save and trigger post-end actions
            await transactionalEntityManager.save(session);

            return {
                status: "success",
                sessionId: session.id,
            };
        });
    }

    async GetSessionPatientCount(sessionid: number) {
        try {
            const session: any = await this.sessionRepository.findOne({
                where: {
                    id: sessionid,
                },
                relations: ["patients"]
            });

            if (!session) {
                throw new HttpException(
                    "Session not found",
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                status: "success",
                patientCount: session?.patients?.length,
            }

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    async GetsessionBasedpatient(sessionid: number) {
        try {
            // return ---> total patient, total patient prescriptions, total patient report
            const find_session = await this.sessionRepository.findOne({
                where: {
                    id: sessionid,
                },
                relations: ['patients']
            });

            if (!find_session) {
                throw new HttpException(
                    "Session not found",
                    HttpStatus.NOT_FOUND
                );
            }

            const patientCount = find_session.patients?.length || 0;
            const pre_count = find_session.patients?.reduce(
                (acc, patient) => acc + (patient.prescription_img?.length || 0),
                0
            );
            const rep_count = find_session.patients?.reduce(
                (acc, patient) => acc + (patient.report_img?.length || 0),
                0
            );

            return {
                status: "success",
                find_session,
                patientCount,
                pre_count,
                rep_count
            }
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}