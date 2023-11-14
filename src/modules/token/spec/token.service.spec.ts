import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initDataBase } from '../../../test/db-test';
import { ApplicationModule } from '../../app.module';
import { TokenInput } from '../model';
import { TokenService } from '../service/token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/model';
import { Repository } from 'typeorm';

describe('token Service', () => {
    let app: INestApplication;
    let tokenService: TokenService;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        const appModule: TestingModule = await Test.createTestingModule({
            imports: [ApplicationModule],
        }).compile();

        app = appModule.createNestApplication();
        await app.init();
        await initDataBase(app);
        tokenService = app.get<TokenService>(TokenService);
        userRepository = app.get(getRepositoryToken(User));
    });

    afterAll(async () => {
        await app.close();
    });

    it('1 - Should update or create a token', async () => {
        const users = await userRepository.find();
        const ti: TokenInput = {
            token: 'tokentest',
            user: users[0].id,
            expirationDate: new Date(),
        };
        const response = await tokenService.update(ti);
        expect(response.token).toEqual(ti.token);
        expect(response.user.id).toEqual(ti.user);
    });

    it('2 - Should find one token by user id', async () => {
        const users = await userRepository.find();
        const response = await tokenService.findOneByUser(users[0].id);
        expect(response).toBeDefined();
    });

    it('3 - Should delete one token by user id', async () => {
        const users = await userRepository.find();
        const response = await tokenService.deleteByUserId(users[0].id);
        expect(response).toBeDefined();
    });
});
