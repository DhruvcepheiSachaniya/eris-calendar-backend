import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PatientResponse } from "./patient_response.entity";

@Entity('patient_master')
export class Patient_master_entity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    patient_name: string;

    @Column({ nullable: true})
    patient_age: number;

    @Column({ nullable: true})
    patient_gender: string;

    @Column({ nullable: true})
    sync_status: Date;

    @Column({ nullable: true})
    patient_email: string;

    @Column({ nullable: true})
    patient_phone: string;

    @Column({ nullable: true})
    patient_sign: string;

    //relation --> Doctor
    @OneToMany(() => PatientResponse, (patient) => patient.patient)
    patient_responses: PatientResponse[];
} 