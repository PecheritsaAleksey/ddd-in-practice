import { BaseEntity } from './BaseEntity';

export abstract class Aggregate<TId> extends BaseEntity<TId> {
  constructor(public readonly id: TId) {
    super(id);
  }
}
