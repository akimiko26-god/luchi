import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AttachmentInputDto {
  @ApiProperty()
  @IsString()
  url!: string;

  @ApiProperty()
  @IsIn(['PHOTO', 'VIDEO', 'DOCUMENT'])
  kind!: string;

  @ApiProperty()
  @IsString()
  originalName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class SubmitDeedDto {
  @ApiProperty()
  @IsUUID()
  taskId!: string;

  @ApiProperty({ example: 'Собрал 12 пакетов мусора в парке' })
  @IsString()
  @MinLength(8)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ type: [AttachmentInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments!: AttachmentInputDto[];

  @ApiProperty({ example: ['olga_help'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  helpedUsernames!: string[];
}

export class ReviewDeedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  override?: boolean;
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  description!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  rewardMin!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  rewardMax!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  maxParticipants?: number;
}
