import { IsString, Length } from 'class-validator';

export class CardNumberDto {
  @IsString()
  @Length(16, 16)
  cardNumber: string;
}
