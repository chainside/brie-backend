import { MigrationInterface, QueryRunner } from 'typeorm';
import { Dossier } from '../modules/dossier/model';
import { Company } from '../modules/company/model';
import {
    ValidCategories,
    ValidPhases,
    ValidStates,
} from '../modules/dossier/model/dossier.entity';

export class DossierInsertTable1689705313896 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();

        try {
            const dossierRepo = queryRunner.connection.getRepository(Dossier);
            const companiesRepo = queryRunner.connection.getRepository(Company);
            const companies = await companiesRepo.find();
            await dossierRepo.insert([
                {
                    creationDate: new Date(),
                    amount: 11,
                    phase: ValidPhases.START,
                    state: ValidStates.WAIT_APPR,
                    company: companies[0],
                    transfereeCompany: companies[1],
                    category: ValidCategories.APP_CONTROL,
                    parcels: 110,
                    ton: 2500,
                },
                {
                    creationDate: new Date(),
                    amount: 12,
                    phase: ValidPhases.START,
                    state: ValidStates.WAIT_APPR,
                    company: companies[0],
                    transfereeCompany: companies[1],
                    category: ValidCategories.AGRI_PROD,
                    parcels: 110,
                    ton: 2500,
                },
                {
                    creationDate: new Date(),
                    amount: 13,
                    phase: ValidPhases.START,
                    state: ValidStates.WAIT_APPR,
                    company: companies[0],
                    transfereeCompany: companies[1],
                    category: ValidCategories.AGRI_PROD,
                    parcels: 110,
                    ton: 2500,
                },
                {
                    creationDate: new Date(),
                    amount: 14,
                    phase: ValidPhases.START,
                    state: ValidStates.WAIT_APPR,
                    company: companies[0],
                    transfereeCompany: companies[1],
                    category: ValidCategories.AGRI_PROD,
                    parcels: 110,
                    ton: 2500,
                },
                {
                    creationDate: new Date(),
                    amount: 15,
                    phase: ValidPhases.START,
                    state: ValidStates.WAIT_APPR,
                    company: companies[0],
                    transfereeCompany: companies[1],
                    category: ValidCategories.AGRI_PROD,
                    parcels: 110,
                    ton: 2500,
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
