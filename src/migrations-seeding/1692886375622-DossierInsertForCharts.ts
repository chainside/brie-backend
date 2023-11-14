import { Logger, MigrationInterface, QueryRunner } from 'typeorm';

import * as fs from 'fs';
import { Company } from '../modules/company/model';
import { Document } from '../modules/document/model';
import {
    ValidDocStates,
    ValidDocTypes,
} from '../modules/document/model/document.entity';
import {
    Dossier,
    ValidCategories,
    ValidCompliance,
    ValidPhases,
    ValidRequestDetails,
    ValidRequestType,
    ValidStates,
    ValidTransportationMode,
} from '../modules/dossier/model/dossier.entity';
import * as _ from 'lodash';
import casual = require('casual');

const nameFile = 'test.txt';
const initDateClosedDossier = new Date(2022, 8, 1);
const initDateOpenedDossier = new Date(2023, 7, 15);

function randomCategory() {
    const values = Object.keys(ValidCategories);
    const randomIndex = Math.floor(Math.random() * values.length);
    return ValidCategories[values[randomIndex] as ValidCategories];
}

function randomPhase() {
    const values = Object.keys(ValidPhases);
    const randomIndex = Math.floor(Math.random() * values.length);
    return ValidPhases[values[randomIndex] as ValidPhases];
}

function randomDocType() {
    const values = Object.keys(ValidDocTypes);
    const randomIndex = Math.floor(Math.random() * values.length);
    return ValidDocTypes[values[randomIndex] as ValidDocTypes];
}

function randomCompanyAndTransfereeCompany(companies: Company[]): Company[] {
    if (companies.length < 2) {
        return [companies[0], companies[1]];
    }

    const randomIndex1 = Math.floor(Math.random() * companies.length);
    let randomIndex2 = Math.floor(Math.random() * companies.length);

    while (
        randomIndex2 === randomIndex1 ||
        companies[randomIndex1].legalResidence.split(',')[2] ===
            companies[randomIndex2].legalResidence.split(',')[2]
    ) {
        randomIndex2 = Math.floor(Math.random() * companies.length);
    }

    const randomCompany1 = companies[randomIndex1];
    const randomCompany2 = companies[randomIndex2];

    return [randomCompany1, randomCompany2];
}

function getState(phase: ValidPhases): ValidStates {
    let res: ValidStates = ValidStates.CLOSE;
    switch (phase) {
        case ValidPhases.START:
            if (Math.random() < 0.5) {
                res = ValidStates.CLEARED;
            } else {
                res = ValidStates.WAIT_APPR;
            }
            break;
        case ValidPhases.TRANSIT:
            res = ValidStates.TRANSPORT;
            break;
        case ValidPhases.DELIVERED:
            res = ValidStates.WAIT_APPR;
            break;
        case ValidPhases.CLOSE:
            if (Math.random() < 0.5) {
                res = ValidStates.WAIT_JUST;
            } else {
                res = ValidStates.AMEND_REQ;
            }
            break;
    }
    return res;
}

function getRequester(dossier: Dossier, type: ValidRequestType): string {
    switch (type) {
        case ValidRequestType.INT_DOCS:
            return (
                'DOGANA' +
                ' ' +
                dossier.company.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.DDT_REQ:
            return (
                'DOGANA' +
                ' ' +
                dossier.company.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.DELIVERED_CONFIRM:
            return dossier.company.businessName;
        case ValidRequestType.DDT_APPROVE:
            return dossier.transfereeCompany.businessName;
        case ValidRequestType.PAY_CONFIRM:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.JUSTIFY_APPROVE:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.AMEND_REQ:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
    }
}

function getProvider(dossier: Dossier, type: ValidRequestType): string {
    switch (type) {
        case ValidRequestType.INT_DOCS:
            return dossier.company.businessName;
        case ValidRequestType.DDT_REQ:
            return dossier.company.businessName;
        case ValidRequestType.DELIVERED_CONFIRM:
            return dossier.transfereeCompany.businessName;
        case ValidRequestType.DDT_APPROVE:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.PAY_CONFIRM:
            return dossier.transfereeCompany.businessName;
        case ValidRequestType.JUSTIFY_APPROVE:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
        case ValidRequestType.AMEND_REQ:
            return (
                'DOGANA' +
                ' ' +
                dossier.transfereeCompany.legalResidence.split(',')[2].trim()
            );
    }
}

function updateAction(
    dossier: Dossier,
    requestType: ValidRequestType,
    requestDetails: ValidRequestDetails
): Dossier {
    dossier.requestType = requestType;
    dossier.requestDetail = requestDetails;
    dossier.requester = getRequester(dossier, requestType);
    dossier.provider = getProvider(dossier, requestType);
    return dossier;
}

function addDoc(
    phase: ValidPhases,
    dossier: Dossier,
    uploadDate: Date,
    uploader: Company
) {
    const file = fs.readFileSync('./src/test/' + nameFile);
    const document = new Document();
    document.file = file;
    document.name = nameFile;
    document.size = file.length;
    document.type = randomDocType();
    document.state = ValidDocStates.NOT_NOTARIZED;
    document.mimetype = 'application/pdf';
    document.phase = phase;
    document.dossier = dossier;
    document.uploadDate = uploadDate;
    document.uploader = uploader;
    return document;
}

function getOffsetDate(offset: number): number {
    let offset_tmp = Math.round(Math.random() * (offset + 2 - offset) + offset);
    while (offset > offset_tmp) {
        offset_tmp = Math.round(Math.random() * (offset + 2 - offset) + offset);
    }
    return offset_tmp;
}

function getDateWithOffset(currentDate: Date, offset: number): Date {
    return new Date(currentDate.getTime() + offset * 24 * 60 * 60 * 1000);
}

interface DossierAndDocs {
    dossier: Dossier;
    documentList: Document[];
}

function getMockedDossierAndDocs(
    currentDate: Date,
    companies: Company[],
    stateInit?: ValidStates,
    phaseInit?: ValidPhases
): DossierAndDocs {
    let dossier: Dossier = new Dossier();
    const documentList: Document[] = [];
    let phase: ValidPhases;
    if (!_.isUndefined(phaseInit)) {
        phase = phaseInit;
    } else {
        phase = randomPhase() as ValidPhases;
    }
    let state: ValidStates;
    if (!_.isUndefined(stateInit)) {
        state = stateInit;
    } else {
        state = getState(phase);
    }

    const [randomCompany1, randomCompany2] =
        randomCompanyAndTransfereeCompany(companies);

    const customsClearaceDate = new Date(
        currentDate.getTime() + 1 * 24 * 60 * 60 * 1000
    );
    let offset = Math.round(Math.random() * (4 - 2) + 2);
    const pickupDate = getDateWithOffset(currentDate, offset);
    offset = getOffsetDate(offset);
    const expectedDeliveryDate = getDateWithOffset(currentDate, offset);
    offset = getOffsetDate(offset);
    const requestDate = getDateWithOffset(currentDate, offset);
    offset = getOffsetDate(offset);
    const deliveredDate = getDateWithOffset(currentDate, offset);
    offset = getOffsetDate(offset);
    const paymentDate = getDateWithOffset(currentDate, offset);
    offset = getOffsetDate(offset);
    const ddtApproveDate = getDateWithOffset(currentDate, offset);

    const offsetClosingDate = Math.round(Math.random() * (30 - 7) + 7);
    const closingDate = getDateWithOffset(currentDate, offsetClosingDate);

    dossier.creationDate = currentDate;
    dossier.phase = phase;
    dossier.state = state;
    dossier.requestDate = requestDate;
    dossier.company = randomCompany1;
    dossier.transfereeCompany = randomCompany2;
    dossier.category = randomCategory() as ValidCategories;
    dossier.parcels = Math.round(Math.random() * 100);
    dossier.ton = Math.round(Math.random() * 1000);
    dossier.amount = Math.round(Math.random() * 1000000);
    documentList.push(
        addDoc(ValidPhases.START, dossier, currentDate, dossier.company)
    );
    switch (state) {
        case ValidStates.CLEARED:
            dossier.customsClearaceDate = customsClearaceDate;
            dossier = updateAction(
                dossier,
                ValidRequestType.DDT_REQ,
                ValidRequestDetails.DDT_WAIT
            );
            break;
        case ValidStates.WAIT_APPR:
            switch (phase) {
                case ValidPhases.START:
                    break;
                case ValidPhases.DELIVERED:
                    dossier.customsClearaceDate = customsClearaceDate;
                    dossier.carrierName = 'DHL';
                    dossier.carrierVAT = '12345678901';
                    dossier.expectedDeliveryDate = expectedDeliveryDate;
                    dossier.transportationMode = ValidTransportationMode.PLANE;
                    dossier.pickupAddress = casual.address;
                    dossier.pickupDate = pickupDate;
                    dossier.destinationAddress = casual.address;
                    dossier.deliveredDate = deliveredDate;
                    dossier.compliance = ValidCompliance.OK;
                    dossier.note = '';
                    dossier = updateAction(
                        dossier,
                        ValidRequestType.DDT_APPROVE,
                        ValidRequestDetails.DDT_APPROVE
                    );
                    documentList.push(
                        addDoc(
                            ValidPhases.TRANSIT,
                            dossier,
                            pickupDate,
                            dossier.company
                        )
                    );
                    documentList.push(
                        addDoc(
                            ValidPhases.DELIVERED,
                            dossier,
                            deliveredDate,
                            dossier.transfereeCompany
                        )
                    );
                    break;
                case ValidPhases.CLOSE:
                    dossier.customsClearaceDate = customsClearaceDate;
                    dossier.carrierName = 'DHL';
                    dossier.carrierVAT = '01234567890';
                    dossier.expectedDeliveryDate = expectedDeliveryDate;
                    dossier.transportationMode = ValidTransportationMode.PLANE;
                    dossier.pickupAddress = casual.address;
                    dossier.pickupDate = pickupDate;
                    dossier.destinationAddress = casual.address;
                    dossier.deliveredDate = deliveredDate;
                    dossier.compliance = ValidCompliance.OK;
                    dossier.note = '';
                    dossier.ddtApproveDate = ddtApproveDate;
                    dossier.amountVAT = Math.round(Math.random() * 100);
                    dossier.paymentDate = paymentDate;
                    documentList.push(
                        addDoc(
                            ValidPhases.TRANSIT,
                            dossier,
                            pickupDate,
                            dossier.company
                        )
                    );
                    documentList.push(
                        addDoc(
                            ValidPhases.DELIVERED,
                            dossier,
                            deliveredDate,
                            dossier.transfereeCompany
                        )
                    );
                    documentList.push(
                        addDoc(
                            ValidPhases.CLOSE,
                            dossier,
                            paymentDate,
                            dossier.transfereeCompany
                        )
                    );
                    dossier = updateAction(
                        dossier,
                        ValidRequestType.JUSTIFY_APPROVE,
                        ValidRequestDetails.JUSTIFY_APPROVE
                    );
                    break;
            }
            break;
        case ValidStates.TRANSPORT:
            dossier.customsClearaceDate = customsClearaceDate;
            dossier.carrierName = 'DHL';
            dossier.carrierVAT = '01234567890';
            dossier.expectedDeliveryDate = expectedDeliveryDate;
            dossier.transportationMode = ValidTransportationMode.PLANE;
            dossier.pickupAddress = casual.address;
            dossier.pickupDate = pickupDate;
            dossier.destinationAddress = casual.address;
            dossier = updateAction(
                dossier,
                ValidRequestType.DELIVERED_CONFIRM,
                ValidRequestDetails.DELIVERED
            );
            documentList.push(
                addDoc(
                    ValidPhases.TRANSIT,
                    dossier,
                    pickupDate,
                    dossier.company
                )
            );
            break;
        case ValidStates.WAIT_JUST:
            dossier.customsClearaceDate = customsClearaceDate;
            dossier.carrierName = 'DHL';
            dossier.carrierVAT = '01234567890';
            dossier.expectedDeliveryDate = expectedDeliveryDate;
            dossier.transportationMode = ValidTransportationMode.PLANE;
            dossier.pickupAddress = casual.address;
            dossier.pickupDate = pickupDate;
            dossier.destinationAddress = casual.address;
            dossier.deliveredDate = deliveredDate;
            dossier.compliance = ValidCompliance.OK;
            dossier.note = '';
            dossier.ddtApproveDate = ddtApproveDate;
            dossier = updateAction(
                dossier,
                ValidRequestType.PAY_CONFIRM,
                ValidRequestDetails.CALCULATE_VAT
            );
            break;
        case ValidStates.CLOSE:
            dossier.customsClearaceDate = customsClearaceDate;
            dossier.carrierName = 'DHL';
            dossier.carrierVAT = '01234567890';
            dossier.expectedDeliveryDate = expectedDeliveryDate;
            dossier.transportationMode = ValidTransportationMode.PLANE;
            dossier.pickupAddress = casual.address;
            dossier.pickupDate = pickupDate;
            dossier.destinationAddress = casual.address;
            dossier.deliveredDate = deliveredDate;
            dossier.compliance = ValidCompliance.OK;
            dossier.note = '';
            dossier.ddtApproveDate = ddtApproveDate;
            dossier.amountVAT = Math.round(Math.random() * dossier.amount);
            dossier.paymentDate = paymentDate;
            dossier.closingDate = closingDate;
            documentList.push(
                addDoc(
                    ValidPhases.TRANSIT,
                    dossier,
                    pickupDate,
                    dossier.company
                )
            );
            documentList.push(
                addDoc(
                    ValidPhases.DELIVERED,
                    dossier,
                    deliveredDate,
                    dossier.transfereeCompany
                )
            );
            documentList.push(
                addDoc(
                    ValidPhases.CLOSE,
                    dossier,
                    paymentDate,
                    dossier.transfereeCompany
                )
            );
            break;
    }
    return { dossier, documentList };
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

export class DossierInsertForCharts1692886375622 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
        const prevLogger = queryRunner.connection.logger;
        queryRunner.connection.logger = new SilentLogger();
        try {
            const dossierRepo = queryRunner.manager.getRepository(Dossier);
            const companiesRepo = queryRunner.manager.getRepository(Company);
            const documentRepo = queryRunner.manager.getRepository(Document);
            const companies = await companiesRepo.find();
            let initialDate = initDateClosedDossier
            let currentDate = new Date(initialDate.getTime());
            const recordNumberClosedDossier = 4900;
            const recordNumberOpenDossier = 100;

            let dateInterval = 348 / recordNumberClosedDossier;
            const generated: DossierAndDocs[] = [];
            for (let i = 0; i < recordNumberClosedDossier; i++) {
                const mockedDossier = getMockedDossierAndDocs(
                    currentDate,
                    companies,
                    ValidStates.CLOSE,
                    ValidPhases.CLOSE
                );
                generated.push(mockedDossier);
                currentDate = new Date(
                    currentDate.setTime(
                        currentDate.getTime() +
                            dateInterval * 24 * 60 * 60 * 1000
                    )
                );
            }
            initialDate = initDateOpenedDossier
            currentDate = new Date(initialDate.getTime());
            dateInterval = 31 / recordNumberClosedDossier;
            for (let i = 0; i < recordNumberOpenDossier; i++) {
                const mockedDossier = getMockedDossierAndDocs(
                    currentDate,
                    companies
                );
                generated.push(mockedDossier);
                currentDate = new Date(
                    currentDate.setTime(
                        currentDate.getTime() +
                            dateInterval * 24 * 60 * 60 * 1000
                    )
                );
            }
            while (generated.length > 1) {
                const dossierAndDocs = generated.splice(0, 1)[0];
                const dossierMocked = dossierAndDocs.dossier;
                await dossierRepo.save(dossierMocked);
                const docList = dossierAndDocs.documentList;
                for (const doc of docList) {
                    await documentRepo.save(doc);
                }
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
            await queryRunner.query(`DELETE FROM documents`);
            await queryRunner.query(`DELETE FROM dossier`);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }
}
