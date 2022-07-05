import { CardNumberDto } from './card-number.dto';
import { IsNumber, IsPositive, Max } from 'class-validator';

export class ChangeBalanceDto extends CardNumberDto {
  @IsNumber()
  @IsPositive()
  @Max(100000000)
  amount: number;
}
