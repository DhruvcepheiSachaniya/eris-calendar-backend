import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FormMaster } from "./form_master.entity";
import { PatientResponse } from "./patient_response.entity";

@Entity('form_fields')
export class FormFields {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    field_name: string;

    @Column({ nullable: true})
    field_type: string;

    @Column({ nullable: true})
    field_order: number;

    @Column({ nullable: true})
    is_required: boolean;

    @Column({ nullable: true})
    is_active: boolean

    @Column({ nullable: true })
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;

    //relationships
    @ManyToOne(() => FormMaster, (form_fields) => form_fields.form_fields)
    form_master: FormMaster;

    @ManyToOne(() => PatientResponse, (form_fields) => form_fields.formFields)
    patient_responses: PatientResponse;
}