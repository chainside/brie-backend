import * as winston from 'winston';
import { PRODUCTION, STAGING, UNIT_TEST } from '../utils/const';
import { configValidation } from './config.provider';
import {Injectable} from "@nestjs/common";

@Injectable()
export class LoggerService {
    private readonly instance: winston.Logger;

    public constructor() {
        const format = this.isProductionEnv()
            ? winston.format.combine(
                  winston.format.timestamp(),
                  winston.format.json()
              )
            : winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
              );

        this.instance = winston.createLogger({
            level: this.isProductionEnv() ? 'info' : 'debug',
            silent: this.isTestEnv(),
            format,
            transports: [
                new winston.transports.Console({
                    stderrLevels: ['error'],
                }),
            ],
        });
    }

    public info(message: string, ...args: any) {
        this.instance.info(message, args);
    }

    public error(message: string, ...args: any) {
        this.instance.error(message, args);
    }

    public debug(message: string, ...args: any) {
        this.instance.debug(message, args);
    }

    private isTestEnv(): boolean {
        return configValidation().NODE_ENV === UNIT_TEST;
    }

    private isProductionEnv(): boolean {
        return (
            configValidation().NODE_ENV === PRODUCTION ||
            configValidation().NODE_ENV === STAGING
        );
    }
}
