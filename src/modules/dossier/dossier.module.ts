import { Module } from '@nestjs/common';

import { CommonModule } from '../common';
import { DossierController } from './controller';

import { AuthModule } from '../common/auth.module';
import { DossierService } from './service';
import { DocumentDraftModule } from '../document.draft/document.draft.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dossier } from './model';
import { CompanyModule } from '../company/company.module';
import { DossierRepository } from './service/dossier.repository';
import { DashboardController } from './controller/dashboard.controller';
import { DocumentModule } from '../document/document.module';

@Module({
    imports: [
        CommonModule,
        AuthModule,
        DocumentModule,
        DocumentDraftModule,
        CompanyModule,
        TypeOrmModule.forFeature([Dossier]),
    ],
    providers: [DossierRepository, DossierService],
    controllers: [DossierController, DashboardController],
    exports: [TypeOrmModule, DossierRepository, DossierService],
})
export class DossierModule {}
