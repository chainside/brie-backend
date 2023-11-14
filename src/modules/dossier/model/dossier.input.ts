import { ApiProperty } from '@nestjs/swagger';
import {
    ValidCategories,
    ValidCompliance,
    ValidTransportationMode,
} from './dossier.entity';

export class DossierInput {
    @ApiProperty()
    public readonly category: ValidCategories;

    @ApiProperty()
    public readonly company: string;

    @ApiProperty()
    public readonly transfereeCompany: string;

    @ApiProperty()
    public readonly amount: number;

    @ApiProperty()
    public readonly parcels: number;

    @ApiProperty()
    public readonly ton: number;

    @ApiProperty()
    public readonly documents: string[];
}

export class DossierIdInput {
    @ApiProperty()
    public readonly id: string;

    @ApiProperty()
    public readonly document: string;
}

export class DossierDDTInput extends DossierIdInput {
    @ApiProperty()
    public readonly transportationMode: ValidTransportationMode;

    @ApiProperty()
    public readonly carrierName: string;

    @ApiProperty()
    public readonly carrierVAT: string;

    @ApiProperty()
    public readonly pickupDate: Date;

    @ApiProperty()
    public readonly expectedDeliveryDate: Date;

    @ApiProperty()
    public readonly pickupAddress: string;

    @ApiProperty()
    public readonly destinationAddress: string;
}

export class DossierConfirmDeliveredInput extends DossierIdInput {
    @ApiProperty()
    public readonly deliveredDate: Date;

    @ApiProperty()
    public readonly compliance: ValidCompliance;

    @ApiProperty()
    public readonly note?: string;
}

export class DossierUploadVatCompliancedInput extends DossierIdInput {
    @ApiProperty()
    public readonly amountVAT: number;

    @ApiProperty()
    public readonly paymentDate: Date;
}
