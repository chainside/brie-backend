import * as Joi from 'joi';

import { JoiValidationPipe } from '../../common';
import { Company, CompanyInput } from '../model';
import {
    ValidCommoditiesSector,
    ValidLegalForms,
} from '../model/company.entity';

export class CompanyPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<CompanyInput>({
            name: Joi.string().required().max(Company.NAME_LENGTH),
            vatNumber: Joi.string()
                .required()
                .length(Company.VAT_NUMBER_LENGTH),
            codeEori: Joi.string().required().max(Company.NAME_LENGTH),
            businessName: Joi.string().required().max(Company.NAME_LENGTH),
            legalForm: Joi.object()
                .valid(...Object.values(ValidLegalForms))
                .required()
                .max(Company.NAME_LENGTH),
            legalResidence: Joi.string()
                .required()
                .pattern(/^[\w\s]+,\s*[\w\s]+,\s*[\w\s]+$/)
                .message(
                    'string.pattern.base {{#label}} must be in the format "address, city, country"'
                )
                .max(Company.NAME_LENGTH),
            commoditiesSector: Joi.object()
                .valid(...Object.values(ValidCommoditiesSector))
                .required()
                .max(Company.NAME_LENGTH),
        });
    }
}
