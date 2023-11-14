import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfirmDeliveredFieldsDossier1691070765156
    implements MigrationInterface
{
    name = 'ConfirmDeliveredFieldsDossier1691070765156';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "delivery_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "compliance" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "note" character varying(50)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossier" DROP COLUMN "note"`);
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "compliance"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "delivery_date"`
        );
    }
}
