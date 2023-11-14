import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedFileType1692364033446 implements MigrationInterface {
    name = 'ChangedFileType1692364033446';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "file"`);
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "file" bytea NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "documents_draft" DROP COLUMN "file"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents_draft" ADD "file" bytea NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents_draft" DROP COLUMN "file"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents_draft" ADD "file" text NOT NULL`
        );
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "file"`);
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "file" text NOT NULL`
        );
    }
}
