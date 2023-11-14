import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserData } from '.';
import { Company } from '../../company/model';
@Entity({ name: 'users' })
export class User {
    public static readonly NAME_LENGTH = 50;
    public static readonly HASH_LENGTH = 60;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name', length: User.NAME_LENGTH })
    public firstName: string;

    @Column({ name: 'last_name', length: User.NAME_LENGTH })
    public lastName: string;

    @Column({ name: 'email', length: User.NAME_LENGTH })
    public email: string;

    @Column({ name: 'password', length: User.HASH_LENGTH })
    public password: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({
        foreignKeyConstraintName: 'FK_UserCompany',
        referencedColumnName: 'id',
    })
    public company?: Company;

    public buildData(): UserData {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            company: this.company || undefined,
        };
    }
}
