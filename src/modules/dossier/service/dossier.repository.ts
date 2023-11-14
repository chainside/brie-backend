import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner } from 'typeorm';
import { LoggerService } from '../../common';
import { Company } from '../../company/model';
import { DocumentDraftService } from '../../document.draft/service';
import { UserData } from '../../user/model';
import { DashboardFilter, Dossier, DossierData, DossierInput } from '../model';
import {
    CategoryTrendData,
    TradeQuantityTrendData,
    TradeTrendData,
} from '../model/dashboard.data';
import {
    ValidPhases,
    ValidRequestDetails,
    ValidRequestType,
    ValidStates,
} from '../model/dossier.entity';
import { DossierFilter } from '../model/dossier.filter';
import {
    DossierConfirmDeliveredInput,
    DossierDDTInput,
    DossierIdInput,
    DossierUploadVatCompliancedInput,
} from '../model/dossier.input';
import _ = require('lodash');
import { DocumentService } from '../../document/service';

@Injectable()
export class DossierRepository {
    public constructor(
        @InjectDataSource()
        private readonly datasource: DataSource,

        private readonly documentService: DocumentService,
        private readonly documentDraftService: DocumentDraftService,
        private readonly logger: LoggerService
    ) {}
    private readonly DOGANA: string = 'Dogana';

    public async runInTransaction<T>(
        transaction: (queryRunner: QueryRunner) => T
    ) {
        const queryRunner = this.datasource.createQueryRunner();
        let res: T;
        try {
            await queryRunner.startTransaction();

            res = await transaction(queryRunner);
            await queryRunner.commitTransaction();

            await queryRunner.release();
        } catch (error) {
            this.logger.error(error);
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw new HttpException(
                {
                    message: 'Resource unavailable',
                    statusCode: HttpStatus.CONFLICT,
                },
                HttpStatus.CONFLICT
            );
        }
        return res;
    }

    public async findById(
        id: string,
        queryRunner: QueryRunner,
        lock = false
    ): Promise<Dossier | null> {
        const options: FindOneOptions<Dossier> = {
            where: { id: id },
            relations: { company: true, transfereeCompany: true },
        };

        if (lock) {
            options.lock = {
                mode: 'pessimistic_write',
                onLocked: 'nowait',
                tables: ['dossier'],
            };
            return await queryRunner.manager
                .getRepository(Dossier)
                .findOne(options);
        }

        return await queryRunner.manager
            .getRepository(Dossier)
            .findOne(options);
    }

    public async findByFilters(
        filter: DossierFilter,
        queryRunner: QueryRunner
    ): Promise<DossierData[]> {
        let query = `SELECT dossier.*, company.name as company_name, company.vat_number as company_vat_number,
            company.code_eori as company_code_eori, company.business_name as company_business_name,
            company.legal_form as company_legal_form, company.legal_residence as company_legal_residence,
            company.commodities_sector as company_commodities, transfereeCompany.name as transfereecompany_name, transfereeCompany.vat_number as transfereecompany_vat_number,
            transfereeCompany.code_eori as transfereecompany_code_eori, transfereeCompany.business_name as transfereecompany_business_name,
            transfereeCompany.legal_form as transfereecompany_legal_form, transfereeCompany.legal_residence as transfereecompany_legal_residence,
            transfereeCompany.commodities_sector as transfereecompany_commodities
            FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
            LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
        `;
        let queryWhere = `WHERE `;
        if (
            !_.isUndefined(filter.startCreationDate) &&
            !_.isUndefined(filter.endCreationDate)
        ) {
            queryWhere += `dossier.creation_date BETWEEN '${filter.startCreationDate
                .toISOString()
                .slice(0, -1)}' AND  '${filter.endCreationDate
                .toISOString()
                .slice(0, -1)}'`;
        }

        if (!_.isUndefined(filter.creator)) {
            if (queryWhere.length > 6) {
                queryWhere += ` AND `;
            }
            if (filter.creator[0] !== '!') {
                queryWhere += `company.id = '${filter.creator.trim()}'`;
            } else {
                queryWhere += `NOT company.id = '${filter.creator
                    .trim()
                    .replace('!', '')}'`;
            }
        }

        if (!_.isUndefined(filter.phase)) {
            if (queryWhere.length > 6) {
                queryWhere += ` AND `;
            }
            queryWhere += `phase = '${filter.phase}'`;
        }
        if (!_.isUndefined(filter.state)) {
            if (queryWhere.length > 6) {
                queryWhere += ` AND `;
            }
            queryWhere += `state = '${filter.state}'`;
        }
        if (queryWhere.length > 6) {
            query += queryWhere;
        }

        if (!_.isUndefined(filter.orderBy)) {
            query += ` ORDER BY ${filter.orderBy.column} ${filter.orderBy.direction}`;
        } else {
            query += ` ORDER BY creation_date DESC`;
        }

        if (!_.isUndefined(filter.max)) {
            query += ` LIMIT ${filter.max}`;
        }
        if (!_.isUndefined(filter.skip)) {
            query += ` OFFSET ${filter.skip}`;
        }
        const res = await queryRunner.manager
            .getRepository(Dossier)
            .query(query);
        const result: DossierData[] = [];
        for (const el of res) {
            const company = new Company();
            company.id = el.companyId;
            company.businessName = el.company_business_name;
            company.name = el.company_name;
            company.codeEori = el.company_code_eori;
            company.commoditiesSector = el.company_commodities;
            company.legalForm = el.company_legal_form;
            company.legalResidence = el.company_legal_residence;
            company.vatNumber = el.company_vat_number;

            const transfereeCompany = new Company();
            transfereeCompany.id = el.transfereeCompanyId;
            transfereeCompany.businessName = el.transfereecompany_business_name;
            transfereeCompany.name = el.transfereecompany_name;
            transfereeCompany.codeEori = el.transfereecompany_code_eori;
            transfereeCompany.commoditiesSector =
                el.transfereecompany_commodities;
            transfereeCompany.legalForm = el.transfereecompany_legal_form;
            transfereeCompany.legalResidence =
                el.transfereecompany_legal_residence;
            transfereeCompany.vatNumber = el.transfereecompany_vat_number;
            const dossierData: DossierData = {
                id: el.id,
                creationDate: el.creation_date,
                category: el.category,
                amount: el.amount,
                company: company,
                transfereeCompany: transfereeCompany,
                phase: el.phase,
                state: el.state,
                parcels: el.parcels,
                ton: el.ton,
                deliveredDate: el.delivered_date,
                compliance: el.compliance,
                amountVAT: el.amount_vat,
                paymentDate: el.payment_date,
                ddtApproveDate: el.ddt_approve_date,
                provider: el.provider,
                closingDate: el.closing_date,
                customsClearaceDate: el.customs_clearace_date,
                carrierName: el.carrier_name,
                carrierVAT: el.carrier_vat,
                pickupDate: el.pickup_date,
                pickupAddress: el.pickup_address,
                expectedDeliveryDate: el.expected_delivery_date,
                destinationAddress: el.destination_address,
                transportationMode: el.transportation_mode,
                requestDate: el.request_date,
                requestDetail: el.request_detail,
                requestType: el.request_type,
                requester: el.requester,
                note: el.note,
            };
            result.push(dossierData);
        }
        return result;
    }

    public async create(
        input: DossierInput,
        user: UserData,
        queryRunner: QueryRunner
    ): Promise<Dossier> {
        const dossier = new Dossier();

        dossier.creationDate = new Date();
        dossier.amount = input.amount;
        dossier.phase = ValidPhases.START;
        dossier.state = ValidStates.WAIT_APPR;

        const companyInput = await queryRunner.manager
            .getRepository(Company)
            .findOneBy({
                id: input.company,
            });

        if (_.isNull(companyInput)) {
            throw new HttpException('Company not exist', HttpStatus.NOT_FOUND);
        }

        dossier.company = companyInput;
        const transfereeCompanyInput = await queryRunner.manager
            .getRepository(Company)
            .findOneBy({
                id: input.transfereeCompany,
            });
        if (_.isNull(transfereeCompanyInput)) {
            throw new HttpException('Company not exist', HttpStatus.NOT_FOUND);
        }
        dossier.transfereeCompany = transfereeCompanyInput;
        dossier.category = input.category;
        dossier.parcels = input.parcels;
        dossier.ton = input.ton;

        if (input.documents.length < 1) {
            throw new HttpException(
                'Documents are empty',
                HttpStatus.NOT_FOUND
            );
        }
        const newDossier = await queryRunner.manager
            .getRepository(Dossier)
            .save(dossier);
        await this.documentDraftService.moveDrafts(
            input.documents,
            newDossier.id,
            user.company?.id || '',
            queryRunner
        );

        return newDossier;
    }

    public async save(dossier: Dossier, queryRunner: QueryRunner) {
        return await queryRunner.manager.getRepository(Dossier).save(dossier);
    }

    public changeState(dossier: Dossier, newState: ValidStates): Dossier {
        dossier.state = newState;
        return dossier;
    }

    public changePhase(dossier: Dossier, newPhase: ValidPhases): Dossier {
        dossier.phase = newPhase;
        return dossier;
    }

    private updateAction(
        dossier: Dossier,
        requestType: ValidRequestType | undefined,
        requestDetails: ValidRequestDetails | undefined
    ): Dossier {
        if (_.isUndefined(requestDetails) || _.isUndefined(requestType)) {
            dossier.requestDate = undefined;
            dossier.requestType = undefined;
            dossier.requestDetail = undefined;
            dossier.requester = undefined;
            dossier.provider = '';
        } else {
            dossier.requestDate = new Date();
            dossier.requestType = requestType;
            dossier.requestDetail = requestDetails;
            dossier.requester = this.getRequester(dossier, requestType);
            dossier.provider = this.getProvider(dossier, requestType);
        }
        return dossier;
    }

    private getRequester(dossier: Dossier, type: ValidRequestType): string {
        switch (type) {
            case ValidRequestType.INT_DOCS:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.company.legalResidence.split(',')[2].trim()
                );
            case ValidRequestType.DDT_REQ:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.company.legalResidence.split(',')[2].trim()
                );
            case ValidRequestType.DELIVERED_CONFIRM:
                return dossier.company.businessName;
            case ValidRequestType.DDT_APPROVE:
                return dossier.transfereeCompany.businessName;
            case ValidRequestType.PAY_CONFIRM:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.transfereeCompany.legalResidence
                        .split(',')[2]
                        .trim()
                );
            case ValidRequestType.JUSTIFY_APPROVE:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.transfereeCompany.legalResidence
                        .split(',')[2]
                        .trim()
                );
            case ValidRequestType.AMEND_REQ:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.transfereeCompany.legalResidence
                        .split(',')[2]
                        .trim()
                );
        }
    }

    private getProvider(dossier: Dossier, type: ValidRequestType): string {
        switch (type) {
            case ValidRequestType.INT_DOCS:
                return dossier.company.businessName;
            case ValidRequestType.DDT_REQ:
                return dossier.company.businessName;
            case ValidRequestType.DELIVERED_CONFIRM:
                return dossier.transfereeCompany.businessName;
            case ValidRequestType.DDT_APPROVE:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.transfereeCompany.legalResidence
                        .split(',')[2]
                        .trim()
                );
            case ValidRequestType.PAY_CONFIRM:
                return dossier.transfereeCompany.businessName;
            case ValidRequestType.JUSTIFY_APPROVE:
                return (
                    this.DOGANA +
                    ' ' +
                    dossier.transfereeCompany.legalResidence
                        .split(',')[2]
                        .trim()
                );
            case ValidRequestType.AMEND_REQ:
                return dossier.transfereeCompany.businessName;
        }
    }

    public async integrationRequestCustoms(
        id: string,
        queryRunner: QueryRunner
    ): Promise<void> {
        let dossier = await this.findById(id, queryRunner, true);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }
        dossier = this.changeState(dossier, ValidStates.INT_REQ);

        dossier = this.updateAction(
            dossier,
            ValidRequestType.INT_DOCS,
            ValidRequestDetails.CONF_ERR
        );

        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async approveCustomsClearance(
        id: string,
        queryRunner: QueryRunner
    ): Promise<void> {
        let dossier = await this.findById(id, queryRunner, true);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }
        dossier = this.changeState(dossier, ValidStates.CLEARED);

        dossier = this.updateAction(
            dossier,
            ValidRequestType.DDT_REQ,
            ValidRequestDetails.DDT_WAIT
        );

        dossier = this.updateCustomsClearanceDate(dossier);
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private updateCustomsClearanceDate(dossier: Dossier): Dossier {
        dossier.customsClearaceDate = new Date();
        return dossier;
    }

    public async uploadDDT(
        ddt: DossierDDTInput,
        user: UserData,
        queryRunner: QueryRunner
    ): Promise<DossierData> {
        let dossier = await this.findById(ddt.id, queryRunner, true);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }
        dossier.carrierName = ddt.carrierName;
        dossier.carrierVAT = ddt.carrierVAT;
        dossier.expectedDeliveryDate = ddt.expectedDeliveryDate;
        dossier.transportationMode = ddt.transportationMode;
        dossier.pickupAddress = ddt.pickupAddress;
        dossier.pickupDate = ddt.pickupDate;
        dossier.destinationAddress = ddt.destinationAddress;
        dossier = this.changePhase(dossier, ValidPhases.TRANSIT);
        dossier = this.changeState(dossier, ValidStates.TRANSPORT);
        dossier = this.updateAction(
            dossier,
            ValidRequestType.DELIVERED_CONFIRM,
            ValidRequestDetails.DELIVERED
        );
        if (_.isEmpty(ddt.document)) {
            throw new HttpException(
                'Documents are empty',
                HttpStatus.NOT_FOUND
            );
        }
        await this.documentDraftService.moveDrafts(
            ddt.document,
            dossier.id,
            user.company?.id || '',
            queryRunner
        );
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return dossier.buildData();
    }

    public async confirmDelivered(
        confirmDelivered: DossierConfirmDeliveredInput,
        user: UserData,
        queryRunner: QueryRunner
    ): Promise<DossierData> {
        let dossier = await this.findById(
            confirmDelivered.id,
            queryRunner,
            true
        );
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        dossier.deliveredDate = confirmDelivered.deliveredDate;
        dossier.compliance = confirmDelivered.compliance;
        dossier.note = confirmDelivered.note;

        dossier = this.changePhase(dossier, ValidPhases.DELIVERED);
        dossier = this.changeState(dossier, ValidStates.WAIT_APPR);
        dossier = this.updateAction(
            dossier,
            ValidRequestType.DDT_APPROVE,
            ValidRequestDetails.DDT_APPROVE
        );
        if (!_.isEmpty(confirmDelivered.document)) {
            await this.documentDraftService.moveDrafts(
                confirmDelivered.document,
                dossier.id,
                user.company?.id || '',
                queryRunner
            );
        }
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return dossier.buildData();
    }

    public async approveDDT(
        id: string,
        queryRunner: QueryRunner
    ): Promise<void> {
        let dossier = await this.findById(id, queryRunner, true);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }
        dossier = this.changeState(dossier, ValidStates.WAIT_JUST);
        dossier = this.changePhase(dossier, ValidPhases.CLOSE);
        dossier = this.updateAction(
            dossier,
            ValidRequestType.PAY_CONFIRM,
            ValidRequestDetails.CALCULATE_VAT
        );
        dossier = this.updateApproveDDTDate(dossier);
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private updateApproveDDTDate(dossier: Dossier): Dossier {
        dossier.ddtApproveDate = new Date();
        return dossier;
    }

    public async uploadVatCompliance(
        uploadVAT: DossierUploadVatCompliancedInput,
        user: UserData,
        queryRunner: QueryRunner
    ): Promise<DossierData> {
        let dossier = await this.findById(uploadVAT.id, queryRunner);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        dossier.amountVAT = uploadVAT.amountVAT;
        dossier.paymentDate = uploadVAT.paymentDate;

        dossier = this.changePhase(dossier, ValidPhases.CLOSE);
        dossier = this.changeState(dossier, ValidStates.WAIT_APPR);
        dossier = this.updateAction(
            dossier,
            ValidRequestType.JUSTIFY_APPROVE,
            ValidRequestDetails.JUSTIFY_APPROVE
        );
        if (!_.isEmpty(uploadVAT.document)) {
            await this.documentService.deleteDocByDossierAndPhase(dossier);
            await this.documentDraftService.moveDrafts(
                uploadVAT.document,
                dossier.id,
                user.company?.id || '',
                queryRunner
            );
        }
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return dossier.buildData();
    }

    public async intDocs(
        input: DossierIdInput,
        user: UserData,
        queryRunner: QueryRunner
    ): Promise<DossierData> {
        let dossier = await this.findById(input.id, queryRunner);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        dossier = this.changePhase(dossier, ValidPhases.START);
        dossier = this.changeState(dossier, ValidStates.WAIT_APPR);
        dossier = this.updateAction(dossier, undefined, undefined);
        if (!_.isEmpty(input.document)) {
            await this.documentDraftService.moveDrafts(
                input.document,
                dossier.id,
                user.company?.id || '',
                queryRunner
            );
        }
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return dossier.buildData();
    }

    public async rectifyRequest(
        queryRunner: QueryRunner,
        id: string
    ): Promise<void> {
        let dossier = await this.findById(id, queryRunner);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        dossier = this.changeState(dossier, ValidStates.AMEND_REQ);
        dossier = this.changePhase(dossier, ValidPhases.CLOSE);
        dossier = this.updateAction(
            dossier,
            ValidRequestType.AMEND_REQ,
            ValidRequestDetails.NOT_CORRECT_AMOUNT
        );
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async approveClosing(
        queryRunner: QueryRunner,
        id: string
    ): Promise<void> {
        let dossier = await this.findById(id, queryRunner);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        dossier = this.changeState(dossier, ValidStates.CLOSE);
        dossier = this.changePhase(dossier, ValidPhases.CLOSE);
        dossier = this.updateClosingDate(dossier);
        try {
            await this.save(dossier, queryRunner);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private updateClosingDate(dossier: Dossier): Dossier {
        dossier.closingDate = new Date();
        return dossier;
    }

    public async getCountByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<number> {
        let query = `SELECT COUNT(dossier.id) AS count
                FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
                `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
        }
        const res = await queryRunner.manager.query(query);

        return _.toNumber(res[0].count) || 0;
    }

    public async getClosedDossierCountByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<number> {
        let query = `SELECT COUNT(dossier.id) AS count
                FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
                `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
            query += ` AND state ='${ValidStates.CLOSE}' AND phase ='${ValidPhases.CLOSE}' ;`;
        } else {
            query += `WHERE state ='${ValidStates.CLOSE}' AND phase ='${ValidPhases.CLOSE}' ;`;
        }
        const res = await queryRunner.manager.query(query);

        return _.toNumber(res[0].count) || 0;
    }

    public async getDeliveredTotalByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<number> {
        let query = `SELECT SUM(ton) AS sum
                FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
                `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
        }
        const res = await queryRunner.manager.query(query);

        return _.toNumber(res[0].sum) || 0;
    }

    public async getAvgTimeByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<number> {
        let query = `SELECT CEIL(AVG(EXTRACT(DAY FROM (closing_date - creation_date)))) AS avg
        FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
        LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
        `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
            //query += ` AND state ='${ValidStates.CLOSE}';`;
        } else {
            //query += `WHERE state ='${ValidStates.CLOSE}';`;
        }
        const res = await queryRunner.manager.query(query);
        return _.toNumber(res[0].avg) || 0;
    }

    public async getTradeTrendsByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<TradeTrendData[]> {
        let query = `SELECT EXTRACT(EPOCH FROM creation_date::DATE)*1000 AS ms,
                    SUM(1) AS count
                    FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
        `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
        }
        query += `
        GROUP BY  ms
        ORDER BY  ms;`;

        const res = await queryRunner.manager.query(query);
        const arrayRes: TradeTrendData[] = [];
        res.map((el: TradeTrendData) => {
            el.count = _.toNumber(el.count);
            el.ms = _.toNumber(el.ms);
            arrayRes.push(el);
        });
        return res;
    }

    public async getTradeCategoryTrendsByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<CategoryTrendData[]> {
        let subQuery = `SELECT COUNT(dossier.id) AS count
        FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
            LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
                `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            subQuery += this.getWhereByFilters(filter);
        }
        let query = `SELECT category,
                    ROUND(COUNT(*) * 100.0 / (${subQuery}), 2) AS perc
                    FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
        `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
        }

        query += `
        GROUP BY category
        ORDER BY category;`;

        const res = await queryRunner.manager.query(query);
        const arrayRes: CategoryTrendData[] = [];
        res.map((el: CategoryTrendData) => {
            el.perc = _.toNumber(el.perc);
            arrayRes.push(el);
        });
        return res;
    }

    public async getTradeQuantityTrendsByFilters(
        filter: DashboardFilter,
        queryRunner: QueryRunner
    ): Promise<TradeQuantityTrendData[]> {
        let query = `SELECT EXTRACT(EPOCH FROM creation_date::DATE)*1000 AS ms ,
                    SUM(ton) AS count
                    FROM dossier AS dossier LEFT JOIN companies AS company ON company.id="dossier"."companyId"
                    LEFT JOIN companies AS transfereeCompany ON transfereeCompany.id="dossier"."transfereeCompanyId"
        `;
        if (
            !_.isUndefined(filter.startCreationDate) ||
            !_.isUndefined(filter.endCreationDate) ||
            !_.isUndefined(filter.entryCountry) ||
            !_.isUndefined(filter.destinationCountry)
        ) {
            query += this.getWhereByFilters(filter);
        }

        query += `
        GROUP BY ms
        ORDER BY ms;`;

        const res = await queryRunner.manager.query(query);

        res.map((el: TradeQuantityTrendData) => {
            el.count = _.toNumber(el.count);
            el.ms = _.toNumber(el.ms);
        });
        return res;
    }

    private getWhereByFilters(filter: DashboardFilter): string {
        let queryWhere = `WHERE `;
        if (
            !_.isUndefined(filter.startCreationDate) &&
            !_.isUndefined(filter.endCreationDate)
        ) {
            queryWhere += `dossier.creation_date BETWEEN '${new Date(
                filter.startCreationDate
            )
                .toISOString()
                .slice(0, -1)}' AND '${new Date(filter.endCreationDate)
                .toISOString()
                .slice(0, -1)}'`;
        }
        if (!_.isUndefined(filter.entryCountry)) {
            if (queryWhere.length > 6) {
                queryWhere += ` AND `;
            }
            queryWhere += `TRIM(SPLIT_PART(company.legal_residence, ', ', 3)) ILIKE '%${filter.entryCountry.trim()}%'`;
        }

        if (!_.isUndefined(filter.destinationCountry)) {
            if (queryWhere.length > 6) {
                queryWhere += ` AND `;
            }
            if (filter.destinationCountry[0] !== '!') {
                queryWhere += `TRIM(SPLIT_PART(transfereeCompany.legal_residence, ', ', 3)) ILIKE '%${filter.destinationCountry.trim()}%'`;
            }
        }
        return queryWhere;
    }
}
