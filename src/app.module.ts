import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { CardService } from './services/card.service';
import { CardController } from './controllers/card.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenService } from './services/token.service';
import { PaginationService } from './services/pagination.service';
import { BankController } from './controllers/bank.controller';
import { CardCodeService } from './services/card-code.service';
import { CartCodeController } from './controllers/cart-code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source.config';
import { entitiesList } from './types/general';
import { TransactionService } from './services/transaction.service';
import { ConsumerService } from './services/consumer.service';
import { ProducerService } from './services/producer.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature(entitiesList),
  ],
  controllers: [
    AccountController,
    BankController,
    CardController,
    CartCodeController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ConsumerService,
    ProducerService,
    AccountService,
    CardService,
    TokenService,
    PaginationService,
    CardCodeService,
    TransactionService,
  ],
})
export class AppModule {}
