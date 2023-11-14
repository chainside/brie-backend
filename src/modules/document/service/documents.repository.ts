import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner } from 'typeorm';
import { LoggerService } from '../../common';
import {Document } from '../model';
@Injectable()
export class DocumentsRepository {
    public constructor(
        @InjectDataSource()
        private readonly datasource: DataSource,

        private readonly logger: LoggerService
    ) {}

    public async runInTransaction<T>(
        transaction: (queryRunner: QueryRunner) => T
    ) {
        const queryRunner = this.datasource.createQueryRunner();
        let res: T;
        try {
            await queryRunner.startTransaction();

            res = await transaction(queryRunner);
            await queryRunner.commitTransaction();

            await queryRunner.release();
        } catch (error) {
            this.logger.error(error);
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw new HttpException(
                {
                    message: 'Resource unavailable',
                    statusCode: HttpStatus.CONFLICT,
                },
                HttpStatus.CONFLICT
            );
        }
        return res;
    }

    public async findById(
        id: string,
        queryRunner: QueryRunner,
        lock = false
    ): Promise<Document | null> {
        const options: FindOneOptions<Document> = {
            where: { id: id },
            relations: { dossier: false },
        };

        if (lock) {
            options.lock = {
                mode: 'pessimistic_write',
                onLocked: 'nowait',
                tables: ['documents'],
            };
            return await queryRunner.manager
                .getRepository(Document)
                .findOne(options);
        }

        return await queryRunner.manager
            .getRepository(Document)
            .findOne(options);
    }
    public async save(
        doc: Document,
        queryRunner: QueryRunner,
    ): Promise<Document | null> {
        return await queryRunner.manager
            .getRepository(Document)
            .save(doc);
    }










}
