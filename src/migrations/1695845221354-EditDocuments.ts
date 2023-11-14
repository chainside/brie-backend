import { MigrationInterface, QueryRunner } from "typeorm"

export class EditDocuments1695845221354 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" ALTER COLUMN "file" DROP NOT NULL`
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" ALTER COLUMN "file" SET NOT NULL`
        );

    }

}
