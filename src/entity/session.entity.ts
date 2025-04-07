import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PatientResponse } from "./patient_response.entity";

@Entity('session')
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    date: Date;

    @Column({ nullable: true})
    start_time: Date;

    @Column({ nullable: true })
    end_time: Date;

    //relation ---> Doctor, user
    @OneToMany(() => PatientResponse, (patient_response) => patient_response.session)
    patient_responses: PatientResponse[];
}