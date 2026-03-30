import {
  IsString,
  IsEmail,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  customerName: string;

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shippingCity: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shippingState: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shippingZip: string;

  @ApiProperty({ default: 'US' })
  @IsString()
  @MinLength(1)
  shippingCountry: string;

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
