import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { Account1655648220456 } from './1655648220456-Account';

export class Card1655652834009 implements MigrationInterface {
  public static tableName = 'cards';
  public static idColumn = 'id';
  public static accountIdIndex = `index_${Card1655652834009.tableName}_accountId`;
  public static bankAccountIdIndex = `index_${Card1655652834009.tableName}_bankAccountId`;
  public static cardNumberIndex = `index_${Card1655652834009.tableName}_cardNumber`;
  public static accountIdForeignKey = `foreign_key_${Card1655652834009.tableName}_accountId`;
  public static bankAccountIdForeignKey = `foreign_key_${Card1655652834009.tableName}_bankAccountId`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const accountIdColumn = 'accountId';
    const bankAccountIdColumn = 'bankAccountId';
    const cardNumberColumn = 'cardNumber';

    await queryRunner.createTable(
      new Table({
        name: Card1655652834009.tableName,
        columns: [
          {
            name: Card1655652834009.idColumn,
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: accountIdColumn,
            type: 'int',
          },
          {
            name: bankAccountIdColumn,
            type: 'int',
          },
          {
            name: cardNumberColumn,
            type: 'varchar',
            length: '256',
            isUnique: true,
          },
          {
            name: 'expiredAtYear',
            type: 'int',
            width: 4,
          },
          {
            name: 'expiredAtMonth',
            type: 'int',
          },
          {
            name: 'cvv',
            type: 'int',
            width: 3,
          },
          {
            name: 'balance',
            type: 'float',
            default: 0,
          },
          {
            name: 'blocked',
            type: 'boolean',
            default: true,
          },
        ],
      }),
    );

    const accountIdIndex = new TableIndex({
      name: Card1655652834009.accountIdIndex,
      columnNames: [accountIdColumn],
    });

    await queryRunner.createIndex(Card1655652834009.tableName, accountIdIndex);

    const bankAccountIdIndex = new TableIndex({
      name: Card1655652834009.bankAccountIdIndex,
      columnNames: [bankAccountIdColumn],
    });

    await queryRunner.createIndex(
      Card1655652834009.tableName,
      bankAccountIdIndex,
    );

    const cardNumberIndex = new TableIndex({
      name: Card1655652834009.cardNumberIndex,
      columnNames: [cardNumberColumn],
    });

    await queryRunner.createIndex(Card1655652834009.tableName, cardNumberIndex);

    const accountIdForeignKey = new TableForeignKey({
      name: Card1655652834009.accountIdForeignKey,
      columnNames: [accountIdColumn],
      referencedColumnNames: [Account1655648220456.idColumn],
      referencedTableName: Account1655648220456.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Card1655652834009.tableName,
      accountIdForeignKey,
    );

    const bankAccountIdForeignKey = new TableForeignKey({
      name: Card1655652834009.bankAccountIdForeignKey,
      columnNames: [bankAccountIdColumn],
      referencedColumnNames: [Account1655648220456.idColumn],
      referencedTableName: Account1655648220456.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Card1655652834009.tableName,
      bankAccountIdForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      Card1655652834009.tableName,
      Card1655652834009.bankAccountIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Card1655652834009.tableName,
      Card1655652834009.accountIdForeignKey,
    );
    await queryRunner.dropIndex(
      Card1655652834009.tableName,
      Card1655652834009.cardNumberIndex,
    );
    await queryRunner.dropIndex(
      Card1655652834009.tableName,
      Card1655652834009.bankAccountIdIndex,
    );
    await queryRunner.dropIndex(
      Card1655652834009.tableName,
      Card1655652834009.accountIdIndex,
    );
    await queryRunner.dropTable(Card1655652834009.tableName);
  }
}
