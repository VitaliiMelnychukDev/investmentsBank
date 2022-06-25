import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import {
  TransactionOperation,
  transactionOperations,
  TransactionStatus,
  transactionStatuses,
} from '../../types/transaction';

export class GetTransactionsDto extends PaginationDto {
  @IsString()
  @Length(16, 16)
  @IsOptional()
  cardNumber?: string;

  @IsOptional()
  @IsEnum(transactionStatuses)
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(transactionOperations)
  operation?: TransactionOperation;
}
