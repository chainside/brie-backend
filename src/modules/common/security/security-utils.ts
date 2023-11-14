import { User } from '../../user/model';
import { configValidation } from '../provider';
import { PRODUCTION, STAGING, UNIT_TEST } from '../utils/const';

export const generatePayloadTokenJwt = (userData: User): UserPayloadType => {
    return {
        userId: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
    };
};

export type UserPayloadType = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    iat?: number;
    exp?: number;
};

export type VerifiedUserType = UserPayloadType | undefined | null;

export const isTestEnv = () => {
    return configValidation().NODE_ENV === UNIT_TEST;
};

export const isProductionEnv = () => {
    return (
        configValidation().NODE_ENV === PRODUCTION ||
        configValidation().NODE_ENV === STAGING
    );
};
