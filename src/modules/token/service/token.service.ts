import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Equal, FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../../user/model';
import { Token } from '../model';
import { TokenInput } from '../model/token.input';
import _ = require('lodash');

@Injectable()
export class TokenService {
    public constructor(
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    public async update(input: TokenInput): Promise<Token> {
        const token = new Token();

        token.token = input.token;
        const userFound = await this.userRepository.findOneBy({
            id: input.user,
        });
        if (_.isNull(userFound)) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        token.user = userFound;
        token.expirationDate = input.expirationDate;
        if (!_.isUndefined(input.id)) {
            token.id = input.id;
        }

        return this.tokenRepository.save(token);
    }

    public async findOneByUser(idUser: string): Promise<Token | null> {
        const options: FindOptionsWhere<Token> = {
            user: Equal(idUser),
        };
        return await this.tokenRepository.findOne({
            where: options,
            relations: { user: true },
        });
    }

    public async deleteByUserId(idUser: string): Promise<DeleteResult> {
        const options: FindOptionsWhere<Token> = {
            user: Equal(idUser),
        };
        return await this.tokenRepository.delete(options);
    }
}
