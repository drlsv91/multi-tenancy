import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisConfig } from '../config/redis';
import { getJetstreamConfig } from '../modules/jetstream';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  private redisConfig: RedisConfig;
  private natsCOnfig: { host: string; port: number };
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly configService: ConfigService,
  ) {
    this.natsCOnfig = getJetstreamConfig();
    this.redisConfig = this.configService.get<RedisConfig>('redis')!;
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.microservice.pingCheck('redis', {
          transport: Transport.REDIS,
          options: {
            host: this.redisConfig.host,
            port: this.redisConfig.port,
          },
        }),
      () =>
        this.microservice.pingCheck('nats', {
          transport: Transport.TCP,
          options: {
            host: this.natsCOnfig.host,
            port: this.natsCOnfig.port,
          },
        }),
    ]);
  }
}
