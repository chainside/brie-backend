import * as Joi from 'joi';

import { JoiValidationPipe } from '../../common';
import { LoginUserInput, User, UserInput } from '../model';

export class UserPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<UserInput>({
            firstName: Joi.string().required().max(User.NAME_LENGTH),
            lastName: Joi.string().required().max(User.NAME_LENGTH),
            email: Joi.string().required().max(User.NAME_LENGTH),
            password: Joi.string().required().max(User.HASH_LENGTH),
            company: Joi.string().required().max(User.NAME_LENGTH),
        });
    }
}

export class LoginUserPipe extends JoiValidationPipe {
    public buildSchema(): Joi.Schema {
        return Joi.object<LoginUserInput>({
            email: Joi.string().required().max(User.NAME_LENGTH),
            password: Joi.string().required().max(User.NAME_LENGTH),
            remember: Joi.boolean().required(),
        });
    }
}
