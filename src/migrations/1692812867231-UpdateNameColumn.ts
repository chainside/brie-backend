import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNameColumn1692812867231 implements MigrationInterface {
    name = 'UpdateNameColumn1692812867231';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" RENAME COLUMN "customsClearaceDate" TO "customs_clearace_date"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" RENAME COLUMN "customs_clearace_date" TO "customsClearaceDate"`
        );
    }
}
