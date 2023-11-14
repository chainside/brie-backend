import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common';
import { DocumentController } from './controller';
import { Document } from './model';
import { DocumentService } from './service';
import { AuthModule } from '../common/auth.module';
import { DossierModule } from '../dossier/dossier.module';
import { CompanyModule } from '../company/company.module';
import {DocumentsRepository} from "./service/documents.repository";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [
        CommonModule,
        AuthModule,
        CompanyModule,
        forwardRef(() => DossierModule),
        TypeOrmModule.forFeature([Document]),
        HttpModule.registerAsync({
            useFactory: () => ({
                timeout: 30000,
                maxRedirects: 5,
            }),
        })
    ],
    providers: [DocumentService, DocumentsRepository],
    controllers: [DocumentController],
    exports: [DocumentService, DocumentsRepository],
})
export class DocumentModule {}
