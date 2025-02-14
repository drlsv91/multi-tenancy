import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { AppConfig } from '../../config/app';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const { environment, version } =
        this.configService.get<AppConfig>('app')!;
      const { method, originalUrl, body } = req;
      const { statusCode, statusMessage } = res;

      const message = `${version}-${environment} -> ${method} ${originalUrl} ${statusCode} ${statusMessage} -> Body: ${JSON.stringify(
        body,
      )} `;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}
