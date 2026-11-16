import { Aggregate } from '../../../../../common/Aggregate';
import { Uuid } from '../../../../../common/Uuid';
import { Location } from '../Location';
import { Volume } from '../Volume';
import { OrderStatus } from './OrderStatus';

export class Order extends Aggregate<Uuid> {
  private _status: OrderStatus;
  private _location: Location;
  private _volume: Volume;

  constructor(id: Uuid, location: Location, volume: Volume) {
    if (id === null || id === undefined || !(id instanceof Uuid)) {
      throw new Error('id is required');
    }

    if (
      location === null ||
      location === undefined ||
      !(location instanceof Location)
    ) {
      throw new Error('location is required');
    }

    if (
      volume === null ||
      volume === undefined ||
      !(volume instanceof Volume)
    ) {
      throw new Error('volume is required');
    }

    super(id);
    this._location = location;
    this._volume = volume;
    this._status = OrderStatus.Created;
  }

  public setStatus(status: OrderStatus): void {
    if (status === null || status === undefined) {
      throw new Error('status is required');
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error('Invalid status');
    }

    if (status === OrderStatus.Created) {
      throw new Error('Cannot change status back to Created');
    }

    if (this._status === status) {
      return; // No change needed
    }

    if (this._status === OrderStatus.Completed) {
      throw new Error('Cannot change status of a completed order');
    }

    if (
      this._status === OrderStatus.Created &&
      status === OrderStatus.Completed
    ) {
      throw new Error('Cannot change status from Created to Completed');
    }

    this._status = status;
  }

  public get status(): OrderStatus {
    return this._status;
  }

  public get location(): Location {
    return this._location;
  }

  public get volume(): Volume {
    return this._volume;
  }
}
