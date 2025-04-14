import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientController } from "./patient.controller";
import { PatientService } from "./patient.service";

@Module({
    imports: [TypeOrmModule.forFeature([ ])],
    controllers: [PatientController],
    providers: [PatientService],
    exports: []
})

export class PatientModule {}