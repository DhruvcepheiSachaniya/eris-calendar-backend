import { Body, Controller, Get, Patch, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { SessionService } from "./session.service";
import { AddSessionDto } from "./dto/addsession.dto";
import { EditSessionDto } from "./dto/editsession.dto";
import { EndSessionDto } from "./dto/endsession.dto";
import { Cron } from "@nestjs/schedule";
import { In, LessThan, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Session, SessionStatus } from "src/entity/session.entity";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@Controller('api/session')
export class SessionController {
    constructor(
        private sessionService: SessionService,
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>
    ) { }

    // ? Add Session
    @UseGuards(JwtAuthGuard)
    @Post('add')
    async AddSession(
        @Body() dto: AddSessionDto
    ) {
        return this.sessionService.AddSession(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('start')
    async StartSession(
        @Body('sessionid') sessionid: number
    ) {
        return this.sessionService.StartSession(sessionid);
    }

    // ? Edit Session
    @UseGuards(JwtAuthGuard)
    @Put('edit')
    async EditSession(
        @Body() dto: EditSessionDto
    ) {
        return this.sessionService.EditSession(dto);
    }

    // ? Get One Session detail and summary
    @UseGuards(JwtAuthGuard)
    @Get('enddetail')
    async GetSessionDetail(
        @Query('sessionid') sessionid: number
    ) {
        console.log(sessionid);
        return this.sessionService.GetSessionDetails(sessionid);
    }

    @UseGuards(JwtAuthGuard)
    @Post('end')
    async EndSession(
        @Body() dto: EndSessionDto 
    ) {
        return this.sessionService.EndSession(dto);
    }

    @Get('patient/count')
    async GetPatientCount(
        @Query('sessionid') sessionid: number
    ) {
        return this.sessionService.GetSessionPatientCount(sessionid);
    }

    @UseGuards(JwtAuthGuard)
    @Get('patient/list')
    async getsessionbasedlist(
        @Query('sessionid') sessionid: number
    ) {
        return this.sessionService.GetsessionBasedpatient(sessionid);
    }

    // Task Scheduling
    @Cron('45 * * * * *')
    async TaskScheduling() {
        return console.log('Task Scheduling');
    }

    @Cron('0 0 * * * *')
    async handleEndForgottenSessions() {
        const now = new Date(); // UTC consistent
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    
        const sessionsToEnd = await this.sessionRepository.find({
            where: [
                {
                    status: Not(In([SessionStatus.Ended , SessionStatus.Scheduled])),
                    end_time: LessThan(oneDayAgo)
                }
            ]
        });
    
        if (sessionsToEnd.length) {
            for (const session of sessionsToEnd) {
                session.status = SessionStatus.Ended;
                await this.sessionRepository.save(session);
            }
            console.log(`[AUTO-END] ${sessionsToEnd.length} sessions ended at ${now}`);
        } else {
            console.log(`[AUTO-END] No sessions to end at ${now}`);
        }
    }
}