import { UnauthorizedException } from '@nestjs/common/exceptions';

/* eslint-disable @typescript-eslint/naming-convention */
export const jwtErrorHandler = async <K>(fn: () => Promise<K>) => {
  const jwtTokenErrors = {
    JsonWebTokenError: (error: any) => {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    },
    TokenExpiredError: () => {
      throw new UnauthorizedException('Token expired');
    },
  };

  try {
    return await fn();
  } catch (error) {
    if (jwtTokenErrors[error.name]) {
      jwtTokenErrors[error.name](error);
    }
    throw new UnauthorizedException('Invalid Token');
  }
};
/* eslint-enable @typescript-eslint/naming-convention */
