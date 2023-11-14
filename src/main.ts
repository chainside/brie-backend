import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ApplicationModule } from './modules/app.module';
import { CommonModule, Config, LogInterceptor } from './modules/common';

import { ConfigService } from '@nestjs/config';

/**
 * Register a Swagger module in the NestJS application.
 * This method mutates the given `app` to register a new module dedicated to
 * Swagger API documentation. Any request performed on `SWAGGER_PREFIX` will
 * receive a documentation page as response.
 *
 * @todo See the `nestjs/swagger` NPM package documentation to customize the
 *       code below with API keys, security requirements, tags and more.
 */
async function createSwagger(app: INestApplication) {
    const version = (await import('../package.json')).version || '';
    const configService = app.get<ConfigService<Config, true>>(ConfigService);
    const options = new DocumentBuilder()
        .setTitle(configService.get('SWAGGER_TITLE'))
        .setDescription(configService.get('SWAGGER_DESCRIPTION'))
        .setVersion(version)
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(configService.get('SWAGGER_PREFIX'), app, document);
}

/**
 * Build & bootstrap the NestJS API.
 * This method is the starting point of the API; it registers the application
 * module and registers essential components such as the logger and request
 * parsing middleware.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(ApplicationModule, {
        cors: {
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'OPTION', 'PATCH'],
            allowedHeaders: ['content-type'],
            credentials: true,
        },
    });

    const configService = app.get<ConfigService<Config, true>>(ConfigService);
    app.setGlobalPrefix(configService.get('API_PREFIX'));

    if (configService.get('SWAGGER_ENABLE')) {
        createSwagger(app);
    }

    app.use(json());
    app.use(helmet());
    app.use(cookieParser());
    const logInterceptor = app.select(CommonModule).get(LogInterceptor);
    app.useGlobalInterceptors(logInterceptor);

    await app.listen(configService.get('API_PORT'));
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
