import {
  NatsJetStreamClientProxy,
  NatsJetStreamServer,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomStrategy } from '@nestjs/microservices';
import { getConfig } from '../config/jetstream';

const JetstreamProvider: Provider = {
  provide: 'JETSTREAM',
  useFactory: () => {
    const { connectionOptions } = getConfig();

    return new NatsJetStreamClientProxy({
      connectionOptions: {
        ...connectionOptions,
        connectedHook: (nc) => {
          console.log('From hook: publisher connected to ', nc.getServer());
          console.log('MaxPayloadSize', nc.info?.max_payload, 'bytes');
        },
      },
    });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [JetstreamProvider],
  exports: [JetstreamProvider],
})
export class NatsJetstreamModule {}

export const getJetstreamStrategy = (): CustomStrategy => ({
  strategy: new NatsJetStreamServer(getConfig()),
});

export const getJetstreamConfig = getConfig;
