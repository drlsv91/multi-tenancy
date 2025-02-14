import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface I18nConfig {
  watch: boolean;
}

const schema = Joi.object<I18nConfig>({
  watch: Joi.boolean(),
});

export const getConfig = (): I18nConfig => ({
  watch: process.env.I18N_WATCH?.toLowerCase() === 'true',
});

export default registerAs('i18n', (): I18nConfig => {
  const config = getConfig();
  Joi.assert(config, schema, 'I18n config validation failed');
  return config;
});
