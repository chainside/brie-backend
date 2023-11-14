import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ValidDocTypes } from '../../document/model/document.entity';

@Entity({ name: 'documents_draft' })
export class DocumentDraft {
    public static readonly NAME_LENGTH = 50;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', length: DocumentDraft.NAME_LENGTH })
    public name: string;

    @Column({ name: 'size' })
    public size: number;

    @Column({ name: 'type', enum: ValidDocTypes })
    public type: ValidDocTypes;

    @Column({ name: 'file', type: 'bytea' })
    public file: Uint8Array;

    @Column({ name: 'mimetype' })
    public mimetype: string;

    @CreateDateColumn({ name: 'upload_date', type: 'timestamptz' })
    public uploadDate: Date;
}
