import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AddAccountDto } from '../dtos/account/add.dto';
import { AccountService } from '../services/account.service';
import { AuthNeeded } from '../decorators/auth.decorator';
import { AccountRole } from '../types/account';
import { Roles } from '../decorators/roles.decorator';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { CardService } from '../services/card.service';
import { IAuthorizedRequest } from '../types/request';
import { IResponse } from '../types/general';
import { IGetUserCards } from '../types/card';
import { CardCodeService } from '../services/card-code.service';
import { GetCardCodesDto } from '../dtos/shared/get-card-codes.dto';
import { IGetCardCode } from '../types/card-code';
import { GetTransactionsDto } from '../dtos/shared/get-transactions.dto';
import { TransactionService } from '../services/transaction.service';

@Controller('account')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private cardService: CardService,
    private cardCodeService: CardCodeService,
    private transactionsService: TransactionService,
  ) {}

  @Post('add')
  public async add(
    @Body(new ValidationPipe()) addBody: AddAccountDto,
  ): Promise<void> {
    await this.accountService.addAccount(addBody);
  }

  @AuthNeeded()
  @Roles(AccountRole.User)
  @Get('get-cards')
  public async getCards(
    @Query(new ValidationPipe()) getCardsParams: PaginationDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IGetUserCards[]>> {
    return {
      data: await this.cardService.getUserCards(
        request.account.accountId,
        getCardsParams,
      ),
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.User)
  @Get('get-card-codes')
  public async getCardCodes(
    @Query(new ValidationPipe()) getCardCodeParams: GetCardCodesDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IGetCardCode[]>> {
    return {
      data: await this.cardCodeService.get(
        request.account.accountId,
        getCardCodeParams,
      ),
    };
  }
  @AuthNeeded()
  @Roles(AccountRole.User)
  @Get('get-transactions')
  getTransactions(
    @Query(new ValidationPipe()) getTransactionsParams: GetTransactionsDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<any> {
    return this.transactionsService.get(
      request.account.accountId,
      getTransactionsParams,
    );
  }
}
