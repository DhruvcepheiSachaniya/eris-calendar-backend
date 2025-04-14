import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DoctorController } from "./doctor.controller";
import { DoctorService } from "./doctor.service";

@Module({
    imports: [TypeOrmModule.forFeature([ ])],
    controllers: [DoctorController],
    providers: [DoctorService],
    exports: []
})

export class DoctorModule {}