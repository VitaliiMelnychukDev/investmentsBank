import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { AccountRole, accountRoles } from '../types/account';
import { Card } from './card.entity';

@Entity('accounts')
export class Account {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  email: string;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({
    type: 'enum',
    enum: accountRoles,
  })
  role: AccountRole;

  @OneToMany(() => Card, (card: Card) => card.accountId)
  userCards?: Card[];

  @OneToMany(() => Card, (card: Card) => card.bankAccountId)
  bankCards?: Card[];
}
