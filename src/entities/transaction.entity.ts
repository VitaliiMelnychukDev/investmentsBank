import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from './card.entity';
import {
  TransactionOperation,
  transactionOperations,
  TransactionStatus,
  transactionStatuses,
} from '../types/transaction';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cardId: number;

  @Column({ type: 'int', default: null })
  recipientCardId: number;

  @Column({ type: 'int', default: null })
  transactionIdentifierId: number;

  @Column({ type: 'bigint', default: new Date().getTime() })
  createdAt: number;

  @Column({ type: 'bigint', default: null })
  expiredAt: number;

  @Column({
    type: 'enum',
    enum: transactionOperations,
  })
  operation: TransactionOperation;

  @Column({
    type: 'varchar',
    default: null,
  })
  message: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({
    type: 'enum',
    enum: transactionStatuses,
  })
  status: TransactionStatus;

  @Column({
    type: 'varchar',
    default: null,
  })
  rejectionReason: string;

  @ManyToOne(() => Card, (card: Card) => card.transactions)
  card?: Card;

  @ManyToOne(() => Card, (card: Card) => card.recipientTransaction)
  recipientCard?: Card;
}
