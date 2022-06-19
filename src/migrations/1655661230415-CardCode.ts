import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { Card1655652834009 } from './1655652834009-Card';

export class CardCode1655661230415 implements MigrationInterface {
  public static tableName = 'card-codes';
  public static cardIdIndex = `index_${CardCode1655661230415.tableName}_cardId`;
  public static codeIndex = `index_${CardCode1655661230415.tableName}_code`;
  public static cardIdForeignKey = `foreign_key_${CardCode1655661230415.tableName}_cardId`;
  public async up(queryRunner: QueryRunner): Promise<void> {
    const cardIdColumn = 'cardId';
    const codeColumn = 'code';
    await queryRunner.createTable(
      new Table({
        name: CardCode1655661230415.tableName,
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
            name: codeColumn,
            type: 'varchar',
            length: '256',
          },
          {
            name: 'expiredAt',
            type: 'bigint',
          },
          {
            name: 'limit',
            type: 'float',
          },
          {
            name: 'approved',
            type: 'boolean',
            default: false,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'deleted',
            type: 'boolean',
            default: false,
          },
        ],
      }),
    );

    const cardIdIndex = new TableIndex({
      name: CardCode1655661230415.cardIdIndex,
      columnNames: [cardIdColumn],
    });

    await queryRunner.createIndex(CardCode1655661230415.tableName, cardIdIndex);

    const codeIndex = new TableIndex({
      name: CardCode1655661230415.codeIndex,
      columnNames: [codeColumn],
    });

    await queryRunner.createIndex(CardCode1655661230415.tableName, codeIndex);

    const cardIdForeignKey = new TableForeignKey({
      name: CardCode1655661230415.cardIdForeignKey,
      columnNames: [cardIdColumn],
      referencedColumnNames: [Card1655652834009.idColumn],
      referencedTableName: Card1655652834009.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      CardCode1655661230415.tableName,
      cardIdForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      CardCode1655661230415.tableName,
      CardCode1655661230415.cardIdForeignKey,
    );
    await queryRunner.dropIndex(
      CardCode1655661230415.tableName,
      CardCode1655661230415.codeIndex,
    );
    await queryRunner.dropIndex(
      CardCode1655661230415.tableName,
      CardCode1655661230415.cardIdIndex,
    );
    await queryRunner.dropTable(CardCode1655661230415.tableName);
  }
}
