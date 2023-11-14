import * as Joi from 'joi';
import * as _ from 'lodash';

import { DataSource, DataSourceOptions } from 'typeorm';
import { Company } from '../../company/model';
import { Dossier } from '../../dossier/model';
import { Token } from '../../token/model';
import { User } from '../../user/model';
import { Config } from '../model';
import { Document } from '../../document/model';
import { DocumentDraft } from '../../document.draft/model';

const API_DEFAULT_PORT = 4000;
const API_DEFAULT_PREFIX = '/api/v1/';
const SWAGGER_TITLE = 'BRIE Backend API';
const SWAGGER_DESCRIPTION = 'API used for BRIE management';
const SWAGGER_PREFIX = '/docs';

export const configValidation = (): Config => {
    const env = process.env
    const validationSchema = Joi.object().unknown().keys({
        API_PORT: Joi.string().required().default(API_DEFAULT_PORT),
        API_PREFIX: Joi.string().required().default(API_DEFAULT_PREFIX),
        SWAGGER_ENABLE: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB_NAME: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_PUBLIC_KEY: Joi.string().required(),
        APP_ENV: Joi.string().required(),
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLEARANCE:
            Joi.string().required(),
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_DDT: Joi.string().required(),
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLOSING:
            Joi.string().required(),
        SCHEDULER_INTERVAL_MS_DB_CLEANER: Joi.string().required(),
        CAKE_URI: Joi.string().required()
        })

    const result = validationSchema.validate(env);
    if (result.error) {
        throw new Error('Configuration not valid: ' + result.error.message);
    }

    return {
        API_PORT: _.toNumber(env.API_PORT),
        API_PREFIX: `${env.API_PREFIX}`,
        SWAGGER_ENABLE: _.toNumber(env.SWAGGER_ENABLE),
        TYPEORM_CONNECTION: `postgres`,
        TYPEORM_HOST: `${env.POSTGRES_HOST}`,
        TYPEORM_PORT: _.toNumber(env.POSTGRES_PORT),
        TYPEORM_USERNAME: `${env.POSTGRES_USER}`,
        TYPEORM_PASSWORD: `${env.POSTGRES_PASSWORD}`,
        TYPEORM_DATABASE: `${env.POSTGRES_DB_NAME}`,
        TYPEORM_MIGRATIONS: env.TYPEORM_MIGRATIONS ?? 'src/migrations/*.ts',
        SWAGGER_TITLE: SWAGGER_TITLE,
        SWAGGER_DESCRIPTION: SWAGGER_DESCRIPTION,
        SWAGGER_PREFIX: SWAGGER_PREFIX,
        JWT_PRIVATE_KEY: `${env.JWT_PRIVATE_KEY}`,
        JWT_PUBLIC_KEY: `${env.JWT_PUBLIC_KEY}`,
        NODE_ENV: `${env.APP_ENV}`,
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLEARANCE: _.toNumber(
            env.SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLEARANCE
        ),
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_DDT: _.toNumber(
            env.SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_DDT
        ),
        SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLOSING: _.toNumber(
            env.SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLOSING
        ),
        SCHEDULER_INTERVAL_MS_DB_CLEANER: _.toNumber(
            env.SCHEDULER_INTERVAL_MS_DB_CLEANER
        ),
        CAKE_URI: env.CAKE_URI!
    };
};

export const dataSourceOpts: DataSourceOptions = {
    type: 'postgres',
    host: configValidation().TYPEORM_HOST,
    port: configValidation().TYPEORM_PORT,
    username: configValidation().TYPEORM_USERNAME,
    password: configValidation().TYPEORM_PASSWORD,
    database: configValidation().TYPEORM_DATABASE,
    entities: [User, Company, Dossier, Token, Document, DocumentDraft],
    synchronize: false,
    logging: false,
    useUTC: true,
};

export const unitTestOpts: DataSourceOptions = {
    type: 'postgres',
    host: configValidation().TYPEORM_HOST,
    port: configValidation().TYPEORM_PORT,
    username: configValidation().TYPEORM_USERNAME,
    password: configValidation().TYPEORM_PASSWORD,
    database: configValidation().TYPEORM_DATABASE,
    entities: [User, Company, Dossier, Token, Document, DocumentDraft],
    synchronize: false,
    useUTC: true,
    logging: false,
    migrations: [configValidation().TYPEORM_MIGRATIONS],
};

export const dataSourceSeederOptions: DataSourceOptions = {
    ...dataSourceOpts,
    migrations: [configValidation().TYPEORM_MIGRATIONS],
};

export const AppDataSource = new DataSource(dataSourceSeederOptions);
