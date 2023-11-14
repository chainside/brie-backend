import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../modules/user/model';
import { Company } from '../modules/company/model';
import * as bcrypt from 'bcrypt';

export class UsersInsertTable1688728430859 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();

        try {
            const usersRepo = queryRunner.connection.getRepository(User);
            const companiesRepo = queryRunner.connection.getRepository(Company);
            const saltOrRounds = 10;
            const companies = await companiesRepo.find();
            await usersRepo.insert([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: await bcrypt.hash('password1', saltOrRounds),
                    company: companies[0],
                },
                {
                    firstName: 'Rick',
                    lastName: 'Doe',
                    email: 'rick.doe@gmail.com',
                    password: await bcrypt.hash('password2', saltOrRounds),
                    company: companies[1],
                },
                {
                    firstName: 'Hugo',
                    lastName: 'Doe',
                    email: 'hugo.doe@gmail.com',
                    password: await bcrypt.hash('password3', saltOrRounds),
                    company: companies[2],
                },
            ]);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction(); // Annulla la transazione in caso di errore
            throw err;
        }
    }
    down(): Promise<unknown> {
        throw new Error('Method not implemented.');
    }
}
