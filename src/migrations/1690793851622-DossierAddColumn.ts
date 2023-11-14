import { MigrationInterface, QueryRunner } from 'typeorm';

export class DossierAddColumn1690793851622 implements MigrationInterface {
    name = 'DossierAddColumn1690793851622';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD "customsClearaceDate" TIMESTAMP`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP COLUMN "customsClearaceDate"`
        );
    }
}
