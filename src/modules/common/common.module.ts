import { Module } from '@nestjs/common';

import { LogInterceptor } from './flow';
import { LoggerService } from './provider';

@Module({
    providers: [LoggerService, LogInterceptor],
    exports: [LoggerService, LogInterceptor],
})
export class CommonModule {}
