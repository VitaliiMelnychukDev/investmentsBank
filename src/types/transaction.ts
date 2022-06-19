export enum TransactionOperation {
  Withdraw = 'withdraw',
  Transfer = 'transfer',
  Deposit = 'deposit',
}

export const transactionOperations = [
  TransactionOperation.Withdraw,
  TransactionOperation.Transfer,
  TransactionOperation.Deposit,
];

export enum TransactionStatus {
  Pending = 'pending',
  Succeed = 'succeed',
  Rejected = 'rejected',
}

export const transactionStatuses = [
  TransactionStatus.Pending,
  TransactionStatus.Succeed,
  TransactionStatus.Rejected,
];
