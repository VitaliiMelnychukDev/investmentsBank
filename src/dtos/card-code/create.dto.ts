import { IsNumber, IsPositive, IsString, Length, Max } from 'class-validator';
import { CardCodeService } from '../../services/card-code.service';

export class CreateDto {
  @IsString()
  @Length(16, 16)
  cardNumber: string;

  @IsPositive()
  @IsNumber()
  limit: number;

  @Max(CardCodeService.maxExpirationHours)
  @IsPositive()
  @IsNumber()
  expirationHours: number;
}
