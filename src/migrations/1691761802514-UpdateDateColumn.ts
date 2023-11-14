import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDateColumn1691761802514 implements MigrationInterface {
    name = 'UpdateDateColumn1691761802514';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tokens" RENAME COLUMN "creationDate" TO "creation_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents_draft" ADD "upload_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "creation_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "customsClearaceDate"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "customsClearaceDate" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "request_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "request_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "pickup_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "pickup_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "expected_delivery_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "expected_delivery_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "delivery_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "delivery_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "payment_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "payment_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "ddt_approve_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "ddt_approve_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "closing_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "closing_date" TIMESTAMP WITH TIME ZONE DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" DROP COLUMN "creation_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" ADD "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "upload_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "upload_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "upload_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "upload_date" TIMESTAMP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" DROP COLUMN "creation_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" ADD "creation_date" TIMESTAMP NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "closing_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "closing_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "ddt_approve_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "ddt_approve_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "payment_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "payment_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "delivery_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "delivery_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "expected_delivery_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "expected_delivery_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "pickup_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "pickup_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "request_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "request_date" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "customsClearaceDate"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "customsClearaceDate" TIMESTAMP`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "creation_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "creation_date" TIMESTAMP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "documents_draft" DROP COLUMN "upload_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" RENAME COLUMN "creation_date" TO "creationDate"`
        );
    }
}
