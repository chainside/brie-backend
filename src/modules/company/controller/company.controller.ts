import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard, LoggerService } from '../../common';

import { Request } from 'express';
import { AuthService } from '../../common/provider/auth.service';
import { CompanyPipe } from '../flow';
import { Company, CompanyData, CompanyInput } from '../model';
import { CompanyService } from '../service';

@Controller('company')
@ApiTags('company')
@ApiCookieAuth()
export class CompanyController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly companyService: CompanyService,
        private readonly authService: AuthService
    ) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.CREATED, type: CompanyData })
    public async create(
        @Body(CompanyPipe) input: CompanyInput
    ): Promise<CompanyData> {
        const company = await this.companyService.create(input);
        this.logger.debug('Created new company with ID: ' + company.id);

        return company.buildData();
    }

    @Get('/findByBusinessName')
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.OK, isArray: true, type: CompanyData })
    public async findByBusinessName(
        @Req() request: Request,
        @Query('businessName') businessName: string,
        @Query('max') max: number
    ): Promise<CompanyData[]> {
        const userData = await this.authService.decodeTokenAndGetUserData(
            request.cookies.jwtToken
        );
        const companies = await this.companyService.findByBusinessName(
            businessName,
            max
        );
        let companiesFiltered: Company[] = [];
        if (userData) {
            companiesFiltered = companies.filter(
                (company) =>
                    company.legalResidence.split(',')[2].trim() !==
                    userData.company?.legalResidence.split(',')[2].trim()
            );
        }
        this.logger.debug('Searching company by name');
        return companiesFiltered.map((company) => company.buildData());
    }

    @Get('/getCountries')
    @UseGuards(AuthGuard)
    @ApiResponse({ status: HttpStatus.OK, isArray: true })
    public async getCountries(): Promise<string[]> {
        this.logger.debug('Searching company by name');
        return this.companyService.getCountries();
    }
}
