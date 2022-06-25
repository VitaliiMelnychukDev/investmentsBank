import { CardNumberDto } from './card-number.dto';
import { IsNumber, Max } from 'class-validator';

export class ChangeBalanceDto extends CardNumberDto {
  @IsNumber()
  @Max(100000000)
  amount: number;
}
