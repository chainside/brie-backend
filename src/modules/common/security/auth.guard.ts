import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../provider/auth.service';
import { isTestEnv } from './security-utils';

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(private readonly authService: AuthService) {}
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        if (isTestEnv()) {
            return true;
        }

        try {
            const jwtToken = context.switchToHttp().getRequest<Request>()
                .cookies.jwtToken;
            await this.authService.checkAuth(
                jwtToken,
                context.switchToHttp().getResponse<Response>()
            );
            return true;
        } catch (err) {
            throw new UnauthorizedException();
        }
    }
}
