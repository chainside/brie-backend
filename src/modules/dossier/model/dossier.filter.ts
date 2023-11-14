import { ApiProperty } from '@nestjs/swagger';
import { ValidPhases, ValidStates } from './dossier.entity';

export class DossierFilter {
    @ApiProperty()
    skip?: number;
    @ApiProperty()
    max?: number;
    @ApiProperty()
    startCreationDate?: Date;
    @ApiProperty()
    endCreationDate?: Date;
    @ApiProperty()
    creator?: string;
    @ApiProperty()
    phase?: ValidPhases;
    @ApiProperty()
    state?: ValidStates;
    @ApiProperty()
    orderBy?: OrderByType;
}

export type OrderByType = {
    column: SortingColumns;
    direction: 'ASC' | 'DESC';
};

export type SortingColumns =
    | 'id'
    | 'creation_date'
    | 'company.business_name'
    | 'transfereeCompany.business_name';
