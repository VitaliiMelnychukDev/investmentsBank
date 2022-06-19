import { IResponse } from '../types/general';
import { Body, Controller, Post, Req, ValidationPipe } from '@nestjs/common';
import { AccountRole } from '../types/account';
import { AuthNeeded } from '../decorators/auth.decorator';
import { Roles } from '../decorators/roles.decorator';
import { CardCodeService } from '../services/card-code.service';
import { CreateDto } from '../dtos/card-code/create.dto';
import { IAuthorizedRequest } from '../types/request';
import { ICreateCardCode } from '../types/card-code';

@Controller('card-code')
export class CartCodeController {
  constructor(private cardCodeService: CardCodeService) {}

  @AuthNeeded()
  @Roles(AccountRole.User, AccountRole.Bank)
  @Post()
  public async create(
    @Body(new ValidationPipe()) createBody: CreateDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<ICreateCardCode>> {
    return {
      data: {
        code: await this.cardCodeService.create(
          request.account.accountId,
          createBody.cardNumber,
          createBody.expirationHours,
          createBody.limit,
        ),
      },
    };
  }
}
