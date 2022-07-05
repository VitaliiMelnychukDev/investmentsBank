export enum Topic {
  Accounts = 'accounts',
  BankCardsToCheck = 'bank-cards-to-check',
  BankCardsCheckResponse = 'bank-cards-check-response',
  Transactions = 'transactions',
  TransactionsStatus = 'transactions-status',
}

export const groupId = 'bank-service';

export interface IBankCardsToCheck {
  accountId: number;
  cardNumber: string;
}

export interface ITransaction {
  cardNumber: string;
  cvv: number;
  expirationYear: number;
  expirationMonth: number;
  receiverCardNumber: string;
  amount: number;
  identifierId: number;
}

export type acks = 1 | 0 | -1;
