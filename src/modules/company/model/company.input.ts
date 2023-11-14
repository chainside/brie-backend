import { ApiProperty } from '@nestjs/swagger';
import { ValidCommoditiesSector, ValidLegalForms } from './company.entity';

export class CompanyInput {
    @ApiProperty()
    public readonly name: string;

    @ApiProperty()
    public readonly vatNumber: string;

    @ApiProperty()
    public readonly codeEori: string;

    @ApiProperty()
    public readonly businessName: string;

    @ApiProperty()
    public readonly legalForm: ValidLegalForms;

    @ApiProperty()
    public readonly legalResidence: string;

    @ApiProperty()
    public readonly commoditiesSector: ValidCommoditiesSector;
}
