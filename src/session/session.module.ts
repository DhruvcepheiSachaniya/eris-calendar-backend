import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";

@Module({
    imports: [TypeOrmModule.forFeature([ ])],
    controllers: [SessionController],
    providers: [SessionService],
    exports: []
})

export class SessionModule {}