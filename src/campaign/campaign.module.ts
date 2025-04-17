import { Module } from "@nestjs/common";
import { CampaignController } from "./campaign.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignService } from "./campaign.service";
import { Campaign } from "src/entity/campaign.entity";
import { PatientModule } from "src/patient/patient.module";

@Module({
    imports: [TypeOrmModule.forFeature([ Campaign ]), PatientModule],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports:[]
})

export class CampaignModule {}