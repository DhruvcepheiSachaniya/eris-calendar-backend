import { MigrationInterface, QueryRunner } from "typeorm";

export class Firstmigration1744627928491 implements MigrationInterface {
    name = 'Firstmigration1744627928491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_details" ("id" SERIAL NOT NULL, "empCode" character varying, "img_Url" character varying, CONSTRAINT "PK_fb08394d3f499b9e441cab9ca51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaign" ("id" SERIAL NOT NULL, "name" character varying, "description" character varying, "campaign_img" character varying, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."session_status_enum" AS ENUM('Scheduled', 'Started', 'Continued', 'Ended')`);
        await queryRunner.query(`CREATE TABLE "session" ("id" SERIAL NOT NULL, "date" TIMESTAMP, "start_time" TIMESTAMP, "end_time" TIMESTAMP, "camp_executed" character varying, "dr_kit_delivered" character varying, "status" "public"."session_status_enum" DEFAULT 'Scheduled', "select_reson" character varying, "dr_code" character varying, "empCode" character varying, "campaignId" integer, "patientId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_master" ("id" SERIAL NOT NULL, "patient_code" character varying, "patient_name" character varying, "patient_age" integer, "patient_gender" character varying, "prescription_img" character varying, "report_img" character varying, "sync_status" TIMESTAMP, "patient_email" character varying, "patient_phone" character varying, "patient_sign" character varying, "dr_Code" character varying, CONSTRAINT "PK_fce3acc246223c2ae86492a6c66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_a61e11010443be4cbf53217dd22" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_c3139095d3532fc7bbe0e9470a0" FOREIGN KEY ("patientId") REFERENCES "patient_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_c3139095d3532fc7bbe0e9470a0"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_a61e11010443be4cbf53217dd22"`);
        await queryRunner.query(`DROP TABLE "patient_master"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TYPE "public"."session_status_enum"`);
        await queryRunner.query(`DROP TABLE "campaign"`);
        await queryRunner.query(`DROP TABLE "user_details"`);
    }

}
