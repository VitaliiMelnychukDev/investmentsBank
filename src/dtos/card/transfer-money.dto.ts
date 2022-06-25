import { ChangeBalanceDto } from '../shared/change-balance.dto';
import { IsString, Length } from 'class-validator';

export class TransferMoneyDto extends ChangeBalanceDto {
  @IsString()
  @Length(16, 16)
  recipientCardNumber: string;
}
