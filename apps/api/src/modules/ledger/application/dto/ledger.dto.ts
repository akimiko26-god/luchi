import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class TransferRaysDto {
  @ApiProperty({ example: 'anna_kind' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  toUsername!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(100000)
  amount!: number;

  @ApiPropertyOptional({ example: 'Спасибо за помощь' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export type RayHistoryItem = {
  id: string;
  type: string;
  amount: number;
  direction: 'in' | 'out';
  reason: string;
  createdAt: string;
};

export type RayWalletDto = {
  balance: number;
  history: RayHistoryItem[];
};
