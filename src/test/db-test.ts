import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { DocumentDraftInput } from '../modules/document.draft/model';
import { DocumentDraftService } from '../modules/document.draft/service';
import { ValidDocTypes } from '../modules/document/model/document.entity';
import { UserService } from '../modules/user/service';
import { configValidation } from '../modules/common/provider';
import { generatePayloadTokenJwt } from '../modules/common/security';
import { Readable } from 'stream';
import { unitTestOpts } from '../modules/common/provider/config.provider';

import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Config } from '../modules/common';
import { CompaniesInsertTable1688728420489 } from '../migrations-seeding/1688728420489-CompaniesInsertTable';
import { UsersInsertTable1688728430859 } from '../migrations-seeding/1688728430859-UsersInsertTable';
import { DossierInsertTable1689705313896 } from '../migrations-seeding/1689705313896-DossierInsertTable';
import { DocumentInsertTable1689705313897 } from '../migrations-seeding/1689705313897-DocumentInsertTable';
import { Dossier } from '../modules/dossier/model';
import { Repository } from 'typeorm';

export const initDataBase = async (app: INestApplication): Promise<string> => {
    const connection = app.get(getDataSourceToken(unitTestOpts));
    app.get<ConfigService<Config, true>>(ConfigService);
    await connection.dropDatabase();
    await connection.runMigrations();
    connection.migrations.push(new CompaniesInsertTable1688728420489());
    connection.migrations.push(new UsersInsertTable1688728430859());
    connection.migrations.push(new DossierInsertTable1689705313896());
    connection.migrations.push(new DocumentInsertTable1689705313897());
    await connection.runMigrations();
    const jwtService = app.get<JwtService>(JwtService);
    const userService = app.get<UserService>(UserService);
    const dossierRepo = app.get<Repository<Dossier>>(
        getRepositoryToken(Dossier)
    );
    const dossier: Dossier[] = await dossierRepo.find({
        relations: { company: true },
    });
    const dossierUpd: Dossier[] = [];
    for (const ds of dossier) {
        ds.provider = ds.company.businessName;
        dossierUpd.push(ds);
    }
    await dossierRepo.save(dossierUpd);
    const user = await userService.findOneByEmail('john.doe@gmail.com');
    if (user != null) {
        return jwtService.sign(generatePayloadTokenJwt(user), {
            privateKey: fs.readFileSync(configValidation().JWT_PRIVATE_KEY),
            algorithm: 'RS256',
            expiresIn: 300000,
        });
    } else {
        throw new Error('Error in seeding db');
    }
};

export const addDraftDoc = async (app: INestApplication): Promise<void> => {
    const documentsDraftService =
        app.get<DocumentDraftService>(DocumentDraftService);
    const pdfBuffer = fs.readFileSync('./src/test/test.pdf');
    const file = {
        fieldname: 'test',
        originalname: 'test.pdf',
        encoding: '',
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
        destination: '',
        filename: 'test.pdf',
        path: './src/test/test.pdf',
        buffer: pdfBuffer,
        stream: new Readable(),
    };
    const ddi: DocumentDraftInput = {
        type: ValidDocTypes.BILL,
        file: file,
    };

    await documentsDraftService.create(ddi, file);
};
