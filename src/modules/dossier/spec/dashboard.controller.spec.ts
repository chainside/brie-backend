import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { ApplicationModule } from '../../app.module';

import { addDraftDoc, initDataBase } from '../../../test/db-test';
describe('Dossier API', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        app.use(cookieParser());
        await app.init();
        await initDataBase(app);
        await addDraftDoc(app);
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should get a dashboard data', async () => {
        await request(app.getHttpServer())
            .get('/dashboard')
            .then((res) => {
                expect(res.statusCode).toEqual(HttpStatus.OK);
            });
    });
});
