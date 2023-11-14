import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as _ from 'lodash';

@Injectable()
export class GuestGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const jwtToken = context.switchToHttp().getRequest<Request>()
            .cookies.jwtToken;
        return _.isEmpty(jwtToken);
    }
}
