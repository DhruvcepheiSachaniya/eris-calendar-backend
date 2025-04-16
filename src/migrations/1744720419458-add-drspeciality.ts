import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDrspeciality1744720419458 implements MigrationInterface {
    name = 'AddDrspeciality1744720419458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "dr_speciality" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "dr_speciality"`);
    }

}
