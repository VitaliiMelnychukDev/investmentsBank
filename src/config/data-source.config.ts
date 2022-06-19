import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { join } from 'path';
import { entitiesList } from '../types/general';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'test1234',
  database: 'bank',
  entities: entitiesList,
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
};
