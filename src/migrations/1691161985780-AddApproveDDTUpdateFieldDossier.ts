import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApproveDDTUpdateFieldDossier1691161985780
    implements MigrationInterface
{
    name = 'AddApproveDDTUpdateFieldDossier1691161985780';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "ddt_approve_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "provider" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "closing_date" TIMESTAMP`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "closing_date"`
        );
        await queryRunner.query(`ALTER TABLE "dossier" DROP COLUMN "provider"`);
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "ddt_approve_date"`
        );
    }
}
