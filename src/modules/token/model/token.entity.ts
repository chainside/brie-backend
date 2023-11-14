import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/model';
@Entity({ name: 'tokens' })
export class Token {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @ManyToOne(() => User)
    @JoinColumn({
        foreignKeyConstraintName: 'FK_TokenUser',
        referencedColumnName: 'id',
    })
    user: User;

    @CreateDateColumn({ name: 'creation_date', type: 'timestamptz' })
    creationDate: Date;

    @Column()
    expirationDate: Date;
}
