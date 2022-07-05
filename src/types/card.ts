import { IShortAccount } from './account';
import { TransactionOperation } from './transaction';
import { CardError } from './error';
import { Transaction } from '../entities/transaction.entity';

export interface ICardDetails {
  cardNumber: string;
  expiredAtYear: number;
  expiredAtMonth: number;
  cvv: number;
}

export interface IBalance {
  balance: number;
}

export interface IGetCardsSharedInfo extends ICardDetails {
  balance: number;
}

export interface IGetUserCards extends IGetCardsSharedInfo {
  bankAccount: IShortAccount;
}

export interface IGetBankCards extends IGetCardsSharedInfo {
  blocked: boolean;
  userAccount: IShortAccount;
}

export interface IChangeBalance {
  accountId: number;
  cardNumber: string;
  recipientCardNumber?: string;
  amount: number;
  operation: TransactionOperation;
  message:
    | CardError.DepositFail
    | CardError.WithdrawFail
    | CardError.TransferMoneyFail;
  transactionIdentifierId?: number;
}
