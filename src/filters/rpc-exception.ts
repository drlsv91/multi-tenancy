import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
  } from '@nestjs/common';
  import { RpcException } from '@nestjs/microservices';
  import { Response } from 'express';
  import { Observable, throwError } from 'rxjs';
  
  @Catch(HttpException)
  export class RpcExceptionFilter implements ExceptionFilter {
    catch(
      exception: HttpException | RpcException,
      host: ArgumentsHost,
    ): Observable<any> | void {
      const type = host.getType();
  
      console.log({ type });
  
      if (type === 'rpc') {
        console.log({ exception });
        return throwError(() => exception);
      }
  
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = (exception as HttpException).getStatus();
      const message = (exception as HttpException).getResponse();
  
      response.status(status).json(message);
    }
  }
  