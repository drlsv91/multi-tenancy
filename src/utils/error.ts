import { RpcException } from '@nestjs/microservices';

export const handleNatsError = (error: any) => {
  throw new RpcException(error);
};

export const getNormalisedError = (exception: any) => {
  const { error, response: errorResponse, status } = exception;
  const statusCode: number = error?.status || error?.statusCode || status;
  const response = error?.response || errorResponse || error;

  return { statusCode, response };
};
