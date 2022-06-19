import { IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsNumber()
  bankId: number;
}
