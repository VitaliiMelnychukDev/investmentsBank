export interface ICreateCardCode {
  code: string;
}

export interface IGetCardCode {
  code: string;
  limit: number;
  expirationDate: number;
  approved: boolean;
  used: boolean;
  cardNumber: string;
}
