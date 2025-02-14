import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export type SecurityConfig = {
  jwtExpiry: number | string;
  jwtSecret: string;
  otpExpiry: string;
};

const schema = Joi.object<SecurityConfig>({
  jwtExpiry: Joi.alternatives(Joi.string(), Joi.number()).required(),
  jwtSecret: Joi.string().required(),
  otpExpiry: Joi.string().required(),
});

export const getConfig = (): SecurityConfig => ({
  jwtExpiry: process.env.JWT_EXPIRY ?? '3d',
  jwtSecret: process.env.JWT_SECRET!,
  otpExpiry: process.env.OTP_EXPIRY ?? '5m',
});

/* istanbul ignore next */
export default registerAs('security', () => {
  const config = getConfig();
  Joi.assert(config, schema, 'Security config validation failed.');
  return config;
});
