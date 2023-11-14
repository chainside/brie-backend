import { ApiProperty } from '@nestjs/swagger';
import { ValidCommoditiesSector, ValidLegalForms } from './company.entity';

export class CompanyData {
    @ApiProperty({
        description: 'Company unique ID',
        example: 'a9f650fe-5ca7-40f0-8297-c76fa105cd2f',
    })
    public readonly id: string;

    @ApiProperty({ description: 'Name', example: 'Company Name' })
    public readonly name: string;

    @ApiProperty({ description: 'vatNumber', example: '12345678901' })
    public readonly vatNumber: string;

    @ApiProperty({ description: 'code eori', example: 'IT12345678902' })
    public readonly codeEori: string;

    @ApiProperty({ description: 'business name', example: 'Company srl' })
    public readonly businessName: string;

    @ApiProperty({
        description: 'legal form',
        example: 'srl',
        enum: ValidLegalForms,
    })
    public readonly legalForm: ValidLegalForms;

    @ApiProperty({
        description: 'legal residence',
        example: 'Via Roma 3, Torino, IT',
    })
    public readonly legalResidence: string;

    @ApiProperty({
        description: 'commodieties sector',
        example: 'ores, metals and chemicals',
        enum: ValidCommoditiesSector,
    })
    public readonly commoditiesSector: ValidCommoditiesSector;
}
