import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { jwtErrorHandler } from '../../helpers/jwt';
import { AuthUser } from '../types';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(
    req: Request & {
      user: AuthUser;
      tenantId?: string;
    },
    res: Response,
    next: NextFunction,
  ) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ').pop() ?? '';

      const verifiedPayload = await jwtErrorHandler<AuthUser>(() =>
        this.jwtService.verifyAsync(token),
      );

      req.user = verifiedPayload;

      const { tenantId } = verifiedPayload;

      req.tenantId = tenantId;
    }

    next();
  }
}
