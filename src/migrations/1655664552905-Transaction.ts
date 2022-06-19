import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import {
  transactionOperations,
  transactionStatuses,
} from '../types/transaction';
import { Card1655652834009 } from './1655652834009-Card';

export class Transaction1655664552905 implements MigrationInterface {
  public static tableName = 'transactions';
  public static cardIdIndex = `index_${Transaction1655664552905.tableName}_cardId`;
  public static cardIdForeignKey = `foreign_key_${Transaction1655664552905.tableName}_cardId`;
  public static recipientCardIdIndex = `index_${Transaction1655664552905.tableName}_recipientCardId`;
  public static recipientCardIdForeignKey = `foreign_key_${Transaction1655664552905.tableName}_recipientCardId`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cardIdColumn = 'cardId';
    const recipientCardIdColumn = 'recipientCardId';
    await queryRunner.createTable(
      new Table({
        name: Transaction1655664552905.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: cardIdColumn,
            type: 'int',
          },
          {
            name: recipientCardIdColumn,
            type: 'int',
          },
          {
            name: 'transactionIdentifierId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'bigint',
          },
          {
            name: 'expiredAt',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'operation',
            type: 'enum',
            enum: transactionOperations,
          },
          {
            name: 'message',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'float',
          },
          {
            name: 'status',
            type: 'enum',
            enum: transactionStatuses,
          },
          {
            name: 'rejectionReason',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    const cardIdIndex = new TableIndex({
      name: Transaction1655664552905.cardIdIndex,
      columnNames: [cardIdColumn],
    });

    await queryRunner.createIndex(
      Transaction1655664552905.tableName,
      cardIdIndex,
    );

    const recipientCardIdIndex = new TableIndex({
      name: Transaction1655664552905.recipientCardIdIndex,
      columnNames: [recipientCardIdColumn],
    });

    await queryRunner.createIndex(
      Transaction1655664552905.tableName,
      recipientCardIdIndex,
    );

    const cardIdForeignKey = new TableForeignKey({
      name: Transaction1655664552905.cardIdForeignKey,
      columnNames: [cardIdColumn],
      referencedColumnNames: [Card1655652834009.idColumn],
      referencedTableName: Card1655652834009.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Transaction1655664552905.tableName,
      cardIdForeignKey,
    );

    const recipientCardIdForeignKey = new TableForeignKey({
      name: Transaction1655664552905.recipientCardIdForeignKey,
      columnNames: [recipientCardIdColumn],
      referencedColumnNames: [Card1655652834009.idColumn],
      referencedTableName: Card1655652834009.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Transaction1655664552905.tableName,
      recipientCardIdForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      Transaction1655664552905.tableName,
      Transaction1655664552905.recipientCardIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Transaction1655664552905.tableName,
      Transaction1655664552905.cardIdForeignKey,
    );
    await queryRunner.dropIndex(
      Transaction1655664552905.tableName,
      Transaction1655664552905.recipientCardIdIndex,
    );
    await queryRunner.dropIndex(
      Transaction1655664552905.tableName,
      Transaction1655664552905.cardIdIndex,
    );
    await queryRunner.dropTable(Transaction1655664552905.tableName);
  }
}
