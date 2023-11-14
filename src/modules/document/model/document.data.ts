import { ApiProperty } from '@nestjs/swagger';
import { Company, CompanyData } from '../../company/model';
import { ValidPhases } from '../../dossier/model/dossier.entity';
import { ValidDocStates, ValidDocTypes } from './document.entity';

export class DocumentData {
    @ApiProperty({
        description: 'Document unique ID',
        example: '80efb8f2-fcb8-4e6d-bf6e-01c67cf0c9e0',
    })
    public readonly id: string;

    @ApiProperty({ description: 'name', example: 'filename' })
    public readonly name: string;

    @ApiProperty({ description: 'type', example: 'typefile' })
    public readonly type: ValidDocTypes;

    @ApiProperty({ description: 'size', example: 2345 })
    public readonly size: number;

    @ApiProperty({
        description: 'phase',
        enum: ValidPhases,
        example: ValidPhases.CLOSE,
    })
    public readonly phase: ValidPhases;

    @ApiProperty({ description: 'state', example: 'NOTARIZED' })
    public readonly state: ValidDocStates;

    @ApiProperty({ description: 'uploadDate', example: new Date() })
    public readonly uploadDate: Date;

    @ApiProperty({ description: 'Company', type: CompanyData })
    public readonly uploader: Company;


    @ApiProperty({ description: 'Process id for cake', example: '6307813718727385302' })
    public readonly processId?: string;

    @ApiProperty({ description: 'Message id on cake', example: '6307813718727385302' })
    public readonly messageId?: string;

    @ApiProperty({ description: 'Ipfs hash name', example: 'QmU3JVQj8YbsdqaiqBiSRfHukrqL4jyn1B52rrJJ6Xr5iQ' })
    public readonly ipfsLink?: string;


    @ApiProperty({ description: 'algorand transaction id for notarize', example: 'HIXPOFGIN35ASZOHEXH27INPJZUCRC3N23HSIWPYW4DP6YOE2KGQ' })
    public readonly txId?: string;
}
