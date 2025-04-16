import { Module } from "@nestjs/common";
import { CampaignController } from "./campaign.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignService } from "./campaign.service";
import { Campaign } from "src/entity/campaign.entity";
import { PatientService } from "src/patient/patient.service";
import { DoctorService } from "src/doctor/doctor.service";

@Module({
    imports: [TypeOrmModule.forFeature([ Campaign ])],
    controllers: [CampaignController],
    providers: [CampaignService, PatientService, DoctorService],
    exports:[]
})

export class CampaignModule {}