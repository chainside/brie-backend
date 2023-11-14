import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DossierService } from './../service/dossier.service';

import { AuthGuard, LoggerService } from '../../common';

import { Request } from 'express';
import { AuthService } from '../../common/provider/auth.service';
import { DossierPipe } from '../flow';
import {
    DossierConfirmDeliveredInputPipe,
    DossierDDTPipe,
    DossierFilterPipe,
    DossierIdInputPipe,
    DossierUploadVatComplianceInputPipe,
} from '../flow/dossier.pipe';
import { DossierData, DossierInput } from '../model';
import { DossierListData } from '../model/dossier.data';
import { DossierFilter } from '../model/dossier.filter';
import {
    DossierConfirmDeliveredInput,
    DossierDDTInput,
    DossierIdInput,
    DossierUploadVatCompliancedInput,
} from '../model/dossier.input';
@Controller('dossier')
@ApiTags('dossier')
@ApiCookieAuth()
export class DossierController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly dossierService: DossierService,
        private readonly authService: AuthService
    ) {}

    @Post('/findByFilters')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DossierListData,
    })
    public async findByFilters(
        @Body(DossierFilterPipe) filter: DossierFilter
    ): Promise<DossierListData> {
        this.logger.debug('Searching dossier by filters');
        const dossierList = await this.dossierService.findByFilters(filter);
        const dossierCount = await this.dossierService.countByFilters(
            filter.startCreationDate,
            filter.endCreationDate,
            filter.creator,
            filter.phase
        );
        const response: DossierListData = {
            count: dossierCount,
            dossier: dossierList,
        };
        return response;
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.OK, type: DossierData })
    @ApiParam({ name: 'id', type: 'string' })
    public async findById(
        @Param('id') id: string
    ): Promise<DossierData | undefined> {
        const dossier = await this.dossierService.findById(id);
        this.logger.debug('Searching dossier');
        return dossier?.buildData();
    }

    @Post()
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.CREATED, type: DossierData })
    public async create(
        @Body(DossierPipe) input: DossierInput,
        @Req() request: Request
    ): Promise<DossierData> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const dossier = await this.dossierService.create(input, userData);
        this.logger.debug('Created new dossier with ID: ' + dossier.id);
        return dossier.buildData();
    }

    @Patch('/uploadDDT')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DossierData,
    })
    public async uploadDDT(
        @Body(DossierDDTPipe) input: DossierDDTInput,
        @Req() request: Request
    ): Promise<DossierData> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const checkUserPermission =
            await this.dossierService.userPermissionProvider(
                userData,
                input.id
            );
        this.logger.debug('UploadDDT dossier');
        if (!checkUserPermission) {
            throw new UnauthorizedException();
        }
        return await this.dossierService.uploadDDT(input, userData);
    }

    @Patch('/confirmDelivered')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DossierData,
    })
    public async confirmDelivered(
        @Body(DossierConfirmDeliveredInputPipe)
        input: DossierConfirmDeliveredInput,
        @Req() request: Request
    ): Promise<DossierData> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const checkUserPermission =
            await this.dossierService.userPermissionProvider(
                userData,
                input.id
            );
        this.logger.debug('ConfirmDelivered dossier');
        if (!checkUserPermission) {
            throw new UnauthorizedException();
        }
        return await this.dossierService.confirmDelivered(input, userData);
    }

    @Patch('/uploadVatCompliance')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DossierData,
    })
    public async uploadVatCompliance(
        @Body(DossierUploadVatComplianceInputPipe)
        input: DossierUploadVatCompliancedInput,
        @Req() request: Request
    ): Promise<DossierData> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const checkUserPermission =
            await this.dossierService.userPermissionProvider(
                userData,
                input.id
            );
        this.logger.debug('UploadVatCompliance dossier');
        if (!checkUserPermission) {
            throw new UnauthorizedException();
        }
        return await this.dossierService.uploadVatCompliance(input, userData);
    }

    @Patch('/intDocs')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DossierData,
    })
    public async intDocs(
        @Body(DossierIdInputPipe)
        input: DossierIdInput,
        @Req() request: Request
    ): Promise<DossierData> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const checkUserPermission =
            await this.dossierService.userPermissionProvider(
                userData,
                input.id
            );
        this.logger.debug('UploadVatCompliance dossier');
        if (!checkUserPermission) {
            throw new UnauthorizedException();
        }
        return await this.dossierService.intDocs(input, userData);
    }
}
