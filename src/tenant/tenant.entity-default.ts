import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { ITenantEntity } from '../common/types/interfaces';
import { AbstractEntity } from '../common/abstract.entity';
import { TenantResponse } from './dtos/tenant-response.dto';

@Entity('businesses')
@Index(['name', 'deletedTokenId'], { unique: true })
export class TenantEntity
  extends AbstractEntity<TenantResponse>
  implements ITenantEntity
{
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: '', nullable: true })
  imgUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  onboardingData?: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt: Date;

  dtoClass = TenantResponse;
}
