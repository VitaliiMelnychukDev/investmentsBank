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
import { ActivateDto } from '../dtos/card/activate.dto';
import { BankMessage } from '../types/message';
import { GetBalanceDto } from '../dtos/card/get-balance.dto';

@Controller('card')
export class CardController {
  constructor(private cardService: CardService) {}

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Get('get-balance')
  public async getBalance(
    @Query(new ValidationPipe()) getBalanceParas: GetBalanceDto,
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
  @Post('create')
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
    @Body(new ValidationPipe()) activateBody: ActivateDto,
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
}
