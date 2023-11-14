import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from '../common';
import { UserController } from './controller';
import { UserService } from './service';
import { CompanyModule } from '../company/company.module';
import { AuthModule } from '../common/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model';

@Module({
    imports: [
        CommonModule,
        TypeOrmModule.forFeature([User]),
        CompanyModule,
        forwardRef(() => AuthModule),
    ],
    providers: [UserService],
    exports: [TypeOrmModule, UserService],
    controllers: [UserController],
})
export class UserModule {}
