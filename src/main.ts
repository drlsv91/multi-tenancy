import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { validationExceptionsFactory } from './helpers/';
import { getJetstreamStrategy } from './modules/jetstream';
import { TrimWhitespacePipe } from './common/pipes';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  SWAGGER_RELATIVE_URL,
  SWAGGER_TITLE,
  SWAGGER_VERSION,
} from './common/constants';
import { AppConfig } from './config/app';
import { closeConnections } from './utils/database/connection.util';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const { server, swagger, environment } = configService.get<AppConfig>('app')!;

  const whitelist = [
    // Add whitelists here
    /http(s)?:\/\/(.+)\.tenant\.com$/,
  ];
  // Enable localhost on dev/staging servers only
  if (environment === 'development') {
    whitelist.push(/http(s)?:\/\/localhost:/);
  } else {
    app.use(helmet());
  }

  // cors options
  const options = {
    origin: whitelist,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Content-Disposition',
      'Accept',
      'Accept-Language',
      'Authorization',
      'Cache-control',
      'If-None-Match',
      'Access-Control-Allow-Origin',
      'x-device-token',
      'x-tenant-id',
    ],
    credentials: true,
  };
  app.enableCors(options);

  app
    .useGlobalPipes(
      new TrimWhitespacePipe(),
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: validationExceptionsFactory,
      }),
    )
    .setGlobalPrefix('v1');

  if (swagger.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(SWAGGER_TITLE)
      .setVersion(SWAGGER_VERSION)
      .addBearerAuth()
      .build();

    const swaggerConfigOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        persistAuthorization: true,
        docExpansion: 'none',
        onComplete: () => ((document as any).title = 'RMS'),
      },
    };

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      SWAGGER_RELATIVE_URL,
      app,
      document,
      swaggerConfigOptions,
    );
  }

  const cleanUp = async (): Promise<void> => {
    logger.debug('Server shutting down');
    closeConnections();
  };

  process.on('SIGINT', async () => {
    await cleanUp();
    process.exit(0);
  });

  const jetstreamStrategy = getJetstreamStrategy();
  app.connectMicroservice<MicroserviceOptions>(jetstreamStrategy);

  await app.startAllMicroservices();
  await app.listen(server.port, () =>
    logger.log(`
  ==========================
  Server Running on ${server.port}
  ==========================

  `),
  );
}

bootstrap();
