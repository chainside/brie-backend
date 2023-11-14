import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, Equal, FindOptionsWhere, QueryRunner, Repository,} from 'typeorm';
import {Dossier} from '../../dossier/model';
import {Document, DocumentInput} from '../model';
import {ValidDocStates} from '../model/document.entity';
import {CompanyService} from './../../company/service/company.service';
import {DocumentsRepository} from "./documents.repository";
import {HttpService} from "@nestjs/axios";
import {configValidation} from "../../common";
import {firstValueFrom} from "rxjs";
import _ = require('lodash');

@Injectable()
export class DocumentService {
    public constructor(
        @InjectRepository(Document)
        private readonly documentsRepository: Repository<Document>,
        private readonly transactionalDocumentsRepository: DocumentsRepository,
        private readonly companyService: CompanyService,
        private readonly httpService: HttpService,
    ) {}

    public async findByDossier(idDossier: string): Promise<Document[]> {
        return this.documentsRepository.find({
            where: { dossier: Equal(idDossier) },
            relations: { uploader: true },
        });
    }

    public async countByDossier(idDossier: string): Promise<number> {
        return this.documentsRepository.count({
            where: { dossier: Equal(idDossier) },
        });
    }

    public async findById(idDocument: string): Promise<Document | null> {
        const doc =  await this.documentsRepository.findOne({
            where: { id: Equal(idDocument) },
            relations: { uploader: false },
        });
        if(!doc) {
            return null
        }
        if (doc!.state === ValidDocStates.NOTARIZED) {
            doc.file = await this.getFileFromCake(doc)
        }

        return doc;
    }

    private async getFileFromCake(doc: Document): Promise<Uint8Array> {
        if (!doc.messageId || !doc.processId) {
            throw new Error('Unknow cake datas');
        }
        await firstValueFrom(this.httpService.post(`http://${configValidation().CAKE_URI}/client/handshake`,{
            reader_address: "XP4ILNY6MG4VUKC26AJ6NUW5RGG7FS6CE3HTJFQ7X2MRTXJLKPJKAIDVII",
            message_id: doc.messageId,
            process_id: doc.processId
        }))

        await firstValueFrom(this.httpService.post(`http://${configValidation().CAKE_URI}/client/generateKey`,{
            reader_address: "XP4ILNY6MG4VUKC26AJ6NUW5RGG7FS6CE3HTJFQ7X2MRTXJLKPJKAIDVII",
            message_id: doc.messageId,
            process_id: doc.processId
        }))

        const response = await firstValueFrom(this.httpService.post<{document: string}>(`http://${configValidation().CAKE_URI}/client/accessData`,{
            reader_address: "XP4ILNY6MG4VUKC26AJ6NUW5RGG7FS6CE3HTJFQ7X2MRTXJLKPJKAIDVII",
            message_id: doc.messageId,
            process_id: doc.processId,
            slice_id: 0,
        }))

        return Buffer.from(response.data.document, 'base64')

    }

    public async create(
        input: DocumentInput,
        file: Express.Multer.File,
        queryRunner: QueryRunner
    ): Promise<Document> {
        const dossier = await queryRunner.manager
            .getRepository(Dossier)
            .findOne({
                where: { id: input.dossier },
                relations: { company: true, transfereeCompany: true },
            });
        if (_.isUndefined(dossier) || _.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }

        const document = new Document();
        document.file = file.buffer;
        document.name = file.originalname;
        document.size = file.size;
        document.type = input.type;
        document.state = ValidDocStates.NOT_NOTARIZED;
        document.mimetype = file.mimetype;
        document.phase = dossier.phase;
        document.dossier = dossier;
        document.uploadDate = input.uploadDate;
        const company = await this.companyService.findById(input.uploader);
        if (_.isNull(company)) {
            throw new HttpException('Company not exist', HttpStatus.NOT_FOUND);
        }
        document.uploader = company;
        return await queryRunner.manager.getRepository(Document).save(document);
    }

    public deleteDocByDossierAndPhase(dossier: Dossier): Promise<DeleteResult> {
        const options: FindOptionsWhere<Document> = {
            dossier: Equal(dossier.id),
            phase: Equal(dossier.phase),
        };
        return this.documentsRepository.delete(options);
    }

    public async notarizeDocument() {
        await this.transactionalDocumentsRepository.runInTransaction(async (queryRunner) => {

            const results = await this.documentsRepository.createQueryBuilder('documents')
            .select(['documents.id']) // added selection
            .where("documents.state = :state", { state: ValidDocStates.NOT_NOTARIZED })
                .orderBy({ upload_date: "DESC" }).limit(5).getMany();

       for(let i = 0; i < results.length; i++){
                const id = results[i].id
                const doc = await this.transactionalDocumentsRepository.findById(id, queryRunner, true);
                if (!doc) {
                    return
                }
                try {


                    const process = await firstValueFrom(this.httpService.post<{process_id: string}>(`http://${configValidation().CAKE_URI}/certification/attributecertification`,{
                        "roles": {"MANUFACTURER": ["MANUFACTURER"],
                            "SUPPLIER1": ["SUPPLIER", "ELECTRONICS"],
                            "SUPPLIER2": ["SUPPLIER", "MECHANICS"]}
                    }))
                    doc.processId = process.data.process_id;
                    const handshake = await firstValueFrom(this.httpService.post(`http://${configValidation().CAKE_URI}/dataOwner/handshake`,{
                        process_id: doc.processId
                    }));


                    const request = {
                        "id": doc.processId,
                        "process_id": doc.processId,
                        "document_id": doc.id,
                        "document_name": doc.name,
                        "entries": ["document"],
                        "policy": [`${doc.processId} and (MANUFACTURER or SUPPLIER)`],
                        "message": JSON.stringify({
                            document: Buffer.from(doc.file!).toString('base64')
                        })
                    }

                    const {data} = await firstValueFrom(this.httpService.post<{ message_id: string, tx_id: string, ipfs_link: string}>(`http://${configValidation().CAKE_URI}/dataOwner/cipher`, request))


                    doc.messageId = data.message_id;
                    doc.ipfsLink = data.ipfs_link;
                    doc.txId = data.tx_id;
                    doc.state = ValidDocStates.NOTARIZED;
                    doc.file = null;
                } catch (e) {
                    console.error(e)
                    doc.state = ValidDocStates.FAILED
                }


                await this.transactionalDocumentsRepository.save(doc, queryRunner);
                return doc;

        }
        })
    }
}
