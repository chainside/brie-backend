import { MigrationInterface, QueryRunner } from 'typeorm';

export class DDTUploadFieldsDossier1691077705232 implements MigrationInterface {
    name = 'DDTUploadFieldsDossier1691077705232';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "request_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "request_type" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "request_detail" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "requester" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "transportation_mode" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "carrier_name" character varying(50)`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "carrier_VAT" character varying(11)`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "pickup_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "expected_delivery_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "pickup_address" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "destination_address" character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "destination_address"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "pickup_address"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "expected_delivery_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "pickup_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "carrier_VAT"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "carrier_name"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "transportation_mode"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "requester"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "request_detail"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "request_type"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "request_date"`
        );
    }
}
