import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable, map } from 'rxjs';
import { resolveTranslation } from '../../helpers';

@Injectable()
export class TranslateInterceptor implements NestInterceptor {
  constructor(private readonly i18nService: I18nService) {}

  resolve(data: string | string[], lang: string) {
    if (Array.isArray(data)) {
      return data.map((x) => this.resolve(x, lang));
    }

    const resolved = resolveTranslation(data);
    if (!resolved) return data;

    const { key, args } = resolved;
    return this.i18nService.t(key, { args, lang });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const lang = context.switchToHttp().getRequest().i18nLang;

    return next.handle().pipe(
      map((data) => {
        if (data === null || typeof data === 'undefined') return;

        if (typeof data === 'string') {
          return this.resolve(data, lang);
        }

        if (data.message) {
          data.message = this.resolve(data.message, lang);
        }

        return data;
      }),
    );
  }
}
