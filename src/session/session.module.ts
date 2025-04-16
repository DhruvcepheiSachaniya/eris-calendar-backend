import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";
import { Session } from "src/entity/session.entity";
import { Campaign } from "src/entity/campaign.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ Session, Campaign ])],
    controllers: [SessionController],
    providers: [SessionService],
    exports: []
})

export class SessionModule {}