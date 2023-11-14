import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as fs from 'fs';
import { configValidation } from '.';
import { Token, TokenInput } from '../../token/model';
import { TokenService } from '../../token/service';
import { LoginUserInput, User, UserData } from '../../user/model';
import { UserService } from '../../user/service';
import { generatePayloadTokenJwt } from '../security/security-utils';
import { UserPayloadType } from './../security/security-utils';
import _ = require('lodash');

@Injectable()
export class AuthService {
    public constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly tokenService: TokenService
    ) {}

    maxAgeRefreshTokenWeek = 7;
    maxAgeRefreshTokenMonth = 30;
    maxAgeToken = 30;

    async decodeToken(token: string): Promise<UserPayloadType> {
        const obj = this.jwtService.decode(token);
        let payload: UserPayloadType = {
            userId: '',
            email: '',
            firstName: '',
            lastName: '',
        };
        if (!_.isNull(obj) && !_.isString(obj)) {
            payload = {
                userId: obj.userId,
                email: obj.email,
                firstName: obj.firstName,
                lastName: obj.lastName,
            };
        }
        return payload;
    }

    async decodeTokenAndGetUserData(token: string): Promise<UserData> {
        const obj = this.jwtService.decode(token);
        let user: User = new User();
        if (!_.isNull(obj) && !_.isString(obj)) {
            const userFound = await this.userService.findOneById(obj.userId);
            if (_.isNull(userFound)) {
                throw new UnauthorizedException();
            }
            user = userFound;
        }
        return user.buildData();
    }

    async checkToken(token: string): Promise<boolean> {
        try {
            await this.jwtService.verify(token, {
                publicKey: fs.readFileSync(configValidation().JWT_PUBLIC_KEY),
                algorithms: ['RS256'],
            });
        } catch (err) {
            return false;
        }
        return true;
    }

    async checkRefreshToken(idUser: string): Promise<boolean> {
        const refreshToken = await this.tokenService.findOneByUser(idUser);
        if (_.isEmpty(refreshToken) || _.isNull(refreshToken)) {
            return false;
        }
        if (new Date().getTime() > refreshToken?.expirationDate.getTime()) {
            return false;
        } else {
            return true;
        }
    }

    generateTokenJwt(user: User): string {
        return this.jwtService.sign(generatePayloadTokenJwt(user), {
            privateKey: fs.readFileSync(configValidation().JWT_PRIVATE_KEY),
            algorithm: 'RS256',
            expiresIn: this.maxAgeToken,
        });
    }

    async generateRefreshToken(tokenJwt: string): Promise<string> {
        const saltOrRounds = 10;
        return await bcrypt.hash(tokenJwt, saltOrRounds);
    }

    async saveRefreshToken(
        user: User,
        tokenJwt: string,
        remember: boolean,
        idRefreshToken?: string
    ): Promise<Token> {
        const now = new Date();
        let expirationTime = 0;
        const expirationTime7days =
            now.getTime() + this.maxAgeRefreshTokenWeek * 24 * 30 * 60 * 1000;
        const expirationTime30days =
            now.getTime() + this.maxAgeRefreshTokenMonth * 24 * 60 * 60 * 1000;
        if (remember) {
            expirationTime = expirationTime30days;
        } else {
            expirationTime = expirationTime7days;
        }
        const expDate = new Date(expirationTime);
        const tokenInput: TokenInput = {
            user: user.id,
            token: await this.generateRefreshToken(tokenJwt),
            expirationDate: expDate,
        };

        if (!_.isUndefined(idRefreshToken)) {
            tokenInput.id = idRefreshToken;
        }

        return await this.tokenService.update(tokenInput);
    }

    async generateTokens(
        user: User,
        res: Response,
        remember: boolean,
        idRefreshToken?: string
    ): Promise<UserData> {
        const token = this.generateTokenJwt(user);
        if (_.isEmpty(token)) {
            throw new UnauthorizedException();
        }
        const refreshToken = await this.saveRefreshToken(
            user,
            token,
            remember,
            idRefreshToken
        );
        if (_.isEmpty(refreshToken)) {
            throw new UnauthorizedException();
        }

        res.cookie('jwtToken', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });

        return user.buildData();
    }

    async destroyRefreshTokenByUserId(userId: string): Promise<void> {
        await this.tokenService.deleteByUserId(userId);
    }

    async getRefreshTokenByUserId(idUser: string): Promise<Token | null> {
        return this.tokenService.findOneByUser(idUser);
    }

    async checkAuth(token: string, res: Response) {
        const payloadToken: UserPayloadType = await this.decodeToken(token);
        if (_.isEmpty(payloadToken.userId)) {
            throw new UnauthorizedException();
        }
        const user = await this.userService.findOneById(payloadToken.userId);
        if (_.isNull(user)) {
            throw new UnauthorizedException();
        }
        const check = await this.checkToken(token);
        if (!check) {
            if (!(await this.checkRefreshToken(payloadToken.userId)))
                throw new UnauthorizedException();
            const refreshToken = await this.getRefreshTokenByUserId(
                payloadToken.userId
            );
            if (_.isUndefined(refreshToken)) {
                throw new UnauthorizedException();
            }
            const userData = await this.generateTokens(
                user,
                res,
                true,
                refreshToken?.id
            );
            return userData;
        }

        return user.buildData();
    }

    async login(input: LoginUserInput, res: Response) {
        const user = await this.userService.findOneByEmail(input.email);
        if (!user) {
            throw new UnauthorizedException();
        }

        const isMatch = await bcrypt.compare(input.password, user.password);

        if (isMatch) {
            const idRefreshToken = (
                await this.tokenService.findOneByUser(user.id)
            )?.id;

            return await this.generateTokens(
                user,
                res,
                input.remember,
                idRefreshToken
            );
        } else {
            throw new UnauthorizedException();
        }
    }
}
