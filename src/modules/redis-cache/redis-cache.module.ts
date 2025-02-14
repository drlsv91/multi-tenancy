import { RedisCacheService } from './redis-cache.service';
import { Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './redis-cache.module-definition';

@Module({
  providers: [RedisCacheService],
  exports: [RedisCacheService, MODULE_OPTIONS_TOKEN],
})
export class RedisCacheModule extends ConfigurableModuleClass {}
