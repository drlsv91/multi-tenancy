import { ConflictException } from '@nestjs/common';

import {
  EntitySubscriberInterface,
  EventSubscriber,
  In,
  RecoverEvent,
  SoftRemoveEvent,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AbstractEntity } from '../abstract.entity';
export const DEFAULT_DELETED_TOKEN_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
@EventSubscriber()
export class EntitySubscriber
  implements EntitySubscriberInterface<AbstractEntity>
{
  async afterSoftRemove({ manager, metadata, entityId }: SoftRemoveEvent<any>) {
    if (process.env.ENVIRONMENT === 'test') return;

    const ids = Array.isArray(entityId) ? entityId : [entityId];
    const entities = await manager.find(metadata.target, {
      where: { id: In(ids) },
      withDeleted: true,
    });
    await manager
      .save(
        entities.map((entity: AbstractEntity) => {
          entity.deletedTokenId = uuid();
          return entity;
        }),
      )
      .catch((error) => console.log(error));
  }

  async afterRecover({ manager, metadata, entityId }: RecoverEvent<any>) {
    const ids = Array.isArray(entityId) ? entityId : [entityId];
    const entities = await manager.findBy(metadata.target, { id: In(ids) });
    await manager
      .save(
        entities.map((entity: AbstractEntity) => {
          entity.deletedTokenId = DEFAULT_DELETED_TOKEN_ID;
          return entity;
        }),
      )
      .catch((error) => {
        if (error?.code?.toString() !== '23505') {
          throw error;
        }

        throw new ConflictException(
          'This record cannot be restored because a duplicate exists.',
        );
      });
  }
}
