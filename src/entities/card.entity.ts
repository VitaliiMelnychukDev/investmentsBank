import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { CardCode } from './card-code.entity';
import { Transaction } from './transaction.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  accountId: number;

  @Column({ type: 'int' })
  bankAccountId: number;

  @Column({ type: 'varchar', length: 16, unique: true })
  cardNumber: string;

  @Column({ type: 'int' })
  expiredAtMonth: number;

  @Column({ type: 'int', width: 4 })
  expiredAtYear: number;

  @Column({ type: 'int', width: 3 })
  cvv: number;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'boolean', default: true })
  blocked: boolean;

  @ManyToOne(() => Account, (account: Account) => account.userCards)
  account?: Account;

  @ManyToOne(() => Account, (account: Account) => account.bankCards)
  bankAccount?: Account;

  @OneToMany(() => CardCode, (cardCode: CardCode) => cardCode.cardId)
  cardCodes?: CardCode[];

  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.cardId,
  )
  transactions?: Transaction[];

  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.recipientCardId,
  )
  recipientTransaction?: Transaction[];
}
