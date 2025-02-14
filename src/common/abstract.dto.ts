import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity, AbstractIdentityEntity } from './abstract.entity';
export class AbstractDto {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  readonly id: string;
  constructor(entity: AbstractEntity) {
    this.id = entity.id;
  }
}
export class AbstractIdentityDto {
  readonly id: number;
  constructor(entity: AbstractIdentityEntity) {
    this.id = entity.id;
  }
}
