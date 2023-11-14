import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule, isTestEnv } from './common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import {
    configValidation,
    dataSourceOpts,
    unitTestOpts,
} from './common/provider/config.provider';
import { CustomsModule } from './customs/customs.module';
import { DossierModule } from './dossier/dossier.module';
import { DocumentModule } from './document/document.module';
import { DocumentDraftModule } from './document.draft/document.draft.module';
import { CleanerModule } from './cleaner/cleaner.module';
import { AuthModule } from './common/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';

@Module({
    imports: [
        CommonModule,
        ConfigModule.forRoot({
            load: [configValidation],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: () => {
                if (isTestEnv()) {
                    return unitTestOpts;
                }
                return dataSourceOpts;
            },
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        CompanyModule,
        UserModule,
        TokenModule,
        AuthModule,
        DossierModule,
        CustomsModule,
        DocumentModule,
        DocumentDraftModule,
        CleanerModule,
    ],
})
export class ApplicationModule {}
