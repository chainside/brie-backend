import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggerService, UserPayloadType } from '../../common';

import { Request, Response } from 'express';
import { AuthService } from '../../common/provider/auth.service';
import { AuthGuard } from '../../common/security/auth.guard';
import { LoginUserPipe, UserPipe } from '../flow';
import { LoginUserInput, UserData, UserInput } from '../model';
import { UserService } from '../service';
import _ = require('lodash');
@Controller('user')
@ApiTags('user')
@ApiCookieAuth()
export class UserController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.CREATED, type: UserData })
    public async create(@Body(UserPipe) input: UserInput): Promise<UserData> {
        const user = await this.userService.create(input);
        this.logger.debug('Created new user with ID' + user.id);
        return user.buildData();
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, type: UserData })
    public async login(
        @Body(LoginUserPipe) input: LoginUserInput,
        @Res({ passthrough: true }) res: Response
    ): Promise<UserData> {
        this.logger.debug('login called');
        return await this.authService.login(input, res);
    }

    @Post('/logout')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        this.logger.debug('logout called');
        const tokenJwt = request.cookies.jwtToken;
        const payloadToken: UserPayloadType =
            await this.authService.decodeToken(tokenJwt);
        if (_.isEmpty(payloadToken.userId)) {
            throw new UnauthorizedException();
        }
        this.authService.destroyRefreshTokenByUserId(payloadToken.userId);
        res.clearCookie('jwtToken');
    }

    @Get('/checkAuth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    public async checkAuth(
        @Req() request: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<UserData> {
        const token = request.cookies.jwtToken;
        this.logger.debug('checkAuth called');
        return this.authService.checkAuth(token, res);
    }
}
