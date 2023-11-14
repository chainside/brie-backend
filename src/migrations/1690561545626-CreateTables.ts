import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1690561545626 implements MigrationInterface {
    name = 'CreateTables1690561545626';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "vat_number" character varying(11) NOT NULL, "code_eori" character varying(50) NOT NULL, "business_name" character varying(50) NOT NULL, "legal_form" character varying(50) NOT NULL, "legal_residence" character varying(50) NOT NULL, "commodities_sector" character varying(50) NOT NULL, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "dossier" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creation_date" TIMESTAMP NOT NULL, "category" character varying NOT NULL, "amount" integer NOT NULL, "phase" character varying NOT NULL, "state" character varying NOT NULL, "parcels" integer NOT NULL, "ton" integer NOT NULL, "companyId" uuid, "transfereeCompanyId" uuid, CONSTRAINT "PK_62a60ad7157c2922b57c3319364" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(60) NOT NULL, "companyId" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "expirationDate" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD CONSTRAINT "FK_DossierCompany" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" ADD CONSTRAINT "FK_DossierTransfereeCompany" FOREIGN KEY ("transfereeCompanyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_UserCompany" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "tokens" ADD CONSTRAINT "FK_TokenUser" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tokens" DROP CONSTRAINT "FK_TokenUser"`
        );
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_UserCompany"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP CONSTRAINT "FK_DossierTransfereeCompany"`
        );
        await queryRunner.query(
            `ALTER TABLE "dossier" DROP CONSTRAINT "FK_DossierCompany"`
        );
        await queryRunner.query(`DROP TABLE "tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "dossier"`);
        await queryRunner.query(`DROP TABLE "companies"`);
    }
}
