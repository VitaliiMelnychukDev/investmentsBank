import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionError } from '../types/error';
import { GetTransactionsDto } from '../dtos/shared/get-transactions.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  public async get(
    accountId: number,
    getCardCodeParams: GetTransactionsDto,
    bankSearch = false,
  ): Promise<void> {
    //TBD
  }

  public async add(transaction: Transaction): Promise<void> {
    try {
      transaction.createdAt = new Date().getTime();
      await this.transactionRepository.save(transaction);

      return;
    } catch {
      throw new BadRequestException(TransactionError.SaveTransactionFail);
    }
  }

  public async getByIdentifierId(
    identifierId: number,
    errorMessage: string,
  ): Promise<Transaction | null> {
    try {
      return this.transactionRepository.findOne({
        where: {
          transactionIdentifierId: identifierId,
        },
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }
  }
}
