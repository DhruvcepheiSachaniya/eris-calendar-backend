import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Patient_master_entity } from "./patient_master.entity";
import { Campaign } from "./campaign.entity";
import { FormMaster } from "./form_master.entity";
import { FormFields } from "./form_fields.entity";
import { Session } from "./session.entity";

@Entity('patient_response')
export class PatientResponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    patient_id: number;

    @Column({ nullable: true })
    response_value: string;

    @Column({ nullable: true })
    response_date: Date;

    //relationships ---> patient, campaign, form_master, form_fields
    @ManyToOne(() => Patient_master_entity, (patient) => patient.patient_responses)
    @JoinColumn({ name: 'patient_id' , referencedColumnName: 'id'})
    patient: Patient_master_entity;

    @ManyToOne(() => FormMaster, (form_master) => form_master.patient_responses)
    formMaster: FormMaster;

    @ManyToOne(() => FormFields, (form_fields) => form_fields.patient_responses)
    formFields: FormFields;

    @ManyToOne(() => Session, (session) => session.patient_responses)
    session: Session;
}