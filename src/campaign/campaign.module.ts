import { Module } from "@nestjs/common";
import { CampaignController } from "./campaign.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignService } from "./campaign.service";
import { Campaign } from "src/entity/campaign.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ Campaign ])],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports:[]
})

export class CampaignModule {}