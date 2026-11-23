import { Uuid } from '../../../common/Uuid';
import { Order } from '../domain/model/order/Order';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  add(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  findById(id: Uuid): Promise<Order | null>;
  findOneCreated(): Promise<Order | null>;
  findAllAssigned(): Promise<Order[]>;
}
