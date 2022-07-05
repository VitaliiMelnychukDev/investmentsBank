import { IsNumber } from 'class-validator';

export class BankCreateForUserDto {
  @IsNumber()
  accountId: number;
}
