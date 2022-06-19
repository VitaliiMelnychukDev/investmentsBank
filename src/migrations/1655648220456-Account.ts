import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { accountRoles } from '../types/account';

export class Account1655648220456 implements MigrationInterface {
  public static idColumn = 'id';
  public static tableName = 'accounts';
  public static emailIndex = `index_${Account1655648220456.tableName}_email`;
  public static roleIndex = `index_${Account1655648220456.tableName}_role`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const emailColumn = 'email';
    const roleColumn = 'role';

    await queryRunner.createTable(
      new Table({
        name: Account1655648220456.tableName,
        columns: [
          {
            name: Account1655648220456.idColumn,
            type: 'int',
            isPrimary: true,
          },
          {
            name: emailColumn,
            type: 'varchar',
            length: '256',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '256',
          },
          {
            name: roleColumn,
            type: 'enum',
            enum: accountRoles,
          },
        ],
      }),
    );

    const emailIndex = new TableIndex({
      name: Account1655648220456.emailIndex,
      columnNames: [emailColumn],
    });

    await queryRunner.createIndex(Account1655648220456.tableName, emailIndex);

    const roleIndex = new TableIndex({
      name: Account1655648220456.roleIndex,
      columnNames: [roleColumn],
    });

    await queryRunner.createIndex(Account1655648220456.tableName, roleIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      Account1655648220456.tableName,
      Account1655648220456.roleIndex,
    );
    await queryRunner.dropIndex(
      Account1655648220456.tableName,
      Account1655648220456.emailIndex,
    );
    await queryRunner.dropTable(Account1655648220456.tableName);
  }
}
