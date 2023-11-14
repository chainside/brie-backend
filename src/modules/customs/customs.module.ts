import { Module } from '@nestjs/common';
import { CommonModule } from '../common';

import { CustomsScheduler } from './service/customs.scheduler';

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
    providers: [CustomsScheduler],
})
export class CustomsModule {}
