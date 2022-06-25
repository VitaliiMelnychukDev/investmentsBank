import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { IResponse, IResponseNoData } from '../types/general';
import { CreateCardDto } from '../dtos/card/create.card';
import { AuthNeeded } from '../decorators/auth.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AccountRole } from '../types/account';
import { IAuthorizedRequest } from '../types/request';
import { CardService } from '../services/card.service';
import { IBalance, ICardDetails } from '../types/card';
import { BankCreateForUserDto } from '../dtos/card/bank-create-for-user.dto';
import { BankMessage } from '../types/message';
import { CardNumberDto } from '../dtos/shared/card-number.dto';
import { ChangeBalanceDto } from '../dtos/shared/change-balance.dto';
import { TransactionOperation } from '../types/transaction';
import { TransferMoneyDto } from '../dtos/card/transfer-money.dto';
import { CardError } from '../types/error';

@Controller('card')
export class CardController {
  constructor(private cardService: CardService) {}

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Get('get-balance')
  public async getBalance(
    @Query(new ValidationPipe()) getBalanceParas: CardNumberDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IBalance>> {
    return {
      data: {
        balance: await this.cardService.getCardBalance(
          getBalanceParas.cardNumber,
          request.account.accountId,
        ),
      },
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Company)
  @Post()
  public async create(
    @Body(new ValidationPipe()) createBody: CreateCardDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<ICardDetails>> {
    const cardDetails: ICardDetails = await this.cardService.createCard(
      request.account.accountId,
      createBody.bankId,
    );

    return {
      data: cardDetails,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Bank)
  @Post('bank-create-for-user')
  public async createForUser(
    @Body(new ValidationPipe()) createBody: BankCreateForUserDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<ICardDetails>> {
    const cardDetails: ICardDetails = await this.cardService.createCard(
      createBody.userId,
      request.account.accountId,
    );

    return {
      data: cardDetails,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Bank)
  @Post('activate')
  async activate(
    @Body(new ValidationPipe()) activateBody: CardNumberDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.cardService.activateCart(
      activateBody.cardNumber,
      request.account.accountId,
    );

    return {
      success: true,
      message: BankMessage.CardSuccessfullyActivated,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Post('deposit')
  public async deposit(
    @Body(new ValidationPipe()) depositBody: ChangeBalanceDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.cardService.changeCardBalance({
      ...depositBody,
      accountId: request.account.accountId,
      operation: TransactionOperation.Deposit,
      message: CardError.DepositFail,
    });
    return {
      success: true,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Post('withdraw')
  public async withdraw(
    @Body(new ValidationPipe()) withdrawBody: ChangeBalanceDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.cardService.changeCardBalance({
      ...withdrawBody,
      accountId: request.account.accountId,
      operation: TransactionOperation.Withdraw,
      message: CardError.WithdrawFail,
    });

    return {
      success: true,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Post('transfer')
  public async transfer(
    @Body(new ValidationPipe()) transferBody: TransferMoneyDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.cardService.changeCardBalance({
      ...transferBody,
      accountId: request.account.accountId,
      operation: TransactionOperation.Transfer,
      message: CardError.TransferMoneyFail,
    });

    return {
      success: true,
    };
  }
}
