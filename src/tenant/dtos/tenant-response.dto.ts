import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../common/abstract.dto';
import { TenantEntity } from '../tenant.entity-default';

export class TenantResponse extends AbstractDto {
  @ApiProperty({ description: 'Business name', example: 'cooperate' })
  name: string;

  @ApiPropertyOptional({
    description: 'Tenant email address',
    example: 'corporate@google.com',
  })
  email?: string;

  @ApiProperty({ description: 'Business address', example: '45, Broad street' })
  address?: string;

  @ApiProperty({
    description:
      'Determines whether a tenant has completed the onboarding process',
    example: 'true',
  })
  isOnboarded: boolean;

  @ApiProperty({
    description: 'Business image URL',
    example: 'https://imgur.com/xyz',
  })
  imgUrl: string;

  @ApiProperty({ description: 'Date created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date updated' })
  updatedAt: Date;

  constructor(entity: TenantEntity) {
    super(entity);

    this.createdAt = entity.createdAt;
    this.imgUrl = entity.imgUrl;
    this.name = entity.name;
    this.email = entity.email;
    this.address = entity.address;
    this.isOnboarded = !!entity.onboardingData;
    this.updatedAt = entity.updatedAt;
  }
}
