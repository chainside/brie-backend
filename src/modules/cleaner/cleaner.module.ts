import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { CleanerScheduler } from './service/cleaner.scheduler';
import { DossierModule } from '../dossier/dossier.module';
import { CompanyModule } from '../company/company.module';
import { DocumentModule } from '../document/document.module';
import { DocumentDraftModule } from '../document.draft/document.draft.module';

@Module({
    imports: [
        CommonModule,
        DossierModule,
        CompanyModule,
        DocumentModule,
        DocumentDraftModule,
    ],
    providers: [CleanerScheduler],
})
export class CleanerModule {}
