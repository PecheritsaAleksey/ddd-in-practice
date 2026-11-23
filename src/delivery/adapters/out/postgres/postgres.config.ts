import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Order } from '../../../core/domain/model/order/Order';
import { Courier } from '../../../core/domain/model/courier/Courier';
import { Assignment } from '../../../core/domain/model/Assignment';
import { CreateDelivery1795438607019 } from './migrations/1795438607019-CreateDelivery';

export const postgresOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'username',
  password: process.env.DB_PASSWORD ?? 'secret',
  database: process.env.DB_NAME ?? 'delivery',
  entities: [Order, Courier, Assignment],
  entitySkipConstructor: true,
  migrations: [CreateDelivery1795438607019],
  synchronize: false,
};
