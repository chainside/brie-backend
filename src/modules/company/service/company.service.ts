import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, ILike, Repository } from 'typeorm';
import { Company, CompanyInput } from '../model';

@Injectable()
export class CompanyService {
    public constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>
    ) {}

    public async create(input: CompanyInput): Promise<Company> {
        const company = new Company();

        company.name = input.name;
        company.vatNumber = input.vatNumber;
        company.codeEori = input.codeEori;
        company.businessName = input.businessName;
        company.legalForm = input.legalForm;
        company.legalResidence = input.legalResidence;
        company.commoditiesSector = input.commoditiesSector;

        return this.companyRepository.save(company);
    }

    public async findByBusinessName(
        businessName: string,
        max: number
    ): Promise<Company[]> {
        return this.companyRepository.find({
            where: { businessName: ILike('%' + businessName + '%') },
            take: max,
        });
    }

    public async findById(id: string): Promise<Company | null> {
        return this.companyRepository.findOne({
            where: { id: Equal(id) },
        });
    }

    public async getCountries(): Promise<string[]> {
        const companies = await this.companyRepository.find();
        const countriesSet = new Set<string>();
        for (const comp of companies) {
            const country = comp.legalResidence.split(',')[2];
            countriesSet.add(country);
        }
        return Array.from(countriesSet).sort();
    }
}
