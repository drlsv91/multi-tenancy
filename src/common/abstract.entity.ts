import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractDto, AbstractIdentityDto } from './abstract.dto';

export abstract class AbstractEntity<T extends AbstractDto = AbstractDto> {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @Column({ nullable: true })
  deletedTokenId: string;

  abstract dtoClass: new (entity: AbstractEntity, options?: any) => T;
  toDto(): T {
    return new this.dtoClass(this);
  }
}
export abstract class AbstractIdentityEntity<
  T extends AbstractIdentityDto = AbstractIdentityDto,
> {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;
  abstract dtoClass: new (entity: AbstractIdentityEntity, options?: any) => T;
  toDto(): T {
    return new this.dtoClass(this);
  }
}

export interface IBaseAbstractEntity<T extends AbstractDto = AbstractDto> {
  id: string;

  dtoClass: typeof AbstractDto;

  toDto?(): T;
}

export interface IAbstractEntity<K extends AbstractDto = AbstractDto>
  extends IBaseAbstractEntity<K> {
  deletedTokenId: string;
}
