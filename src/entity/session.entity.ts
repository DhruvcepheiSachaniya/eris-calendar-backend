import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Campaign } from "./campaign.entity";
import { Patient_master_entity } from "./patient_master.entity";

export enum SessionStatus {
    Scheduled = 'Scheduled',
    Started = 'Started',
    Continued = 'Continued',
    Ended = 'Ended',
}

@Entity('session')
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    date: Date;

    @Column({ nullable: true })
    start_time: Date;

    @Column({ nullable: true })
    end_time: Date;

    @Column({ nullable: true })
    buffer_used: boolean;

    @Column({ nullable: true })
    camp_executed: string;

    @Column({ nullable: true })
    dr_kit_delivered: string;

    @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.Scheduled, nullable: true })
    status: SessionStatus;

    //if its edit session
    @Column({ nullable: true })
    select_reson: string;

    //relation ---> Doctor, user, campaign
    @Column({ nullable: true })
    dr_code: string;

    @Column({ nullable: true })
    dr_speciality: string;

    @Column({ nullable: true })
    empCode: string;

    @ManyToOne(() => Campaign, (campaign) => campaign.sessions)
    campaign: Campaign;

    @ManyToMany(() => Patient_master_entity, (patient) => patient.sessions)
    @JoinTable() // This will create a join table named 'session_patients_patient_master_entity'
    patients: Patient_master_entity[];


}