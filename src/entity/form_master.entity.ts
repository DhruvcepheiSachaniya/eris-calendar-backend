import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Campaign } from "./campaign.entity";
import { FormFields } from "./form_fields.entity";
import { PatientResponse } from "./patient_response.entity";

@Entity('form_master')
export class FormMaster {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    form_name: string;

    @Column({ nullable: true })
    form_description: string;

    @Column({ nullable: true })
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;

    //relationship
    @ManyToOne(() => Campaign,(campaign) => campaign.form_masters)
    campaign: Campaign;

    @OneToMany(() => FormFields, (form_fields) => form_fields.form_master)
    form_fields: FormFields[];

    @OneToMany(() => PatientResponse, (patient_response) => patient_response.formMaster)
    patient_responses: PatientResponse[];
} 