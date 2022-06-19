import { PaginationDto } from '../shared/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class GetCardsDto extends PaginationDto {
  @IsString()
  @IsOptional()
  searchTerm?: string;
}
