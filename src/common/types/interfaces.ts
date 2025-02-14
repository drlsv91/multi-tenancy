import { TenantResponse } from '../../tenant/dtos/tenant-response.dto';
import { IAbstractEntity } from '../abstract.entity';

export interface ITenantEntity extends IAbstractEntity<TenantResponse> {
  name: string;

  email?: string;

  address?: string;
  imgUrl: string;
  onboardingData?: string;

  referralCode?: string;

  referrerId?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date;
}
