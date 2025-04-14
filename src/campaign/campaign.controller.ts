import { Body, Controller, Get, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CampaignService } from "./campaign.service";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { CreateFormDto } from "./dto/form.dto";

@Controller('api/campaign')
export class CampaignController {
    constructor (
        private campaignService: CampaignService
    ) {} 

    // ? Post New Campaign
    // @UseGuards(JwtAuthGuard)
    @Post('new')
    async PostCampaign(
        @Body() name: string,
        @Body() description: string
    ) {
        return this.campaignService.PostCampaign(name, description);
    }

    // ? Get Campaign List
    // @UseGuards(JwtAuthGuard)
    @Get('list')
    async GetCampaignList() {
        return this.campaignService.getAllCampaign();
    }

    // ? Campaign Based Form
    @Post('form')
    async CreateCampaignBasedForm (
        @Body() dto: CreateFormDto
    ) {
        // return this.campaignService.CreateCampaignBasedForm(dto);
    }

    // ? Get Campaign Based Form
    @Get('form')
    async getCampaignBasedForm(
        @Query() CampaignName: string,
    ) {
        // return this.campaignService.GetCampaignBasedForm(CampaignName);
    }

    // ? Update Campaign Based Form
    @Patch('form')
    async UpdateCampaignBasedForm(
        @Body() dto: CreateFormDto
    ) {
        // return this.campaignService.UpdateCampaignBasedForm(dto);
    }
}