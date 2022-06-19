import { IShortAccount } from './account';

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
