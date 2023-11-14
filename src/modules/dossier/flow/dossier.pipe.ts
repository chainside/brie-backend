import * as Joi from 'joi';
import { OrderByType } from './../model/dossier.filter';

import { JoiValidationPipe } from '../../common';
import { DossierFilter, DossierInput } from '../model';
import {
    Dossier,
    ValidCategories,
    ValidPhases,
    ValidStates,
    ValidTransportationMode,
} from '../model/dossier.entity';
import {
    DossierConfirmDeliveredInput,
    DossierDDTInput,
    DossierIdInput,
    DossierUploadVatCompliancedInput,
} from '../model/dossier.input';

export class DossierPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierInput>({
            company: Joi.string().required(),
            category: Joi.object()
                .valid(...Object.values(ValidCategories))
                .required(),
            transfereeCompany: Joi.string().required(),
            amount: Joi.number().required(),
            parcels: Joi.number().required(),
            ton: Joi.number().required(),
            documents: Joi.array().required(),
        });
    }
}

export class DossierDDTPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierDDTInput>({
            id: Joi.string().required(),
            transportationMode: Joi.object()
                .valid(...Object.values(ValidTransportationMode))
                .required(),
            carrierName: Joi.string().required().max(Dossier.NAME_LENGTH),
            carrierVAT: Joi.string()
                .required()
                .length(Dossier.VAT_NUMBER_LENGTH),
            pickupDate: Joi.date().required(),
            expectedDeliveryDate: Joi.date().required(),
            pickupAddress: Joi.string().required(),
            destinationAddress: Joi.string().required(),
            document: Joi.string().required(),
        });
    }
}

export class DossierIdInputPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierIdInput>({
            id: Joi.string().required(),
            document: Joi.string().required(),
        });
    }
}

export class DossierConfirmDeliveredInputPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierConfirmDeliveredInput>({
            id: Joi.string().required(),
            deliveredDate: Joi.date().required(),
            compliance: Joi.string().required(),
            note: Joi.string().optional().max(Dossier.NAME_LENGTH).allow(''),
            document: Joi.string().optional(),
        });
    }
}

export class DossierUploadVatComplianceInputPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierUploadVatCompliancedInput>({
            id: Joi.string().required(),
            amountVAT: Joi.number().required(),
            paymentDate: Joi.date().required(),
            document: Joi.string().optional(),
        });
    }
}

export class DossierFilterPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DossierFilter>({
            startCreationDate: Joi.date().optional(),
            endCreationDate: Joi.date().optional(),
            skip: Joi.number().optional(),
            max: Joi.number().optional(),
            creator: Joi.string().optional(),
            phase: Joi.object()
                .valid(...Object.values(ValidPhases))
                .optional(),
            state: Joi.object()
                .valid(...Object.values(ValidStates))
                .optional(),
            orderBy: Joi.object<OrderByType>({
                column: Joi.string()
                    .valid(
                        'creation_date',
                        'id',
                        'company.business_name',
                        'transfereeCompany.business_name'
                    )
                    .required(),
                direction: Joi.string().valid('ASC', 'DESC').required(),
            }).optional(),
        });
    }
}
