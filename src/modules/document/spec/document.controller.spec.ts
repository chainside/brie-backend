import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { ApplicationModule } from '../../app.module';
import { Dossier } from '../../dossier/model';
import { initDataBase } from '../../../test/db-test';

describe('Document Controller', () => {
    let app: INestApplication;
    let dossierRepository: Repository<Dossier>;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        await app.init();
        await initDataBase(app);
        dossierRepository = app.get(getRepositoryToken(Dossier));
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should find a Document by ID Dossier', async () => {
        const idDossier = (await dossierRepository.find())[0].id;
        await request(app.getHttpServer())
            .get('/document/' + idDossier)
            .send()
            .expect(HttpStatus.OK);
    });
});
