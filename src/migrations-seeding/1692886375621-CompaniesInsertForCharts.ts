import { Logger, MigrationInterface, QueryRunner } from 'typeorm';
import { ValidLegalForms } from './../modules/company/model/company.entity';

import { Company } from '../modules/company/model';
import { ValidCommoditiesSector } from '../modules/company/model/company.entity';
import casual = require('casual');

const countries = {
    AT: 'Austria',
    BE: 'Belgium',
    BG: 'Bulgaria',
    HR: 'Croatia',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    DK: 'Denmark',
    EE: 'Estonia',
    FI: 'Finland',
    FR: 'France',
    DE: 'Germany',
    GR: 'Greece',
    HU: 'Hungary',
    IE: 'Ireland',
    IT: 'Italy',
    LV: 'Latvia',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    MT: 'Malta',
    NL: 'Netherlands',
    PL: 'Poland',
    PT: 'Portugal',
    RO: 'Romania',
    SK: 'Slovakia',
    SI: 'Slovenia',
    ES: 'Spain',
    SE: 'Sweden',
    GB: 'United Kingdom',
};

const bestCountries = {
    BE: 'Belgium',
    FR: 'France',
    DE: 'Germany',
    IT: 'Italy',
    ES: 'Spain',
};

function getCountry(index: number): string {
    if (index * 2 + 1 <= Object.keys(countries).length * 2)
        return Object.keys(countries)[index];
    else {
        const countryKeys = Object.keys(bestCountries);
        const randomIndex = Math.floor(Math.random() * countryKeys.length);
        return countryKeys[randomIndex];
    }
}

function randomLegalForms() {
    const values = Object.keys(ValidLegalForms);
    const randomIndex = Math.floor(Math.random() * values.length);
    return ValidLegalForms[values[randomIndex] as ValidLegalForms];
}

function randomCommoditiesSector() {
    const values = Object.keys(ValidCommoditiesSector);
    const randomIndex = Math.floor(Math.random() * values.length);
    return ValidCommoditiesSector[
        values[randomIndex] as ValidCommoditiesSector
    ];
}

function generateRandomVatNumber() {
    const min = 10000000000;
    const max = 99999999999;
    const randomPIVA = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomPIVA.toString();
}

function getMockedCompany(index: number): Company {
    const company = new Company();
    const country = getCountry(index);
    const vatNumber = generateRandomVatNumber();
    const legalForm = randomLegalForms();
    const commoditiesSector = randomCommoditiesSector();
    company.name = 'Company ' + index.toString();
    company.vatNumber = vatNumber;
    company.codeEori = country + vatNumber;
    company.businessName = 'Company ' + index.toString() + ' ' + legalForm;
    company.legalForm = legalForm;
    company.legalResidence =
        casual.street + ', ' + casual.city + ', ' + country;
    company.commoditiesSector = commoditiesSector;
    return company;
}

class SilentLogger implements Logger {
    logQuery() {
        /* do nothing */
    }

    logQueryError() {
        /* do nothing */
    }

    logQuerySlow() {
        /* do nothing */
    }

    logSchemaBuild() {
        /* do nothing */
    }

    logMigration() {
        /* do nothing */
    }

    log() {
        /* do nothing */
    }
}

export class CompaniesInsertForCharts1692886375621
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
        const prevLogger = queryRunner.connection.logger;
        queryRunner.connection.logger = new SilentLogger();
        try {
            const companiesRepo = queryRunner.manager.getRepository(Company);
            const recordNumber = 304;

            const generated: Company[] = [];
            for (let i = 4; i < recordNumber; i++) {
                const mockedDossier = getMockedCompany(i);
                generated.push(mockedDossier);
            }
            while (generated.length > 1) {
                const company = generated.splice(0, 1)[0];
                await companiesRepo.save(company);
            }
            queryRunner.connection.logger = prevLogger;
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`DELETE FROM companies`);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }
}
