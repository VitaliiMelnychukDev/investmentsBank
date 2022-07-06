export enum Topic {
  Accounts = 'accounts',
  BankCardsToCheck = 'bank-cards-to-check',
  BankCardsCheckResponse = 'bank-cards-check-response',
  Transactions = 'transactions',
  CodeTransactions = 'code-transactions',
  TransactionsStatus = 'transactions-status',
}

export const groupId = 'bank-service';

export interface IBankCardsToCheck {
  accountId: number;
  cardNumber: string;
}

interface ITransactionBase {
  receiverCardNumber: string;
  amount: number;
  identifierId: number;
}

export interface ITransaction extends ITransactionBase {
  cardNumber: string;
  cvv: number;
  expirationYear: number;
  expirationMonth: number;
}

export interface ICodeTransaction extends ITransactionBase {
  cardCode: string;
}

export type acks = 1 | 0 | -1;
