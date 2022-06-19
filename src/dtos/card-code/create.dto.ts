import { IsNumber, IsString, Length, Max } from 'class-validator';
import { CardCodeService } from '../../services/card-code.service';

export class CreateDto {
  @IsString()
  @Length(16, 16)
  cardNumber: string;

  @IsNumber()
  limit: number;

  @Max(CardCodeService.maxExpirationHours)
  @IsNumber()
  expirationHours: number;
}
