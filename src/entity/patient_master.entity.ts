import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Session } from "./session.entity";

@Entity('patient_master')
export class Patient_master_entity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    patient_code: string;

    @Column({ nullable: true})
    patient_name: string;

    @Column({ nullable: true})
    patient_age: number;

    @Column({ nullable: true})
    patient_gender: string;

    @Column({ nullable: true})
    prescription_img: string;

    @Column({ nullable: true})
    report_img: string;

    @Column({ nullable: true})
    sync_status: Date;

    @Column({ nullable: true})
    patient_email: string;

    @Column({ nullable: true})
    patient_phone: string;

    @Column({ nullable: true})
    patient_sign: string;

    //relation --> Doctor
    @Column({ nullable: true})
    dr_Code: string;

    @OneToMany(() => Session, (session) => session.patient)
    sessions: Session[];
} 