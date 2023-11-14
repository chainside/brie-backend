import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentData } from '.';
import { Dossier } from '../../dossier/model';
import { ValidPhases } from '../../dossier/model/dossier.entity';
import { Company } from '../../company/model';

export enum ValidDocTypes {
    BILL = 'BILL',
    INVOICE = 'INVOICE',
    WAYBILLS = 'WAYBILLS',
    PACKAGING_LIST = 'PACKAGING_LIST',
    CERTIFICATE = 'CERTIFICATE',
    OTHER = 'OTHER',
    DDT = 'DDT',
    VAT = 'VAT',
}

export enum ValidDocStates {
    NOT_NOTARIZED = 'NOT_NOTARIZED',
    NOTARIZED = 'NOTARIZED',
    FAILED = 'FAILED'
}
@Entity({ name: 'documents' })
export class Document {
    public static readonly NAME_LENGTH = 50;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', length: Document.NAME_LENGTH })
    public name: string;

    @Column({ name: 'size' })
    public size: number;

    @Column({ name: 'type', enum: ValidDocTypes })
    public type: ValidDocTypes;

    @Column({ name: 'file', type: 'bytea', nullable: true })
    public file: Uint8Array | null;

    @ManyToOne(() => Dossier, { nullable: true })
    @JoinColumn({
        foreignKeyConstraintName: 'FK_DocumentDossier',
        referencedColumnName: 'id',
    })
    public dossier?: Dossier;

    @Column({ name: 'state', enum: ValidDocStates })
    public state: ValidDocStates;

    @Column({ name: 'mimetype' })
    public mimetype: string;

    @Column({ name: 'phase' })
    public phase: ValidPhases;

    @CreateDateColumn({ name: 'upload_date', type: 'timestamptz' })
    public uploadDate: Date;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({
        foreignKeyConstraintName: 'FK_DocumentCompany',
        referencedColumnName: 'id',
    })
    public uploader: Company;

    @Column({name: 'process_id'})
    public processId?: string;

    @Column({name: 'message_id'})
    public messageId?: string;

    @Column({name: 'tx_id'})
    public txId?: string;

    @Column({name: 'ipfs_link'})
    public ipfsLink?: string;

    public buildData(): DocumentData {
        return {
            id: this.id,
            name: this.name,
            size: this.size,
            type: this.type,
            state: this.state,
            phase: this.phase,
            uploadDate: this.uploadDate,
            uploader: this.uploader,
            messageId: this.messageId,
            processId: this.processId,
            ipfsLink: this.ipfsLink,
            txId: this.txId
        };
    }
}
