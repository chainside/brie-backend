import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocsTables1691750206305 implements MigrationInterface {
    name = 'CreateDocsTables1691750206305';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "size" integer NOT NULL, "type" character varying NOT NULL, "file" text NOT NULL, "state" character varying NOT NULL, "mimetype" character varying NOT NULL, "phase" character varying NOT NULL, "upload_date" TIMESTAMP NOT NULL, "dossierId" uuid, "uploaderId" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "documents_draft" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "size" integer NOT NULL, "type" character varying NOT NULL, "file" text NOT NULL, "mimetype" character varying NOT NULL, CONSTRAINT "PK_0be203dc3e3265d01064f786a61" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD CONSTRAINT "FK_DocumentDossier" FOREIGN KEY ("dossierId") REFERENCES "dossier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD CONSTRAINT "FK_DocumentCompany" FOREIGN KEY ("uploaderId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" DROP CONSTRAINT "FK_DocumentCompany"`
        );
        await queryRunner.query(
            `ALTER TABLE "documents" DROP CONSTRAINT "FK_DocumentDossier"`
        );
        await queryRunner.query(`DROP TABLE "documents_draft"`);
        await queryRunner.query(`DROP TABLE "documents"`);
    }
}
