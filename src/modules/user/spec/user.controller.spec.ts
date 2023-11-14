import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { initDataBase } from '../../../test/db-test';
import { ApplicationModule } from '../../app.module';
import { Company } from '../../company/model';
import { UserInput } from '../model';

describe('User Controller', () => {
    let app: INestApplication;
    let companyRepository: Repository<Company>;
    let token: string;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        app.use(cookieParser());
        await app.init();
        token = (await initDataBase(app)) || '';
        companyRepository = app.get(getRepositoryToken(Company));
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should create a User', async () => {
        const companies = await companyRepository.find();
        const ui: UserInput = {
            firstName: 'John2',
            password: 'passwordTest',
            lastName: 'Doe2',
            email: 'john.doe2@gmail.com',
            company: companies[0].id,
        };
        await request(app.getHttpServer())
            .post('/user')
            .send(ui)
            .expect(HttpStatus.CREATED);
    });

    it('2 - Should test login', async () => {
        await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: 'john.doe@gmail.com',
                password: 'password1',
                remember: true,
            })
            .expect(HttpStatus.OK);
    });

    it('3 - Should test checkAuth', async () => {
        await request(app.getHttpServer())
            .get('/user/checkAuth')
            .set('Cookie', [`jwtToken=${token}`])
            .send()
            .expect(HttpStatus.OK);
    });
});
