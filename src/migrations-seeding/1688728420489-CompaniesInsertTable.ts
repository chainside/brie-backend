import { MigrationInterface, QueryRunner } from 'typeorm';
import { Company } from '../modules/company/model';
import {
    ValidCommoditiesSector,
    ValidLegalForms,
} from '../modules/company/model/company.entity';

export class CompaniesInsertTable1688728420489 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();

        try {
            const companiesRepo = queryRunner.connection.getRepository(Company);
            await companiesRepo.insert([
                {
                    name: 'Company1',
                    vatNumber: '12345678901',
                    codeEori: 'IT12345678901',
                    businessName: 'Company 1 srl',
                    legalForm: ValidLegalForms.SRL,
                    legalResidence: 'Via Roma 1, Torino, IT',
                    commoditiesSector:
                        ValidCommoditiesSector.AGRICULTURAL_PRODS,
                },
                {
                    name: 'Company2',
                    vatNumber: '12345678902',
                    codeEori: 'DE12345678902',
                    businessName: 'Company2 srl',
                    legalForm: ValidLegalForms.SSRL,
                    legalResidence: 'Rosenstrasse 15 , Berlin, DE',
                    commoditiesSector: ValidCommoditiesSector.COMM_EQUIP,
                },
                {
                    name: 'Company3',
                    vatNumber: '12345678903',
                    codeEori: 'FR12345678903',
                    businessName: 'Company3 srl',
                    legalForm: ValidLegalForms.SAPA,
                    legalResidence: 'Rue de la Paix 25, Paris, FR',
                    commoditiesSector:
                        ValidCommoditiesSector.COMP_CONTROL_EQUIP,
                },
            ]);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction(); // Annulla la transazione in caso di errore
            throw err;
        }
    }

    down(): Promise<unknown> {
        throw new Error('Method not implemented.');
    }
}
