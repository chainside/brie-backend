import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';

import { Dossier } from '../modules/dossier/model/dossier.entity';
import { Document } from '../modules/document/model';
import {
    ValidDocStates,
    ValidDocTypes,
} from '../modules/document/model/document.entity';

export class DocumentInsertTable1689705313897 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();

        try {
            const documentRepo = queryRunner.connection.getRepository(Document);
            const dossierRepo = queryRunner.connection.getRepository(Dossier);

            const dossiers = await dossierRepo.find();
            const pdfBuffer = fs.readFileSync('./src/test/test.pdf');

            await documentRepo.insert([
                {
                    dossier: dossiers[0],
                    file: pdfBuffer,
                    mimetype: 'application/pdf',
                    name: 'test.pdf',
                    phase: dossiers[0].phase,
                    size: pdfBuffer.byteLength,
                    state: ValidDocStates.NOT_NOTARIZED,
                    uploadDate: new Date(),
                    uploader: dossiers[0].company,
                    type: ValidDocTypes.BILL,
                },
            ]);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction(); // Annulla la transazione in caso di errore
            throw err;
        }
    }

    down(): Promise<unknown> {
        throw new Error('Method not implemented.');
    }
}
