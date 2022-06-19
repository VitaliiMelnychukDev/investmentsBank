import { IsNumber } from 'class-validator';

export class BankCreateForUserDto {
  @IsNumber()
  userId: number;
}
