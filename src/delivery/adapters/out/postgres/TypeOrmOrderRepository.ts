import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Uuid } from '../../../../common/Uuid';
import { Order } from '../../../core/domain/model/order/Order';
import { OrderStatus } from '../../../core/domain/model/order/OrderStatus';
import { OrderRepository } from '../../../core/ports/OrderRepository';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly records: Repository<Order>,
  ) {}

  async add(order: Order): Promise<void> {
    await this.records.insert(order as QueryDeepPartialEntity<Order>);
  }

  async update(order: Order): Promise<void> {
    const result = await this.records.update(
      order.id.toString(),
      order as QueryDeepPartialEntity<Order>,
    );
    if (result.affected === 0) throw new Error('Order not found');
  }

  async findById(id: Uuid): Promise<Order | null> {
    return this.records.findOneBy({ id });
  }

  async findOneCreated(): Promise<Order | null> {
    return this.records
      .createQueryBuilder('orders')
      .where('orders.status = :status', { status: OrderStatus.Created })
      .getOne();
  }

  async findAllAssigned(): Promise<Order[]> {
    return this.records
      .createQueryBuilder('orders')
      .where('orders.status = :status', { status: OrderStatus.Assigned })
      .getMany();
  }
}
