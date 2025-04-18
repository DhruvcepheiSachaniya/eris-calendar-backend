import { Body, Controller, Get, Patch, Post, Put, Query, UseInterceptors } from "@nestjs/common";
import { SessionService } from "./session.service";
import { AddSessionDto } from "./dto/addsession.dto";
import { EditSessionDto } from "./dto/editsession.dto";
import { EndSessionDto } from "./dto/endsession.dto";
import { Cron } from "@nestjs/schedule";

@Controller('api/session')
export class SessionController {
    constructor(
        private sessionService: SessionService
    ) { }

    // ? Add Session
    @Post('add')
    async AddSession(
        @Body() dto: AddSessionDto
    ) {
        return this.sessionService.AddSession(dto);
    }

    @Post('start')
    async StartSession(
        @Body('sessionid') sessionid: number
    ) {
        return this.sessionService.StartSession(sessionid);
    }

    // ? Edit Session
    @Put('edit')
    async EditSession(
        @Body() dto: EditSessionDto
    ) {
        return this.sessionService.EditSession(dto);
    }

    // ? Get One Session detail and summary
    @Get('enddetail')
    async GetSessionDetail(
        @Query('sessionid') sessionid: number
    ) {
        return this.sessionService.GetSessionDetails(sessionid);
    }

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
}