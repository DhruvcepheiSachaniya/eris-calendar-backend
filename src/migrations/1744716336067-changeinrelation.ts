import { MigrationInterface, QueryRunner } from "typeorm";

export class Changeinrelation1744716336067 implements MigrationInterface {
    name = 'Changeinrelation1744716336067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_c3139095d3532fc7bbe0e9470a0"`);
        await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "patientId" TO "buffer_used"`);
        await queryRunner.query(`CREATE TABLE "session_patients_patient_master" ("sessionId" integer NOT NULL, "patientMasterId" integer NOT NULL, CONSTRAINT "PK_610a15af555944705142b47e15d" PRIMARY KEY ("sessionId", "patientMasterId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71d7f51c105fe2e7444488dc0e" ON "session_patients_patient_master" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c07463667b030cf5956d332bc" ON "session_patients_patient_master" ("patientMasterId") `);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "buffer_used"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "buffer_used" boolean`);
        await queryRunner.query(`ALTER TABLE "session_patients_patient_master" ADD CONSTRAINT "FK_71d7f51c105fe2e7444488dc0ec" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "session_patients_patient_master" ADD CONSTRAINT "FK_3c07463667b030cf5956d332bc1" FOREIGN KEY ("patientMasterId") REFERENCES "patient_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_patients_patient_master" DROP CONSTRAINT "FK_3c07463667b030cf5956d332bc1"`);
        await queryRunner.query(`ALTER TABLE "session_patients_patient_master" DROP CONSTRAINT "FK_71d7f51c105fe2e7444488dc0ec"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "buffer_used"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "buffer_used" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c07463667b030cf5956d332bc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71d7f51c105fe2e7444488dc0e"`);
        await queryRunner.query(`DROP TABLE "session_patients_patient_master"`);
        await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "buffer_used" TO "patientId"`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_c3139095d3532fc7bbe0e9470a0" FOREIGN KEY ("patientId") REFERENCES "patient_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
