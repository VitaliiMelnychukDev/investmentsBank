export enum TokenError {
  TokenIsNotValid = 'TokenIsNotValid',
}

export enum AccountError {
  AddAccountFail = 'AddAccountFail',
  AccountAlreadyExists = 'AccountAlreadyExists',
  UserDoesNotExist = 'UserDoesNotExist',
}

export enum CardError {
  CreateCardFail = 'CreateCardFail',
  CartWasNotFound = 'CartWasNotFound',
  CardActivationFail = 'CardActivationFail',
  GetCardBalanceFail = 'GetCardBalanceFail',
  GetCardsFail = 'GetCardsFail',
  NotEnoughMoney = 'NotEnoughMoney',
  DepositFail = 'DepositFail',
  WithdrawFail = 'WithdrawFail',
  TransferMoneyFail = 'TransferMoneyFail',
}

export enum CardCodeError {
  CreateCardCodeFail = 'CreateCardCodeFail',
  MaxExpirationHoursExceeded = 'MaxExpirationHoursExceeded',
  GetCardCodesFail = 'GetCardCodesFail',
}

export enum TransactionError {
  SaveTransactionFail = 'SaveTransactionFail',
  GetTransactionsFail = 'GetTransactionsFail',
}
