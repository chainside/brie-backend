import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    Between,
    Equal,
    FindManyOptions,
    FindOptionsWhere,
    Not,
    Repository,
} from 'typeorm';
import { UserData } from '../../user/model';
import { DashboardFilter, Dossier, DossierData, DossierInput } from '../model';
import {
    CategoryTrendData,
    TradeQuantityTrendData,
    TradeTrendData,
} from '../model/dashboard.data';
import { ValidPhases, ValidStates } from '../model/dossier.entity';
import { DossierFilter } from '../model/dossier.filter';
import {
    DossierConfirmDeliveredInput,
    DossierDDTInput,
    DossierIdInput,
    DossierUploadVatCompliancedInput,
} from '../model/dossier.input';
import { DossierRepository } from './dossier.repository';
import _ = require('lodash');
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentService } from '../../document/service';

@Injectable()
export class DossierService {
    public constructor(
        private readonly documentService: DocumentService,
        private readonly transactionalDossierRepository: DossierRepository,
        @InjectRepository(Dossier)
        private readonly dossierRepository: Repository<Dossier>
    ) {}

    public async findById(id: string): Promise<Dossier | null> {
        return this.transactionalDossierRepository.runInTransaction((q) =>
            this.transactionalDossierRepository.findById(id, q)
        );
    }

    public async findByFilters(filter: DossierFilter): Promise<DossierData[]> {
        return this.transactionalDossierRepository.runInTransaction((q) =>
            this.transactionalDossierRepository.findByFilters(filter, q)
        );
    }

    public async create(input: DossierInput, user: UserData): Promise<Dossier> {
        return this.transactionalDossierRepository.runInTransaction((q) =>
            this.transactionalDossierRepository.create(input, user, q)
        );
    }

    public async countByFilters(
        startCreationDateFilter?: Date,
        endCreationDateFilter?: Date,
        creatorFilter?: string,
        phaseFiler?: ValidPhases
    ): Promise<number> {
        const options: FindManyOptions<Dossier> = {};

        options.relations = { company: true, transfereeCompany: true };
        const whereOpt: FindOptionsWhere<Dossier> = {};

        if (
            !_.isUndefined(startCreationDateFilter) &&
            !_.isUndefined(endCreationDateFilter)
        ) {
            whereOpt.creationDate = Between(
                startCreationDateFilter,
                endCreationDateFilter
            );
        }
        if (!_.isUndefined(creatorFilter)) {
            if (creatorFilter[0] !== '!') {
                whereOpt.company = Equal(creatorFilter);
            } else {
                whereOpt.company = Not(Equal(creatorFilter.split('!')[1]));
            }
        }
        if (!_.isUndefined(phaseFiler)) {
            whereOpt.phase = Equal(phaseFiler);
        }

        if (!_.isEmpty(whereOpt)) {
            options.where = whereOpt;
        }
        return this.dossierRepository.count(options);
    }

    public async approveCustomsClearance(): Promise<void> {
        return this.transactionalDossierRepository.runInTransaction(
            async (q) => {
                const dossierList =
                    await this.transactionalDossierRepository.findByFilters(
                        {
                            state: ValidStates.WAIT_APPR,
                            phase: ValidPhases.START,
                        },
                        q
                    );
                for (const dossier of dossierList) {
                    const docsCount = await this.documentService.countByDossier(
                        dossier.id
                    );
                    if (docsCount % 2 === 0) {
                        await this.transactionalDossierRepository.runInTransaction(
                            async (q) => {
                                await this.transactionalDossierRepository.approveCustomsClearance(
                                    dossier.id,
                                    q
                                );
                            }
                        );
                    } else {
                        await this.transactionalDossierRepository.runInTransaction(
                            async (q) => {
                                await this.transactionalDossierRepository.integrationRequestCustoms(
                                    dossier.id,
                                    q
                                );
                            }
                        );
                    }
                }
            }
        );
    }

    public async uploadDDT(
        ddt: DossierDDTInput,
        user: UserData
    ): Promise<DossierData> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.uploadDDT(ddt, user, q);
        });
    }

    public async confirmDelivered(
        confirmDelivered: DossierConfirmDeliveredInput,
        user: UserData
    ): Promise<DossierData> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.confirmDelivered(
                confirmDelivered,
                user,
                q
            );
        });
    }

    public async approveDDT(): Promise<void> {
        return this.transactionalDossierRepository.runInTransaction(
            async (q) => {
                const dossierList =
                    await this.transactionalDossierRepository.findByFilters(
                        {
                            state: ValidStates.WAIT_APPR,
                            phase: ValidPhases.DELIVERED,
                        },
                        q
                    );
                for (const dossier of dossierList) {
                    await this.transactionalDossierRepository.runInTransaction(
                        async (q) => {
                            await this.transactionalDossierRepository.approveDDT(
                                dossier.id,
                                q
                            );
                        }
                    );
                }
            }
        );
    }

    public async approveClosing() {
        return this.transactionalDossierRepository.runInTransaction(
            async (q) => {
                const dossierList =
                    await this.transactionalDossierRepository.findByFilters(
                        {
                            state: ValidStates.WAIT_APPR,
                            phase: ValidPhases.CLOSE,
                        },
                        q
                    );
                for (const dossier of dossierList) {
                    if (dossier.amountVAT % 2 === 0) {
                        await this.transactionalDossierRepository.approveClosing(
                            q,
                            dossier.id
                        );
                    } else {
                        await this.transactionalDossierRepository.rectifyRequest(
                            q,
                            dossier.id
                        );
                    }
                }
            }
        );
    }

    public async uploadVatCompliance(
        uploadVAT: DossierUploadVatCompliancedInput,
        user: UserData
    ): Promise<DossierData> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.uploadVatCompliance(
                uploadVAT,
                user,
                q
            );
        });
    }

    public async intDocs(
        input: DossierIdInput,
        user: UserData
    ): Promise<DossierData> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.intDocs(input, user, q);
        });
    }

    public async userPermissionProvider(
        user: UserData,
        idDossier: string
    ): Promise<boolean> {
        const dossier = await this.findById(idDossier);
        if (_.isNull(dossier)) {
            throw new HttpException('Dossier not exist', HttpStatus.NOT_FOUND);
        }
        return dossier.provider === user.company?.businessName;
    }

    public async getCountByFilters(filter: DashboardFilter): Promise<number> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getCountByFilters(
                filter,
                q
            );
        });
    }

    public async getClosedDossierCountByFilters(
        filter: DashboardFilter
    ): Promise<number> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getClosedDossierCountByFilters(
                filter,
                q
            );
        });
    }

    public async getDeliveredTotalByFilters(
        filter: DashboardFilter
    ): Promise<number> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getDeliveredTotalByFilters(
                filter,
                q
            );
        });
    }

    public async getAvgTimeByFilters(filter: DashboardFilter): Promise<number> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getAvgTimeByFilters(
                filter,
                q
            );
        });
    }

    public async getTradeTrendsByFilters(
        filter: DashboardFilter
    ): Promise<TradeTrendData[]> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getTradeTrendsByFilters(
                filter,
                q
            );
        });
    }

    public async getTradeCategoryTrendsByFilters(
        filter: DashboardFilter
    ): Promise<CategoryTrendData[]> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getTradeCategoryTrendsByFilters(
                filter,
                q
            );
        });
    }

    public async getTradeQuantityTrendsByFilters(
        filter: DashboardFilter
    ): Promise<TradeQuantityTrendData[]> {
        return this.transactionalDossierRepository.runInTransaction((q) => {
            return this.transactionalDossierRepository.getTradeQuantityTrendsByFilters(
                filter,
                q
            );
        });
    }
}
