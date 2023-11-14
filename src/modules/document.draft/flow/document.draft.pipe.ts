import * as Joi from 'joi';

import { JoiValidationPipe } from '../../common';
import { ValidDocTypes } from '../../document/model/document.entity';
import { DocumentDraftInput } from '../model';

export class DocumentDraftPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<DocumentDraftInput>({
            type: Joi.object()
                .valid(...Object.values(ValidDocTypes))
                .required(),
        });
    }
}
