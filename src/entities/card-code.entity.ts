import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';

@Entity('card-codes')
export class CardCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cardId: number;

  @Column({ type: 'varchar', length: 256 })
  code: string;

  @Column({ type: 'bigint' })
  expiredAt: number;

  @Column({ type: 'float' })
  limit: number;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Card, (card: Card) => card.cardCodes)
  card: Card;
}
