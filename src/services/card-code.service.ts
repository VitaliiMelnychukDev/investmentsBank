import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountService } from './account.service';
import { CardService } from './card.service';
import { CardCodeError, CardError } from '../types/error';
import { generate } from 'rand-token';
import { PaginationService } from './pagination.service';
import { IGetCardCode } from '../types/card-code';
import { GetCardCodesDto } from '../dtos/shared/get-card-codes.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardCode } from '../entities/card-code.entity';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardCodeService {
  public static readonly maxExpirationHours = 240;
  private readonly codeLength = 256;

  constructor(
    @InjectRepository(CardCode)
    private cardCodeRepository: Repository<CardCode>,
    private accountService: AccountService,
    private cardService: CardService,
    private paginationService: PaginationService,
  ) {}

  public async create(
    accountId: number,
    cardNumber: string,
    expirationHours: number,
    limit: number,
  ): Promise<string> {
    const card: Card = await this.cardService.getCard(
      cardNumber,
      CardCodeError.CreateCardCodeFail,
    );

    if (card.accountId !== accountId && card.bankAccountId !== accountId) {
      throw new BadRequestException(CardCodeError.CreateCardCodeFail);
    }

    if (limit > card.balance) {
      throw new BadRequestException(CardError.NotEnoughMoney);
    }

    const code: string = generate(this.codeLength);
    const newCardCode: CardCode = new CardCode();
    newCardCode.code = code;
    newCardCode.cardId = card.id;
    newCardCode.expiredAt = this.getTokenExpiration(expirationHours);
    newCardCode.limit = limit;
    newCardCode.approved = true;
    newCardCode.used = false;
    newCardCode.deleted = false;

    try {
      await this.cardCodeRepository.save(newCardCode);

      return code;
    } catch (e) {
      throw new BadRequestException(CardCodeError.CreateCardCodeFail);
    }
  }

  public async get(
    accountId: number,
    getCardCodeParams: GetCardCodesDto,
    bankSearch = false,
  ): Promise<IGetCardCode[]> {
    try {
      const cardCodes: CardCode[] = await this.cardCodeRepository.find({
        ...this.paginationService.getPaginationParams(getCardCodeParams),
        where: {
          ...(bankSearch && { card: { bankAccountId: accountId } }),
          ...(!bankSearch && { card: { accountId } }),
          ...(getCardCodeParams.code && { code: getCardCodeParams.code }),
          ...(getCardCodeParams.cardNumber && {
            card: { cardNumber: getCardCodeParams.cardNumber },
          }),
        },
        relations: ['card'],
        order: {
          id: 'DESC',
        },
      });

      return cardCodes.map((cardCode: CardCode) =>
        this.buildCardCodesResult(cardCode),
      );
    } catch {
      throw new BadRequestException(CardCodeError.GetCardCodesFail);
    }
  }

  private buildCardCodesResult(cardCode: CardCode): IGetCardCode {
    return {
      code: cardCode.code,
      limit: cardCode.limit,
      expirationDate: cardCode.expiredAt,
      approved: cardCode.approved,
      used: cardCode.used,
      cardNumber: cardCode.card.cardNumber,
    };
  }

  private getTokenExpiration(expirationHours: number): number {
    if (CardCodeService.maxExpirationHours < expirationHours) {
      throw new BadRequestException(CardCodeError.MaxExpirationHoursExceeded);
    }

    const date = new Date();
    date.setHours(date.getHours() + expirationHours);

    return date.getTime();
  }
}
