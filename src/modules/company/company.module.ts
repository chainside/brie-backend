import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from '../common';
import { CompanyController } from './controller';

import { CompanyService } from './service';

import { AuthModule } from '../common/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './model';

@Module({
    imports: [
        CommonModule,
        TypeOrmModule.forFeature([Company]),
        forwardRef(() => AuthModule),
    ],
    providers: [CompanyService],
    controllers: [CompanyController],
    exports: [TypeOrmModule, CompanyService],
})
export class CompanyModule {}
