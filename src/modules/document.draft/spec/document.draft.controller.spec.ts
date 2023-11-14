import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initDataBase } from '../../../test/db-test';

import * as request from 'supertest';
import { ApplicationModule } from '../../app.module';
import { ValidDocTypes } from '../../document/model/document.entity';

describe('DocumentDraft Controller', () => {
    let app: INestApplication;
    let token: string;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        await app.init();
        await initDataBase(app);
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should create a DocumentDraft', async () => {
        await request(app.getHttpServer())
            .post('/document-draft')
            .set('Cookie', [`jwtToken=${token}`])
            .set('Content-Type', 'multipart/form-data')
            .field('type', ValidDocTypes.BILL) // Add any fields you need
            .attach('file', './src/test/test.pdf', {
                filename: 'test.pdf',
                contentType: 'application/pdf',
            })
            .then((res) => {
                expect(res.statusCode).toEqual(HttpStatus.CREATED);
            });
    });
});
