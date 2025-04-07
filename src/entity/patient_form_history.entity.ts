import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('patient_form_history')
export class PatientFormHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    smoking: boolean; //yes or no

    @Column({ nullable: true })
    alcohol: boolean; //yes or no

    @Column({ nullable: true })
    hypertension: boolean; //yes or no

    @Column({ nullable: true })
    diabetes_mellitus: boolean; //yes or no

    @Column({ nullable: true })
    family_hypertension: boolean; //yes or no

    @Column({ nullable: true })
    family_diabetes_mellitus: boolean; //yes or no

    @Column({ nullable: true })
    month_of_pregnancy: number;

}