import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common';
import { DocumentDraftController } from './controller';
import { DocumentDraft } from './model';
import { DocumentDraftService } from './service';
import { AuthModule } from '../common/auth.module';
import { DocumentModule } from '../document/document.module';

@Module({
    imports: [
        CommonModule,
        AuthModule,
        DocumentModule,
        TypeOrmModule.forFeature([DocumentDraft]),
    ],
    providers: [DocumentDraftService],
    controllers: [DocumentDraftController],
    exports: [DocumentDraftService],
})
export class DocumentDraftModule {}
