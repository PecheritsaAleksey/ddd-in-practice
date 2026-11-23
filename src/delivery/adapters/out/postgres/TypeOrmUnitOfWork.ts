import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Courier } from '../../../core/domain/model/courier/Courier';
import { Order } from '../../../core/domain/model/order/Order';
import { UnitOfWork } from '../../../core/ports/UnitOfWork';
import { CourierRepository } from '../../../core/ports/CourierRepository';
import { OrderRepository } from '../../../core/ports/OrderRepository';
import { TypeOrmCourierRepository } from './TypeOrmCourierRepository';
import { TypeOrmOrderRepository } from './TypeOrmOrderRepository';

@Injectable()
export class TypeOrmUnitOfWork implements UnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async transaction<T>(
    work: (repositories: {
      orders: OrderRepository;
      couriers: CourierRepository;
    }) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction((manager) =>
      work({
        orders: new TypeOrmOrderRepository(manager.getRepository(Order)),
        couriers: new TypeOrmCourierRepository(manager.getRepository(Courier)),
      }),
    );
  }
}
