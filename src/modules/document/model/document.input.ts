import { ApiProperty } from '@nestjs/swagger';
import { ValidDocTypes } from './document.entity';

export class DocumentInput {
    @ApiProperty()
    public readonly type: ValidDocTypes;

    @ApiProperty()
    public readonly dossier: string;

    @ApiProperty()
    public readonly uploadDate: Date;

    @ApiProperty()
    public readonly uploader: string;
}
