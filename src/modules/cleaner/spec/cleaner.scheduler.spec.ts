import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationModule } from '../../app.module';
import { CleanerScheduler } from '../service/cleaner.scheduler';
import { initDataBase } from '../../../test/db-test';

describe('Dossier API', () => {
    let app: INestApplication;
    let cleanerScheduler: CleanerScheduler;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        await app.init();
        await initDataBase(app);
        cleanerScheduler = app.get<CleanerScheduler>(CleanerScheduler);
    });
    afterAll(async () => {
        await app.close();
    });
    it('1 - Should clearDocumentDraftTable', async () => {
        const res = await cleanerScheduler.clearDocumentDraftTable();
        expect(res).toBeUndefined();
    });
});
