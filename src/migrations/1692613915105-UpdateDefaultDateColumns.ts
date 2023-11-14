import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultDateColumns1692613915105
    implements MigrationInterface
{
    name = 'UpdateDefaultDateColumns1692613915105';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "customsClearaceDate" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "request_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "pickup_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "expected_delivery_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "delivery_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "payment_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "ddt_approve_date" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "closing_date" DROP DEFAULT`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "closing_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "ddt_approve_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "payment_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "delivery_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "expected_delivery_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "pickup_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "request_date" SET DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ALTER COLUMN "customsClearaceDate" SET DEFAULT now()`
        );
    }
}
