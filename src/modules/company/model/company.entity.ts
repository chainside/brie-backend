import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyData } from '.';

export enum ValidLegalForms {
    SRL = 'SRL',
    SSRL = 'SSRL',
    SPA = 'SPA',
    SAPA = 'SAPA',
}

export enum ValidCommoditiesSector {
    ORES_METALS_CHEMICALS = 'ORES_METALS_CHEMICALS',
    ELECTRON_INFO_TECH = 'ELECTRON_INFO_TECH',
    COMM_EQUIP = 'COMM_EQUIP',
    COMP_CONTROL_EQUIP = 'COMP_CONTROL_EQUIP',
    PRECISION_EQUIP = 'PRECISION_EQUIP',
    MECHIANICAL_APPARATUS = 'MECHIANICAL_APPARATUS',
    TRANSPORT_EQUIP = 'TRANSPORT_EQUIP',
    MISCIELLANEOUS_ITEMS = 'MISCIELLANEOUS_ITEMS',
    TEXTILES_TEXT_ART = 'TEXTILES_TEXT_ART',
    CHEMICAL_PRODS = 'CHEMICAL_PRODS',
    AGRICULTURAL_PRODS = 'AGRICULTURAL_PRODS',
    OTHER_CATS = 'OTHER_CATS',
}
@Entity({ name: 'companies' })
export class Company {
    public static readonly NAME_LENGTH = 50;
    public static readonly VAT_NUMBER_LENGTH = 11;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', length: Company.NAME_LENGTH })
    public name: string;

    @Column({ name: 'vat_number', length: Company.VAT_NUMBER_LENGTH })
    public vatNumber: string;

    @Column({ name: 'code_eori', length: Company.NAME_LENGTH })
    public codeEori: string;

    @Column({ name: 'business_name', length: Company.NAME_LENGTH })
    public businessName: string;

    @Column({
        name: 'legal_form',
        enum: ValidLegalForms,
        length: Company.NAME_LENGTH,
    })
    public legalForm: ValidLegalForms;

    @Column({ name: 'legal_residence', length: Company.NAME_LENGTH })
    public legalResidence: string;

    @Column({
        name: 'commodities_sector',
        enum: ValidCommoditiesSector,
        length: Company.NAME_LENGTH,
    })
    public commoditiesSector: ValidCommoditiesSector;

    public buildData(): CompanyData {
        return {
            id: this.id,
            name: this.name,
            vatNumber: this.vatNumber,
            codeEori: this.codeEori,
            businessName: this.businessName,
            legalForm: this.legalForm,
            legalResidence: this.legalResidence,
            commoditiesSector: this.commoditiesSector,
        };
    }
}
