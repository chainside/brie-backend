import { ApiProperty } from '@nestjs/swagger';
import { Company, CompanyData } from '../../company/model';
import {
    Dossier,
    ValidCategories,
    ValidCompliance,
    ValidPhases,
    ValidRequestDetails,
    ValidRequestType,
    ValidStates,
    ValidTransportationMode,
} from './dossier.entity';

export class DossierData {
    @ApiProperty({
        description: 'Dossier unique ID',
        example: '80efb8f2-fcb8-4e6d-bf6e-01c67cf0c9e0',
    })
    public readonly id: string;

    @ApiProperty({ description: 'Creation Date', example: '01/01/2001' })
    public readonly creationDate: Date;

    @ApiProperty({
        description: 'Type of good',
        example: 'MIN_METAL_CHEMICAL',
        enum: ValidCategories,
    })
    public readonly category: ValidCategories;

    @ApiProperty({ description: 'Amount', example: '100000' })
    public readonly amount: number;

    @ApiProperty({ description: 'Company', type: CompanyData })
    public readonly company: Company;

    @ApiProperty({ description: 'Transferee Company', type: CompanyData })
    public readonly transfereeCompany: Company;

    @ApiProperty({
        description: 'Phase',
        example: 'INT_REQ',
        enum: ValidPhases,
    })
    public readonly phase: ValidPhases;

    @ApiProperty({
        description: 'State',
        example: 'TRANSIT',
        enum: ValidStates,
    })
    public readonly state: ValidStates;

    @ApiProperty({ description: 'Parcels', example: 100000 })
    public readonly parcels: number;

    @ApiProperty({ description: 'Ton', example: 100000 })
    public readonly ton: number;

    @ApiProperty({ description: 'CustomsClearaceDate', example: '01/01/2001' })
    public readonly customsClearaceDate?: Date;

    //Action
    @ApiProperty({ description: 'requestDate', example: '01/01/2001' })
    public readonly requestDate?: Date;

    @ApiProperty({ description: 'requestType', enum: ValidRequestType })
    public readonly requestType?: ValidRequestType;

    @ApiProperty({ description: 'requestDetail', enum: ValidRequestDetails })
    public readonly requestDetail?: ValidRequestDetails;

    @ApiProperty({ description: 'requester', example: 'Company1' })
    public readonly requester?: string;

    //DDT
    @ApiProperty({
        description: 'transportationMode',
        enum: ValidTransportationMode,
    })
    public readonly transportationMode?: ValidTransportationMode;

    @ApiProperty({
        description: 'carrierName',
        maxLength: Dossier.NAME_LENGTH,
        example: 'DHL',
    })
    public readonly carrierName?: string;

    @ApiProperty({ description: 'carrierVAT', example: '012345678901' })
    public readonly carrierVAT?: string;

    @ApiProperty({ description: 'pickupDate', example: '01/01/2001' })
    public readonly pickupDate?: Date;

    @ApiProperty({ description: 'expectedDeliveryDate', example: '01/01/2001' })
    public readonly expectedDeliveryDate?: Date;

    @ApiProperty({
        description: 'pickupAddress',
        example: 'via Alessandria 23, Alessandria, Italia',
    })
    public readonly pickupAddress?: string;

    @ApiProperty({
        description: 'destinationAddress',
        example: 'via Corso como 1, Milano, Italia',
    })
    public readonly destinationAddress?: string;

    @ApiProperty({ description: 'deliveredDate', example: '01/01/2001' })
    public readonly deliveredDate: Date;

    @ApiProperty({ description: 'compliance', enum: ValidCompliance })
    public readonly compliance: ValidCompliance;

    @ApiProperty({
        description: 'note',
        maxLength: Dossier.NAME_LENGTH,
        example: 'type',
    })
    public readonly note?: string;

    @ApiProperty({ description: 'amountVAT', example: 1123 })
    public readonly amountVAT: number;

    @ApiProperty({ description: 'paymentDate', example: '01/01/2001' })
    public readonly paymentDate: Date;

    @ApiProperty({ description: 'ddtApproveDate', example: '01/01/2001' })
    public readonly ddtApproveDate: Date;

    @ApiProperty({ description: 'provider', example: 'provider 2' })
    public readonly provider: string;

    @ApiProperty({ description: 'closingDate', example: '01/01/2001' })
    public readonly closingDate: Date;
}

export class DossierListData {
    @ApiProperty({ description: 'dossier', type: DossierData })
    public readonly dossier: DossierData[];

    @ApiProperty({ description: 'count', example: 1234 })
    public readonly count: number;
}
