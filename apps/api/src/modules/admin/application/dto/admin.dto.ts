import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  status?: string;

  @ApiPropertyOptional({ example: 'moderator' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpsertOrganizationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'VERIFIED', 'REJECTED'] })
  @IsOptional()
  @IsIn(['PENDING', 'VERIFIED', 'REJECTED'])
  verificationStatus?: string;
}

export class UpsertProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageEmoji?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  priceRays!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  stock!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['PHYSICAL', 'VOUCHER', 'CERTIFICATE', 'DIGITAL'])
  productType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ACTIVE', 'HIDDEN', 'ARCHIVED'])
  status?: string;
}
