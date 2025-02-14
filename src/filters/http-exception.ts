import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Observable, throwError } from 'rxjs';
import { resolveTranslation } from '../helpers';
import { getNormalisedError } from '../utils/error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  resolve(data: string | string[], lang: string) {
    if (Array.isArray(data)) {
      return data.map((x) => this.resolve(x, lang));
    }

    if (typeof data !== 'string') return data;

    const resolved = resolveTranslation(data);
    if (!resolved) return data;

    const { key, args } = resolved;
    return this.i18nService.t(key, { args, lang });
  }

  catch(
    exception: HttpException | RpcException,
    host: ArgumentsHost,
  ): Observable<any> | void {
    const type = host.getType();

    if (type === 'rpc') {
      console.log('RPC error detected...');
      const response = (exception as HttpException).getResponse() as Response;

      return throwError(() => response);
    }

    if (type !== 'http') {
      console.error('Unknown error type...', { exception });

      throw new InternalServerErrorException();
    }

    const ctx = host.switchToHttp();
    const httpResponse = ctx.getResponse<Response>();

    const isHttpInstance = exception instanceof HttpException;

    try {
      if (isHttpInstance) {
        console.log('Error is HTTP instance.');
        const status = exception.getStatus();

        const response = exception.getResponse() as string | any;

        // Translate validation errors
        if (typeof response !== 'string' && response.message) {
          const lang = ctx.getRequest().i18nLang;
          response.message = this.resolve(response.message, lang);
        }

        httpResponse.status(status).json(response);
      } else {
        console.log('Error is not HTTP instance..');
        const { statusCode, response } = getNormalisedError(exception);

        // Translate validation errors
        if (typeof response !== 'string' && response?.message) {
          const lang = ctx.getRequest().i18nLang;
          response.message = this.resolve(response.message, lang);
        }

        if (statusCode) {
          httpResponse.status(statusCode).json(response);
        } else {
          console.error('Unknown error instance type', { exception });
          httpResponse.status(500).json(exception);
        }
      }
    } catch (error) {
      console.log('A logic error was caught in the exception filter.', error);

      httpResponse.status(500).json(exception);
    }
  }
}
