import { Body, Controller, Get, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CampaignService } from "./campaign.service";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { CreateFormDto } from "./dto/form.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { PatientService } from "src/patient/patient.service";

@Controller('api/campaign')
export class CampaignController {
    constructor (
        private campaignService: CampaignService,
        private patientService: PatientService
    ) {} 

    // ? Post New Campaign
    // @UseGuards(JwtAuthGuard)
    @Post('new')
    @UseInterceptors(FileInterceptor('file'))
    async PostCampaign(
        @Body('name') name: string,
        @Body('description') description: string,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const img_Url = await this.patientService.uploadToS3(file);
        return this.campaignService.PostCampaign(name, description, img_Url);
    }

    // ? Get Campaign List
    @UseGuards(JwtAuthGuard)
    @Get('list')
    async GetCampaignList(
        @Query('empcode') empcode: string
    ) {
        return this.campaignService.getAllCampaign(empcode);
    }

    @UseGuards(JwtAuthGuard)
    @Get('details')
    async getCampaignbasedsessions(
        @Query('campaignid') campaignid: number,
        @Query('empcode') empcode: string
    ) {
        return this.campaignService.getCampaignbasedsessions(campaignid, empcode);
    }
}