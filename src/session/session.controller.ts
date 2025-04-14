import { Body, Controller, Get, Patch, Post, Put, Query, UseInterceptors } from "@nestjs/common";
import { SessionService } from "./session.service";
import { AddSessionDto } from "./dto/addsession.dto";
import { EditSessionDto } from "./dto/editsession.dto";

@Controller('api/session')
export class SessionController {
    constructor(
        private sessionService: SessionService
    ) { }

    //Add session, start session, edit session, view session, continue session, end session
    //session details based on value
    //per session summary

    // ? Add Session
    @Post('add')
    async AddSession(
        @Body() dto: AddSessionDto
    ) {
        return this.sessionService.AddSession(dto);
    }

    // ? Not Fix yet for start session

    // ? Edit Session
    @Put('edit')
    async EditSession(
        @Body() dto: EditSessionDto
    ) {
        return this.sessionService.EditSession(dto);
    }

    // ? Get session Data based on What passed
    @Get('sessions')
    async GetSessions(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('empCode') empCode?: string
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.sessionService.GetSessions(start, end, empCode);
    }

    // ? Get One Session detail and summary
    @Get('detail')
    async GetSessionDetail(
        // @Query()
    ) {
        //
    }

}