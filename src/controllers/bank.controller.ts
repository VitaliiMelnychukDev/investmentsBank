import { Controller, Get, Query, Req, ValidationPipe } from '@nestjs/common';
import { IResponse } from '../types/general';
import { CardService } from '../services/card.service';
import { IAuthorizedRequest } from '../types/request';
import { Roles } from '../decorators/roles.decorator';
import { AuthNeeded } from '../decorators/auth.decorator';
import { AccountRole } from '../types/account';
import { IGetBankCards } from '../types/card';
import { GetCardsDto } from '../dtos/bank/get-cards.dto';
import { CardCodeService } from '../services/card-code.service';
import { GetCardCodesDto } from '../dtos/shared/get-card-codes.dto';
import { IGetCardCode } from '../types/card-code';

@Controller('bank')
export class BankController {
  constructor(
    private cardService: CardService,
    private cardCodeService: CardCodeService,
  ) {}

  @AuthNeeded()
  @Roles(AccountRole.Bank)
  @Get('get-cards')
  async activate(
    @Query(new ValidationPipe()) getCardsParams: GetCardsDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IGetBankCards[]>> {
    return {
      data: await this.cardService.getBankCards(
        request.account.accountId,
        getCardsParams,
      ),
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Bank)
  @Get('get-card-codes')
  public async getCardCodes(
    @Query(new ValidationPipe()) getCardCodeParams: GetCardCodesDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IGetCardCode[]>> {
    return {
      data: await this.cardCodeService.get(
        request.account.accountId,
        getCardCodeParams,
        true,
      ),
    };
  }
}
