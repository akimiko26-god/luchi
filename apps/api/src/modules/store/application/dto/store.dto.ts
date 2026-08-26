import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PurchaseDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;
}
