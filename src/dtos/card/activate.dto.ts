import { IsString } from 'class-validator';

export class ActivateDto {
  @IsString()
  cardNumber: string;
}
