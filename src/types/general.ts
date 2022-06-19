import { BankMessage } from './message';
import { Account } from '../entities/account.entity';
import { Card } from '../entities/card.entity';
import { CardCode } from '../entities/card-code.entity';
import { Transaction } from '../entities/transaction.entity';

type Message = BankMessage;

export interface IResponseNoData {
  success?: boolean;
  message?: Message;
}

export interface IResponse<T> extends IResponseNoData {
  data: T;
}

export const entitiesList = [Account, Card, CardCode, Transaction];
