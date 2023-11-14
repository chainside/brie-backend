import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationModule } from '../../app.module';
import { CustomsScheduler } from '../service/customs.scheduler';
import { initDataBase } from '../../../test/db-test';
describe('Dossier API', () => {
    let app: INestApplication;

    let customScheduler: CustomsScheduler;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        await app.init();
        await initDataBase(app);

        customScheduler = app.get<CustomsScheduler>(CustomsScheduler);
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should approveCustomsClearance', async () => {
        const res = await customScheduler.approveCustomsClearance();
        expect(res).toBeUndefined();
    });

    it('2 - Should approveDDT', async () => {
        const res = await customScheduler.approveDDT();
        expect(res).toBeUndefined();
    });

    it('2 - Should approve closing', async () => {
        const res = await customScheduler.approveClosing();
        expect(res).toBeUndefined();
    });
});
