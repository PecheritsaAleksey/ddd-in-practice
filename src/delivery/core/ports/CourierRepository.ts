import { Uuid } from '../../../common/Uuid';
import { Courier } from '../domain/model/courier/Courier';

export const COURIER_REPOSITORY = Symbol('COURIER_REPOSITORY');

export interface CourierRepository {
  add(courier: Courier): Promise<void>;
  update(courier: Courier): Promise<void>;
  findById(id: Uuid): Promise<Courier | null>;
  findAll(): Promise<Courier[]>;
}
