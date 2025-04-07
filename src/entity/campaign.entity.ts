import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FormMaster } from "./form_master.entity";
import { PatientResponse } from "./patient_response.entity";

@Entity('campaign')
export class Campaign {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;

    //relationships
    @OneToMany(() => FormMaster, (formmaster) => formmaster.campaign)
    form_masters: FormMaster[];
}