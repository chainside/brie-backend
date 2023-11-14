import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Res,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../../common';

import { AuthGuard } from '../../common/security/auth.guard';
import { Document, DocumentData } from '../model';
import { DocumentService } from '../service';
import { Response } from 'express';
@Controller('document')
@ApiTags('document')
@ApiCookieAuth()
export class DocumentController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly documentsService: DocumentService
    ) {}

    @Get(':idDossier')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Files from Dossier' })
    @ApiResponse({ status: HttpStatus.OK, type: DocumentData })
    @ApiParam({ name: 'idDossier', type: 'string' })
    public async findByIdDossier(
        @Param('idDossier') idDossier: string
    ): Promise<DocumentData[]> {
        this.logger.debug('Searching documents');
        const documents = await this.documentsService.findByDossier(idDossier);
        if (documents.length === 0)
            throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

        return documents.map((document: Document) => document.buildData());
    }

    @Get('download/:idDocument')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Download file from Dossier' })
    @ApiResponse({ status: HttpStatus.OK, type: StreamableFile })
    @ApiParam({ name: 'idDocument', type: 'string' })
    public async downloadById(
        @Param('idDocument') idDocument: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        const document = await this.documentsService.findById(idDocument);
        if (document == null) {
            throw new HttpException(
                'Document does not exist',
                HttpStatus.NOT_FOUND
            );
        }

        this.logger.debug(
            `Downloading document"${document.id}" - "${document.name}"`
        );

        res.set({
            'Content-Type': document.mimetype,
            'Content-Disposition': `attachment; filename="${document.name}"`,
        });
        res.status(200).send(document.file);
    }
}
