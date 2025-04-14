import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_details')
export class UserDetails {
    @PrimaryGeneratedColumn()
    id: number;

    //relations --> user_master
    @Column({ nullable: true})
    empCode: string;

    @Column({ nullable: true })
    img_Url: string;
}