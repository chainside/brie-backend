import { Module } from '@nestjs/common';

import {CommonModule} from '../common';

import { AuthService } from '../common/provider/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CompanyModule } from '../company/company.module';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [CommonModule, CompanyModule, UserModule, TokenModule, JwtModule],
    providers: [AuthService],
    exports: [TokenModule, JwtModule, AuthService],
})
export class AuthModule {}
