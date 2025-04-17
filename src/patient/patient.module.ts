import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientController } from "./patient.controller";
import { PatientService } from "./patient.service";
import { Patient_master_entity } from "src/entity/patient_master.entity";
import { Session } from "src/entity/session.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ Patient_master_entity, Session ])],
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService]
})

export class PatientModule {}