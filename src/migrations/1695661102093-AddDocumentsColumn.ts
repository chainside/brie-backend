import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDocumentsColumn1695661102093 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "process_id" TEXT`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "message_id" TEXT`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "tx_id" TEXT`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD "ipfs_link" TEXT`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "process_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "message_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "tx_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" DROP COLUMN "ipfs_link"`
        );
    }

}
