import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DossierService } from '../service/dossier.service';

import { AuthGuard, LoggerService } from '../../common';

import { DashboardFilter } from '../model';
import {
    CategoryTrendData,
    DashboardData,
    TradeQuantityTrendData,
    TradeTrendData,
} from '../model/dashboard.data';
@Controller('dashboard')
@ApiTags('dashboard')
@ApiCookieAuth()
export class DashboardController {
    public constructor(
        private readonly logger: LoggerService,
        private readonly dossierService: DossierService
    ) {}

    @Get('')
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DashboardData,
    })
    @ApiQuery({ name: 'startCreationDateFilter', type: Date, required: false })
    @ApiQuery({ name: 'endCreationDateFilter', type: Date, required: false })
    @ApiQuery({ name: 'entryCountry', required: false })
    @ApiQuery({ name: 'destinationCountry', required: false })
    public async newGetDashboard(
        @Query('startCreationDateFilter') startCreationDateFilter?: Date,
        @Query('endCreationDateFilter') endCreationDateFilter?: Date,
        @Query('entryCountry') entryCountry?: string,
        @Query('destinationCountry') destinationCountry?: string
    ): Promise<DashboardData> {
        const filter: DashboardFilter = {
            startCreationDate: startCreationDateFilter,
            endCreationDate: endCreationDateFilter,
            entryCountry: entryCountry,
            destinationCountry: destinationCountry,
        };
        const dossierCount: number =
            await this.dossierService.getCountByFilters(filter);
        const dossierClosedCount: number =
            await this.dossierService.getClosedDossierCountByFilters(filter);
        const deliveredTotal: number =
            await this.dossierService.getDeliveredTotalByFilters(filter);
        const avgTime: number = await this.dossierService.getAvgTimeByFilters(
            filter
        );
        const tradeTrends: TradeTrendData[] =
            await this.dossierService.getTradeTrendsByFilters(filter);
        const categoryTrends: CategoryTrendData[] =
            await this.dossierService.getTradeCategoryTrendsByFilters(filter);
        const quantityTrends: TradeQuantityTrendData[] =
            await this.dossierService.getTradeQuantityTrendsByFilters(filter);
        this.logger.debug('getDashboard called');
        return {
            count: dossierCount,
            closed: dossierClosedCount,
            deliveredTotal: deliveredTotal,
            avgTime: avgTime,
            tradeTrends: tradeTrends,
            categoryTrends: categoryTrends,
            quantityTrends: quantityTrends,
        };
    }
}
