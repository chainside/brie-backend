import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { ApplicationModule } from '../../app.module';
import { initDataBase } from '../../../test/db-test';
import {} from '../../user/model';
import { CompanyInput } from '../model';
import {
    ValidCommoditiesSector,
    ValidLegalForms,
} from '../model/company.entity';

describe('Company API', () => {
    let app: INestApplication;
    let token: string;
    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        app.use(cookieParser());
        await app.init();
        token = await initDataBase(app);
    });

    afterAll(async () => {
        await app.close();
    });

    const ci: CompanyInput = {
        name: 'Company2',
        vatNumber: '12345678901',
        codeEori: 'IT12345678902',
        businessName: 'Company srl',
        legalForm: ValidLegalForms.SRL,
        legalResidence: 'Via Roma 3, Torino, IT',
        commoditiesSector: ValidCommoditiesSector.ORES_METALS_CHEMICALS,
    };

    const filters = {
        businessName: 'Company',
        max: 1,
    };

    it('1 - Should create a Company', async () => {
        await request(app.getHttpServer())
            .post('/company')
            .send(ci)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toMatchObject(ci);
                expect(res.body.id).toBeDefined();
            });
    });

    it('3 - Should find previous company by filter', async () => {
        await request(app.getHttpServer())
            .get('/company/findByBusinessName')
            .set('Cookie', [`jwtToken=${token}`])
            .query(filters)
            .send()
            .expect(HttpStatus.OK);
    });
});
