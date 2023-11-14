import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DossierData } from '.';
import { Company } from '../../company/model';

export enum ValidStates {
    INT_REQ = 'INT_REQ', // integrazione richiesta
    TRANSPORT = 'TRANSPORT', // transporto in corso
    WAIT_APPR = 'WAIT_APPR', //attesa approvazione
    CLOSE = 'CLOSE',
    WAIT_JUST = 'WAIT_JUST', // attesa giustificativo
    CLEARED = 'CLEARED', // merci sdoganate
    AMEND_REQ = 'AMEND_REQ', // rettifica richiesta
}
export enum ValidPhases {
    START = 'START',
    TRANSIT = 'TRANSIT',
    DELIVERED = 'DELIVERED',
    CLOSE = 'CLOSE',
}

export enum ValidCategories {
    MIN_METAL_CHEMICAL = 'MIN_METAL_CHEMICAL',
    APP_COMUNICATION = 'APP_COMUNICATION',
    APP_CONTROL = 'APP_CONTROL',
    APP_PRECISION = 'APP_PRECISION',
    APP_ELECTR_MECH = 'APP_ELECTR_MECH',
    EQUIP_TRANSPORT = 'EQUIP_TRANSPORT',
    MIXED_ART = 'MIXED_ART',
    TEXTILE_MAT = 'TEXTILE_MAT',
    CHEMICAL_PROD = 'CHEMICAL_PROD',
    AGRI_PROD = 'AGRI_PROD',
    OTHER = 'OTHER',
}

export enum ValidTransportationMode {
    PLANE = 'PLANE',
    INTERMODAL = 'INTERMODAL',
    TRAIN = 'TRAIN',
    ROAD = 'ROAD',
    SEA = 'SEA',
}

export enum ValidActions {
    DOSSIER_CREATE = 'DOSSIER_CREATE',
    INT_REQ = 'INT_REQ',
    INT_DOCS = 'INT_DOCS',
    CUSTOMS_APPROVE = 'CUSTOMS_APPROVE',
    DDT_UPLOAD = 'DDT_UPLOAD',
    DELIVERED_CONFIRM = 'DELIVERED_CONFIRM',
    DDT_APPROVE = 'DDT_APPROVE',
    JUST_UPLOAD = 'JUST_UPLOAD',
    JUST_REQ = 'JUST_REQ',
    JUST_APPROVE = 'JUST_APPROVE',
}

export enum ValidRequestType {
    INT_DOCS = 'INT_DOCS',
    DDT_REQ = 'DDT_REQ',
    DELIVERED_CONFIRM = 'DELIVERED_CONFIRM',
    DDT_APPROVE = 'DDT_APPROVE',
    PAY_CONFIRM = 'PAY_CONFIRM',
    JUSTIFY_APPROVE = 'JUSTIFY_APPROVE',
    AMEND_REQ = 'AMEND_REQ',
}

export enum ValidRequestDetails {
    CONF_ERR = 'CONF_ERR',
    DDT_WAIT = 'DDT_WAIT',
    DELIVERED = 'DELIVERED',
    DDT_APPROVE = 'DDT_APPROVE',
    CALCULATE_VAT = 'CALCULATE_VAT',
    NOT_CORRECT_AMOUNT = 'NOT_CORRECT_AMOUNT',
    JUSTIFY_APPROVE = 'JUSTIFY_APPROVE',
}

export enum ValidCompliance {
    OK = 'OK',
    KO = 'KO',
}

@Entity({ name: 'dossier' })
export class Dossier {
    public static readonly NAME_LENGTH = 50;
    public static readonly VAT_NUMBER_LENGTH = 11;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'creation_date', type: 'timestamptz' })
    public creationDate: Date;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({
        foreignKeyConstraintName: 'FK_DossierCompany',
        referencedColumnName: 'id',
    })
    public company: Company;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({
        foreignKeyConstraintName: 'FK_DossierTransfereeCompany',
        referencedColumnName: 'id',
    })
    public transfereeCompany: Company;

    @Column({ name: 'category', enum: ValidCategories })
    public category: ValidCategories;

    @Column({ name: 'amount' })
    public amount: number;

    @Column({ name: 'phase', enum: ValidPhases })
    public phase: ValidPhases;

    @Column({ name: 'state', enum: ValidStates })
    public state: ValidStates;

    @Column({ name: 'parcels' })
    public parcels: number;

    @Column({ name: 'ton' })
    public ton: number;

    @Column({
        name: 'customs_clearace_date',
        type: 'timestamptz',
        nullable: true,
    })
    public customsClearaceDate?: Date;

    //Action
    @Column({
        name: 'request_date',
        type: 'timestamptz',
        nullable: true,
        default: null,
    })
    public requestDate?: Date;

    @Column({ name: 'request_type', enum: ValidRequestType, nullable: true })
    public requestType?: ValidRequestType;

    @Column({
        name: 'request_detail',
        enum: ValidRequestDetails,
        nullable: true,
    })
    public requestDetail?: ValidRequestDetails;

    @Column({ name: 'requester', nullable: true })
    public requester?: string;

    //DDT fields
    @Column({ name: 'transportation_mode', nullable: true })
    public transportationMode?: ValidTransportationMode;

    @Column({
        name: 'carrier_name',
        length: Dossier.NAME_LENGTH,
        nullable: true,
    })
    public carrierName?: string;

    @Column({
        name: 'carrier_VAT',
        length: Dossier.VAT_NUMBER_LENGTH,
        nullable: true,
    })
    public carrierVAT?: string;

    @Column({
        name: 'pickup_date',
        type: 'timestamptz',
        nullable: true,
    })
    public pickupDate?: Date;

    @Column({
        name: 'expected_delivery_date',
        type: 'timestamptz',
        nullable: true,
    })
    public expectedDeliveryDate?: Date;

    @Column({ name: 'pickup_address', nullable: true })
    public pickupAddress?: string;

    @Column({ name: 'destination_address', nullable: true })
    public destinationAddress?: string;

    @Column({
        name: 'delivery_date',
        type: 'timestamptz',
        nullable: true,
    })
    public deliveredDate: Date;

    @Column({ name: 'compliance', nullable: true })
    public compliance: ValidCompliance;

    @Column({ name: 'note', length: Dossier.NAME_LENGTH, nullable: true })
    public note?: string;

    @Column({ name: 'amount_vat', nullable: true })
    public amountVAT: number;

    @Column({
        name: 'payment_date',
        type: 'timestamptz',
        nullable: true,
    })
    public paymentDate: Date;

    @Column({
        name: 'ddt_approve_date',
        type: 'timestamptz',
        nullable: true,
    })
    public ddtApproveDate: Date;

    @Column({ name: 'provider', nullable: true })
    public provider: string;

    @Column({
        name: 'closing_date',
        type: 'timestamptz',
        nullable: true,
    })
    public closingDate: Date;

    public buildData(): DossierData {
        return {
            id: this.id,
            creationDate: this.creationDate,
            category: this.category,
            transfereeCompany: this.transfereeCompany,
            company: this.company,
            amount: this.amount,
            phase: this.phase,
            state: this.state,
            parcels: this.parcels,
            ton: this.ton,
            customsClearaceDate: this.customsClearaceDate,
            carrierName: this.carrierName,
            carrierVAT: this.carrierVAT,
            pickupDate: this.pickupDate,
            pickupAddress: this.pickupAddress,
            expectedDeliveryDate: this.expectedDeliveryDate,
            destinationAddress: this.destinationAddress,
            transportationMode: this.transportationMode,
            requestDate: this.requestDate,
            requestDetail: this.requestDetail,
            requestType: this.requestType,
            requester: this.requester,
            deliveredDate: this.deliveredDate,
            compliance: this.compliance,
            note: this.note,
            amountVAT: this.amountVAT,
            paymentDate: this.paymentDate,
            ddtApproveDate: this.ddtApproveDate,
            provider: this.provider,
            closingDate: this.closingDate,
        };
    }
}
