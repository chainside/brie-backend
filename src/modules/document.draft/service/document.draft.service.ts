import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'stream';
import {
    DeleteResult,
    Equal,
    FindOptionsWhere,
    In,
    QueryRunner,
    Repository,
} from 'typeorm';
import { DocumentInput } from '../../document/model';
import { DocumentService } from '../../document/service';
import { DocumentDraft, DocumentDraftInput } from '../model';
import _ = require('lodash');
@Injectable()
export class DocumentDraftService {
    public constructor(
        @InjectRepository(DocumentDraft)
        private readonly documentsDraftRepository: Repository<DocumentDraft>,
        private readonly documentService: DocumentService
    ) {}

    public async findAll(): Promise<DocumentDraft[]> {
        return await this.documentsDraftRepository.find();
    }

    public async create(
        input: DocumentDraftInput,
        file: Express.Multer.File
    ): Promise<DocumentDraft> {
        const document = new DocumentDraft();
        document.file = file.buffer;
        document.name = file.originalname;
        document.size = file.size;
        document.mimetype = file.mimetype;
        document.type = input.type;
        document.uploadDate = new Date();
        return this.documentsDraftRepository.save(document);
    }

    public async delete(id: string): Promise<DeleteResult> {
        const options: FindOptionsWhere<DocumentDraft> = {
            id: Equal(id),
        };
        return this.documentsDraftRepository.delete(options);
    }

    public async moveDrafts(
        idDrafts: string | string[],
        idDossier: string,
        uploader: string,
        queryRunner: QueryRunner
    ) {
        if (!_.isArray(idDrafts)) {
            idDrafts = [idDrafts];
        }
        const drafts = await this.documentsDraftRepository.find({
            where: { id: In(idDrafts) },
        });
        await Promise.all(
            drafts.map(async (doc) => {
                const docInput: DocumentInput = {
                    type: doc.type,
                    dossier: idDossier,
                    uploadDate: new Date(),
                    uploader: uploader,
                };

                const docSaved = await this.documentService.create(
                    docInput,
                    {
                        originalname: doc.name,
                        mimetype: doc.mimetype,
                        fieldname: '',
                        encoding: '',
                        size: doc.size,
                        stream: new Readable(),
                        destination: '',
                        filename: '',
                        path: '',
                        buffer: Buffer.from(doc.file),
                    },
                    queryRunner
                );
                if (docSaved) {
                    await this.delete(doc.id);
                }
            })
        );
    }
}
