import { MigrationInterface, QueryRunner } from 'typeorm';

export class VATCalculateFieldsDossier1691154177490
    implements MigrationInterface
{
    name = 'VATCalculateFieldsDossier1691154177490';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "amount_vat" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "payment_date" TIMESTAMP`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "amount_vat"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "payment_date"`
        );
    }
}
