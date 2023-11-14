import { ApiProperty } from '@nestjs/swagger';
import { ValidDocTypes } from '../../document/model/document.entity';

export class DocumentDraftInput {
    @ApiProperty({ name: 'file', format: 'binary', type: 'string' })
    public file: Express.Multer.File;

    @ApiProperty({ name: 'type' })
    public readonly type: ValidDocTypes;
}
