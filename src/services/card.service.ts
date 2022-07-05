import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { AccountService } from './account.service';
import { CardError } from '../types/error';
import {
  ICardDetails,
  IChangeBalance,
  IGetBankCards,
  IGetCardsSharedInfo,
  IGetUserCards,
} from '../types/card';
import { RandomHelper } from '../helpers/random.helper';
import { PaginationService } from './pagination.service';
import { AccountRole } from '../types/account';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Account } from '../entities/account.entity';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { GetCardsDto } from '../dtos/bank/get-cards.dto';
import { TransactionOperation, TransactionStatus } from '../types/transaction';
import { Transaction } from '../entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { ConsumerService } from './consumer.service';
import { IBankCardsToCheck, ITransaction, Topic } from '../types/kafka';
import { ProducerService } from './producer.service';

@Injectable()
export class CardService implements OnModuleInit {
  private readonly expirationMonth = 20;

  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    private accountService: AccountService,
    private paginationService: PaginationService,
    private dataSource: DataSource,
    private transactionService: TransactionService,
    private consumerService: ConsumerService,
    private producerService: ProducerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.addBankCardsToCheckConsumer();
    await this.addTransactionConsumer();
  }

  private async addBankCardsToCheckConsumer(): Promise<void> {
    await this.consumerService.addConsumer(Topic.BankCardsToCheck, {
      eachMessage: async ({ message }): Promise<void> => {
        try {
          const bankCardToCheck: IBankCardsToCheck =
            this.consumerService.getMessageBody<IBankCardsToCheck>(message);

          const card: Card = await this.getCard(
            bankCardToCheck.cardNumber,
            CardError.CardWasNotFound,
          );

          if (card.accountId === bankCardToCheck.accountId) {
            await this.producerService.sendMessage(
              Topic.BankCardsCheckResponse,
              card.cardNumber,
              {
                ...bankCardToCheck,
                valid: true,
              },
            );
          }
        } catch {
          console.log('Check User Fail');
        }
      },
    });
  }

  private async addTransactionConsumer(): Promise<void> {
    await this.consumerService.addConsumer(Topic.Transactions, {
      eachMessage: async ({ message }): Promise<void> => {
        const transaction: ITransaction =
          this.consumerService.getMessageBody<ITransaction>(message);

        try {
          const card: Card = await this.getCard(
            transaction.cardNumber,
            CardError.CardWasNotFound,
          );

          if (
            card.cvv === transaction.cvv &&
            card.expiredAtMonth === transaction.expirationMonth &&
            card.expiredAtYear === transaction.expirationYear
          ) {
            await this.changeCardBalance({
              accountId: card.accountId,
              cardNumber: card.cardNumber,
              recipientCardNumber: transaction.receiverCardNumber,
              amount: transaction.amount,
              operation: TransactionOperation.Transfer,
              message: CardError.TransferMoneyFail,
              transactionIdentifierId: transaction.identifierId,
            });
          } else {
            throw new BadRequestException(CardError.TransferMoneyFail);
          }
        } catch {
          await this.producerService.sendMessage(
            Topic.TransactionsStatus,
            transaction.cardNumber,
            {
              transactionIdentifierId: transaction.identifierId,
              succeed: false,
            },
          );
          console.log('Handle Transaction Fail');
        }
      },
    });
  }

  public async getUserCards(
    accountId: number,
    getCardParams: PaginationDto,
  ): Promise<IGetUserCards[]> {
    const cards: Card[] = await this.getCards(accountId, getCardParams);

    return cards.map((card: Card) => {
      return {
        ...this.getSharedCardInfo(card),
        bankAccount: {
          email: card.bankAccount.email,
          name: card.bankAccount.name,
        },
      };
    });
  }

  public async getBankCards(
    bankId: number,
    getCardParams: GetCardsDto,
  ): Promise<IGetBankCards[]> {
    const cards: Card[] = await this.getCards(bankId, getCardParams, true);

    return cards.map((card: Card) => {
      return {
        ...this.getSharedCardInfo(card),
        blocked: card.blocked,
        userAccount: {
          email: card.account.email,
          name: card.account.name,
        },
      };
    });
  }

  public async getCardBalance(
    cardNumber: string,
    accountId: number,
  ): Promise<number> {
    const card: Card = await this.getCard(
      cardNumber,
      CardError.GetCardBalanceFail,
    );

    if (card.bankAccountId !== accountId && card.accountId !== accountId) {
      throw new BadRequestException(CardError.GetCardBalanceFail);
    }

    return card.balance;
  }

  public async createCard(
    accountId: number,
    bankId: number,
  ): Promise<ICardDetails> {
    const account: Account = await this.accountService.getAccount(
      accountId,
      CardError.CreateCardFail,
    );
    const bankAccount: Account = await this.accountService.getAccount(
      bankId,
      CardError.CreateCardFail,
    );

    if (
      (account.role !== AccountRole.User &&
        account.role !== AccountRole.Company) ||
      bankAccount.role !== AccountRole.Bank
    ) {
      throw new BadRequestException(CardError.CreateCardFail);
    }

    const cardDetails: ICardDetails = await this.generateNewCard();

    const newCard: Card = new Card();
    newCard.accountId = accountId;
    newCard.bankAccountId = bankId;
    newCard.cardNumber = cardDetails.cardNumber;
    newCard.expiredAtYear = cardDetails.expiredAtYear;
    newCard.expiredAtMonth = cardDetails.expiredAtMonth;
    newCard.cvv = cardDetails.cvv;
    newCard.balance = 0;
    newCard.blocked = false;

    try {
      await this.cardRepository.save(newCard);

      return cardDetails;
    } catch (e) {
      throw new BadRequestException(CardError.CreateCardFail);
    }
  }

  public async activateCart(cardNumber: string, bankId: number) {
    const card: Card = await this.getCard(
      cardNumber,
      CardError.CardActivationFail,
      true,
      false,
    );

    if (card.bankAccountId !== bankId) {
      throw new BadRequestException(CardError.CardActivationFail);
    }

    if (!card.blocked) return;

    try {
      await this.cardRepository.update({ cardNumber }, { blocked: false });
    } catch {
      throw new BadRequestException(CardError.CardActivationFail);
    }
  }

  public async changeCardBalance({
    accountId,
    cardNumber,
    amount,
    operation,
    recipientCardNumber,
    message,
    transactionIdentifierId,
  }: IChangeBalance): Promise<void> {
    if (
      operation === TransactionOperation.Transfer &&
      (!recipientCardNumber || recipientCardNumber === cardNumber)
    ) {
      throw new BadRequestException(message);
    }

    if (transactionIdentifierId) {
      const transaction: Transaction | null =
        await this.transactionService.getByIdentifierId(
          transactionIdentifierId,
          message,
        );

      if (transaction) {
        throw new BadRequestException(message);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    let card: Card | null = null;
    let recipientCard: Card | null = null;

    const cardRepository = queryRunner.manager.getRepository(Card);

    try {
      card = await cardRepository.findOne({
        where: {
          cardNumber: cardNumber,
        },
        lock: { mode: 'for_no_key_update' },
      });

      if (operation === TransactionOperation.Transfer) {
        recipientCard = await cardRepository.findOne({
          where: {
            cardNumber: recipientCardNumber,
          },
        });
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new BadRequestException(message);
    }

    if (
      !card ||
      (card.accountId !== accountId && card.bankAccountId !== accountId) ||
      (operation === TransactionOperation.Transfer && !recipientCard)
    ) {
      await queryRunner.release();

      throw new BadRequestException(message);
    }

    if (operation !== TransactionOperation.Deposit && card.balance < amount) {
      await queryRunner.release();

      throw new BadRequestException(CardError.NotEnoughMoney);
    }

    try {
      const newBalance =
        operation === TransactionOperation.Deposit
          ? card.balance + amount
          : card.balance - amount;

      await cardRepository.update(
        { cardNumber: cardNumber },
        { balance: newBalance },
      );

      if (operation === TransactionOperation.Transfer) {
        await cardRepository.update(
          { cardNumber: recipientCardNumber },
          { balance: recipientCard?.balance + amount },
        );
      }

      const transaction: Transaction = new Transaction();
      transaction.cardId = card.id;
      transaction.amount = amount;
      transaction.operation = operation;
      transaction.status = TransactionStatus.Succeed;

      if (operation === TransactionOperation.Transfer) {
        transaction.recipientCardId = recipientCard?.id;
      }
      if (transactionIdentifierId) {
        transaction.transactionIdentifierId = transactionIdentifierId;
      }

      await this.transactionService.add(transaction);

      if (transactionIdentifierId) {
        await this.producerService.sendMessage(
          Topic.TransactionsStatus,
          accountId,
          {
            transactionIdentifierId,
            succeed: true,
          },
        );
      }

      await queryRunner.commitTransaction();

      await queryRunner.release();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new BadRequestException(message);
    }
  }

  public async getCard(
    cardNumber: string,
    errorMessage: string,
    checkExpiration = true,
    checkBlocked = true,
  ): Promise<Card> {
    let card: Card | null = null;

    try {
      card = await this.cardRepository.findOne({
        where: {
          cardNumber,
        },
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }

    if (
      !card ||
      (checkExpiration && this.cardExpired(card)) ||
      (checkBlocked && card.blocked)
    ) {
      throw new BadRequestException(errorMessage);
    }

    return card;
  }

  private async getCards(
    accountId: number,
    getCardParams: GetCardsDto,
    bankSearch = false,
  ): Promise<Card[]> {
    const sharedWhereOptions: FindOptionsWhere<Card> = {
      ...(bankSearch && { bankAccountId: accountId }),
      ...(!bankSearch && { accountId }),
    };
    let whereOptions: FindOptionsWhere<Card> | FindOptionsWhere<Card>[] = {};
    if (getCardParams.searchTerm) {
      whereOptions = [
        {
          account: { email: Like(`%${getCardParams.searchTerm}%`) },
          ...sharedWhereOptions,
        },
        {
          account: { name: Like(`%${getCardParams.searchTerm}%`) },
          ...sharedWhereOptions,
        },
      ];
    } else {
      whereOptions = sharedWhereOptions;
    }

    try {
      return await this.cardRepository.find({
        ...this.paginationService.getPaginationParams(getCardParams),
        where: whereOptions,
        relations: bankSearch ? ['account'] : ['bankAccount'],
        order: {
          cardNumber: 'ASC',
        },
      });
    } catch (e) {
      throw new BadRequestException(CardError.GetCardsFail);
    }
  }

  private getSharedCardInfo(card: Card): IGetCardsSharedInfo {
    return {
      expiredAtMonth: card.expiredAtMonth,
      expiredAtYear: card.expiredAtYear,
      cardNumber: card.cardNumber,
      cvv: card.cvv,
      balance: card.balance,
    };
  }

  private async generateNewCard(): Promise<ICardDetails> {
    const expiredAtDate = new Date();
    expiredAtDate.setMonth(expiredAtDate.getMonth() + this.expirationMonth);

    return {
      cardNumber: await this.getUniqueCardNumber(),
      expiredAtYear: expiredAtDate.getFullYear(),
      expiredAtMonth: expiredAtDate.getMonth(),
      cvv: RandomHelper.getNumber(100, 999),
    };
  }

  private async getUniqueCardNumber(): Promise<string> {
    let uniqueCardNumber = '';
    let leftCountToRepeat = 10;

    while (leftCountToRepeat > 0 && !uniqueCardNumber) {
      const randomCardNumber: string = RandomHelper.getNumberString(16);
      leftCountToRepeat--;

      try {
        await this.getCard(
          randomCardNumber,
          CardError.CardWasNotFound,
          false,
          false,
        );
      } catch {
        uniqueCardNumber = randomCardNumber;
      }
    }

    if (!uniqueCardNumber) {
      throw new BadRequestException(CardError.CreateCardFail);
    }

    return uniqueCardNumber;
  }

  private cardExpired(card: Card): boolean {
    const date = new Date();

    return (
      card.expiredAtYear < date.getFullYear() ||
      (card.expiredAtYear === date.getFullYear() &&
        card.expiredAtMonth < date.getMonth())
    );
  }
}
