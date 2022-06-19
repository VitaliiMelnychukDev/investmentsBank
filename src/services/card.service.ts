import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountService } from './account.service';
import { CardError } from '../types/error';
import {
  ICardDetails,
  IGetBankCards,
  IGetCardsSharedInfo,
  IGetUserCards,
} from '../types/card';
import { RandomHelper } from '../helpers/random.helper';
import { PaginationService } from './pagination.service';
import { AccountRole } from '../types/account';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Account } from '../entities/account.entity';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { GetCardsDto } from '../dtos/bank/get-cards.dto';

@Injectable()
export class CardService {
  private readonly expirationMonth = 20;

  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    private accountService: AccountService,
    private paginationService: PaginationService,
  ) {}

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
      account.role !== AccountRole.User ||
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
          CardError.CartWasNotFound,
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
