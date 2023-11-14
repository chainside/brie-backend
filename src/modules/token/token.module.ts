import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common';
import { Token } from './model/token.entity';
import { TokenService } from './service/token.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [CommonModule, TypeOrmModule.forFeature([Token]), UserModule],
    providers: [TokenService],
    exports: [TypeOrmModule, TokenService],
})
export class TokenModule {}
