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
}

export enum CardCodeError {
  CreateCardCodeFail = 'CreateCardCodeFail',
  MaxExpirationHoursExceeded = 'MaxExpirationHoursExceeded',
  GetCardCodesFail = 'GetCardCodesFail',
}
