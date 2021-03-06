import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountError } from '../types/error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsumerService } from './consumer.service';
import { Topic } from '../types/kafka';
import { AccountData } from '../types/account';

@Injectable()
export class AccountService implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private consumerService: ConsumerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.consumerService.addConsumer(Topic.Accounts, {
      eachMessage: async ({ message }): Promise<void> => {
        const accountData: AccountData =
          this.consumerService.getMessageBody<AccountData>(message);
        await this.addAccount(accountData);
      },
    });
  }

  private async addAccount(account: AccountData): Promise<void> {
    let existedAccount: Account | null = null;

    try {
      existedAccount = await this.accountRepository.findOne({
        where: [
          {
            id: account.id,
          },
          {
            email: account.email,
          },
        ],
      });
    } catch {
      throw new BadRequestException(AccountError.AddAccountFail);
    }

    if (existedAccount) {
      throw new BadRequestException(AccountError.AccountAlreadyExists);
    }

    const newAccount = new Account();
    newAccount.id = account.id;
    newAccount.email = account.email;
    newAccount.name = account.name;
    newAccount.role = account.role;

    try {
      await this.accountRepository.save(newAccount);
    } catch {
      throw new BadRequestException(AccountError.AddAccountFail);
    }
  }

  public async getAccount(id: number, errorMessage: string): Promise<Account> {
    let account: Account | null = null;

    try {
      account = await this.accountRepository.findOne({
        where: {
          id,
        },
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }

    if (!account) {
      throw new BadRequestException(errorMessage);
    }

    return account;
  }
}
