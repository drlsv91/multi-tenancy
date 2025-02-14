import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from './config';
import { DatabaseConfig } from './config/database';
import { SnakeNamingStrategy } from './utils/database/snake-naming.strategy';
import { BullModule } from '@nestjs/bull';
import { RedisConfig } from './config/redis';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { SecurityConfig } from './config/security';
import { RedisCacheModule } from './modules/redis-cache';
import { getTranslationModule } from './modules/translation';
import path from 'path';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  LoggerMiddleware,
  TenancyMiddleware,
  TranslateInterceptor,
} from './common';
import { HttpExceptionFilter } from './filters/http-exception';
import { RpcExceptionFilter } from './filters/rpc-exception';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`,
      ],
      load: [...config],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.get<DatabaseConfig>(
          'database',
        ) as TypeOrmModuleOptions;
        return {
          ...config,
          namingStrategy: new SnakeNamingStrategy(),
          entities: ['dist/**/*.entity-default.js'],
          migrations: ['dist/migrations/*{.ts,.js}'],
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { host, password, port } =
          configService.get<RedisConfig>('redis')!;
        return {
          redis: {
            host,
            port,
            password,
          },
        };
      },
    }),
    HttpModule.register({ global: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        const { jwtSecret, jwtExpiry } =
          configService.get<SecurityConfig>('security')!;
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: jwtExpiry },
        };
      },
    }),
    {
      global: true,
      ...RedisCacheModule.registerAsync({
        inject: [ConfigService],
        useFactory(configService: ConfigService) {
          const { host, password, port } =
            configService.get<RedisConfig>('redis')!;

          return {
            host,
            password,
            port,
          };
        },
      }),
    },
    getTranslationModule({
      loaderPath: path.join(__dirname, 'i18n'),
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslateInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, TenancyMiddleware).forRoutes('*');
  }
}
