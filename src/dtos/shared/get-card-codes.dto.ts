import { PaginationDto } from './pagination.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class GetCardCodesDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @Length(256, 256)
  code?: string;

  @IsString()
  @IsOptional()
  @Length(16, 16)
  cardNumber?: string;
}
