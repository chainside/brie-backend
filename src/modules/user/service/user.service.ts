import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../company/model';
import * as bcrypt from 'bcrypt';
import { User, UserInput } from '../model';

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>
    ) {}

    public async create(input: UserInput): Promise<User> {
        const user = new User();
        const saltOrRounds = 10;

        user.firstName = input.firstName;
        user.lastName = input.lastName;
        user.email = input.email;
        user.password = await bcrypt.hash(input.password, saltOrRounds);
        user.company =
            (await this.companyRepository.findOneBy({ id: input.company })) ||
            undefined;
        return this.userRepository.save(user);
    }

    public async findOneById(userId: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id: userId },
            relations: { company: true },
        });
    }

    public async findOneByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
            relations: { company: true },
        });
    }
}
