import {
    Body,
    Controller,
    HttpStatus,
    ParseFilePipeBuilder,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../../common';

import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentDraftPipe } from '../flow';
import { DocumentDraftInput } from '../model';
import { DocumentDraftService } from '../service';
@Controller('document-draft')
@ApiTags('document-draft')
@ApiCookieAuth()
export class DocumentDraftController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly documentsDraftService: DocumentDraftService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Upload a file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: DocumentDraftInput })
    @UseInterceptors(FileInterceptor('file'))
    @ApiResponse({ status: HttpStatus.CREATED, type: String })
    async uploadFile(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'pdf',
                })
                .addMaxSizeValidator({
                    maxSize: 10 * 1024 * 1024,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )
        file: Express.Multer.File,
        @Body(DocumentDraftPipe) input: DocumentDraftInput
    ): Promise<string> {
        const doc = await this.documentsDraftService.create(input, file);
        this.logger.debug('Created new document with ID' + doc.id);
        return doc.id;
    }
}
