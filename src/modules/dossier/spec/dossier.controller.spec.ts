import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { ApplicationModule } from '../../app.module';
import { Company } from '../../company/model';
import { DocumentDraft } from '../../document.draft/model';

import { addDraftDoc, initDataBase } from '../../../test/db-test';
import { DossierFilter, DossierInput } from '../model';
import {
    Dossier,
    ValidCategories,
    ValidCompliance,
    ValidPhases,
    ValidStates,
    ValidTransportationMode,
} from '../model/dossier.entity';
import {
    DossierConfirmDeliveredInput,
    DossierDDTInput,
    DossierIdInput,
    DossierUploadVatCompliancedInput,
} from '../model/dossier.input';
import { DossierService } from './../service/dossier.service';
describe('Dossier API', () => {
    let app: INestApplication;
    let companyRepository: Repository<Company>;
    let dossierRepository: Repository<Dossier>;
    let documentsDraftRepository: Repository<DocumentDraft>;
    let token: string;
    let dossierService: DossierService;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        app.use(cookieParser());
        await app.init();
        token = (await initDataBase(app)) || '';

        await addDraftDoc(app);
        dossierRepository = app.get(getRepositoryToken(Dossier));
        companyRepository = app.get(getRepositoryToken(Company));
        documentsDraftRepository = app.get(getRepositoryToken(DocumentDraft));
        dossierService = app.get(DossierService);
    });

    afterAll(async () => {
        await app.close();
    });

    const dossierInsert = {
        creationDate: new Date(),
        amount: 11,
        phase: ValidPhases.START,
        state: ValidStates.WAIT_APPR,
        category: ValidCategories.APP_CONTROL,
        parcels: 110,
        ton: 2500,
    };

    const getIdDossier = async (): Promise<string> =>
        (await dossierRepository.find())[0].id;
    it('1 - Should create a Dossier', async () => {
        const companies = await companyRepository.find();
        const docs = await documentsDraftRepository.find();
        const di: DossierInput = {
            amount: 12,
            company: companies[0].id,
            transfereeCompany: companies[0].id,
            category: ValidCategories.AGRI_PROD,
            parcels: 2345,
            ton: 2345,
            documents: [docs[0].id],
        };
        await request(app.getHttpServer())
            .post('/dossier')
            .set('Cookie', [`jwtToken=${token}`])
            .send(di)
            .then((res) => {
                expect(res.statusCode).toEqual(HttpStatus.CREATED);
            });
    });

    it('2 - Should find dossier with filter', async () => {
        const filters: DossierFilter = {
            skip: 2,
            max: 2,
        };
        await request(app.getHttpServer())
            .post('/dossier/findByFilters')
            .send(filters)
            .expect(HttpStatus.OK);
    });

    it('3 - Should find dossier by id', async () => {
        await request(app.getHttpServer())
            .get('/dossier/' + (await getIdDossier()))
            .send()
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.amount).toStrictEqual(dossierInsert.amount);
                expect(res.body.category).toStrictEqual(dossierInsert.category);
                expect(res.body.parcels).toStrictEqual(dossierInsert.parcels);
                expect(res.body.phase).toStrictEqual(dossierInsert.phase);
                expect(res.body.state).toStrictEqual(dossierInsert.state);
                expect(res.body.ton).toStrictEqual(dossierInsert.ton);
            });
    });

    it('4 - Should Upload DDT', async () => {
        const idDossier = await getIdDossier();
        await addDraftDoc(app);
        const doc = (await documentsDraftRepository.find())[0];
        const input: DossierDDTInput = {
            carrierName: 'name',
            carrierVAT: '01234567890',
            pickupDate: new Date(),
            pickupAddress: 'address, city, country',
            expectedDeliveryDate: new Date(),
            destinationAddress: 'address, city, country',
            transportationMode: ValidTransportationMode.INTERMODAL,
            id: idDossier,
            document: doc.id,
        };
        await request(app.getHttpServer())
            .patch('/dossier/uploadDDT')
            .set('Cookie', [`jwtToken=${token}`])
            .send(input)
            .then((res) => {
                expect(res.status).toEqual(HttpStatus.OK);
            });
    });

    it('5 - Should Confirm Delivered', async () => {
        const idDossier = await getIdDossier();
        await addDraftDoc(app);
        const doc = (await documentsDraftRepository.find())[0];
        const input: DossierConfirmDeliveredInput = {
            compliance: ValidCompliance.OK,
            deliveredDate: new Date(),
            note: 'notetest',
            id: idDossier,
            document: doc.id,
        };
        await request(app.getHttpServer())
            .patch('/dossier/confirmDelivered')
            .set('Cookie', [`jwtToken=${token}`])
            .send(input)
            .then((res) => {
                expect(res.status).toEqual(HttpStatus.OK);
            });
    });

    it('6 - Should upload vat compliance', async () => {
        const idDossier = await getIdDossier();
        await addDraftDoc(app);
        const doc = (await documentsDraftRepository.find())[0];
        await dossierService.approveDDT();
        const input: DossierUploadVatCompliancedInput = {
            amountVAT: 2143,
            paymentDate: new Date(),
            id: idDossier,
            document: doc.id,
        };
        await request(app.getHttpServer())
            .patch('/dossier/uploadVatCompliance')
            .set('Cookie', [`jwtToken=${token}`])
            .send(input)
            .then((res) => {
                expect(res.status).toEqual(HttpStatus.OK);
            });
    });

    it('7 - Should integrate new doc', async () => {
        const idDossier = await getIdDossier();
        await addDraftDoc(app);
        const doc = (await documentsDraftRepository.find())[0];
        const input: DossierIdInput = {
            id: idDossier,
            document: doc.id,
        };
        await request(app.getHttpServer())
            .patch('/dossier/intDocs')
            .set('Cookie', [`jwtToken=${token}`])
            .send(input)
            .then((res) => {
                expect(res.status).toEqual(HttpStatus.OK);
            });
    });
});
