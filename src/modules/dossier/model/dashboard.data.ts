import { ApiProperty } from '@nestjs/swagger';
import { ValidCategories } from './dossier.entity';

export class TradeTrendData {
    @ApiProperty({ description: 'count', example: 23 })
    public count: number;

    @ApiProperty({ description: 'ms', example: 23452345234 })
    ms: number;
}
export class TradeQuantityTrendData {
    @ApiProperty({ description: 'count', example: 23 })
    public count: number;

    @ApiProperty({ description: 'ms', example: 233435353535 })
    public ms: number;
}

export class CategoryTrendData {
    @ApiProperty({ description: 'category', enum: ValidCategories })
    public category: ValidCategories;

    @ApiProperty({ description: 'perc', example: 23 })
    public perc: number;
}

export class DashboardData {
    @ApiProperty({ description: 'count', example: 1234 })
    public readonly count: number;

    @ApiProperty({ description: 'closed', example: 345 })
    public readonly closed: number;

    @ApiProperty({ description: 'deliveredTotal', example: 65 })
    public readonly deliveredTotal: number;

    @ApiProperty({ description: 'avgTime', example: 67 })
    public readonly avgTime: number;

    @ApiProperty({ description: 'tradeTrends', type: [TradeTrendData] })
    public readonly tradeTrends: TradeTrendData[];

    @ApiProperty({ description: 'categoryTrends', type: [CategoryTrendData] })
    public readonly categoryTrends: CategoryTrendData[];

    @ApiProperty({ description: 'quantityTrends', type: [TradeTrendData] })
    public readonly quantityTrends: TradeQuantityTrendData[];
}
