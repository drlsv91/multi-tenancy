import { registerAs } from '@nestjs/config';
import { NatsJetStreamServerOptions } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import * as Joi from 'joi';

export interface NatsConfig {
  host: string;
  port: number;
}

const schema = Joi.object<NatsJetStreamServerOptions & NatsConfig>({
  connectionOptions: {
    servers: Joi.array().items(Joi.string()).required(),
    name: Joi.string().optional(),
    timeout: Joi.number().optional(),
  },
  consumerOptions: {
    deliverGroup: Joi.string().optional(),
    durable: Joi.string().required(),
    deliverTo: Joi.string().optional(),
    manualAck: Joi.boolean().required(),
  },
  streamConfig: {
    name: Joi.string().required(),
    subjects: Joi.array().items(Joi.string()).required(),
  },
  host: Joi.string().required(),
  port: Joi.number().integer().min(0).required(),
});

export const getConfig = (): NatsJetStreamServerOptions & NatsConfig => ({
  connectionOptions: {
    servers: (process.env.JETSTREAM_URL || 'localhost:4222').split(','),
    name: process.env.APP_NAME || 'multi-tenancy',
    timeout: Number(process.env.REQ_TIMEOUT || '5000'),
  },
  consumerOptions: {
    deliverGroup: process.env.JETSTREAM_DELIVER_GROUP || 'application-group',
    durable: process.env.APP_NAME || 'applications-durable',
    deliverTo:
      process.env.JETSTREAM_CONSUMER_DELIVER_TO || 'applications-deliver-to',
    manualAck: Boolean(process.env.JETSTREAM_MANUAL_ACK || 'true'),
  },
  streamConfig: {
    name: process.env.JETSTREAM_STREAM_NAME || 'applications',
    subjects: (process.env.JETSTREAM_STREAM_SUBJECTS || 'application.*').split(
      ',',
    ),
  },
  host: process.env.NATS_HOST || 'localhost',
  port: parseInt(process.env.NATS_PORT || '4222', 10),
});

export default registerAs(
  'jetstream',
  (): NatsJetStreamServerOptions & NatsConfig => {
    const config = getConfig();

    Joi.assert(config, schema, 'Jetstream config validation failed');
    return config;
  },
);
