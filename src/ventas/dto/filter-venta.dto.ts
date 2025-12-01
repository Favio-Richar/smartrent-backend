import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FilterVentaDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
