import { Aggregate } from '../../../../../common/Aggregate';
import { Uuid } from '../../../../../common/Uuid';
import { Location } from '../Location';
import { Volume } from '../Volume';
import { OrderStatus } from './OrderStatus';
import { AfterLoad, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'orders' })
export class Order extends Aggregate<Uuid> {
  @PrimaryColumn('uuid', {
    transformer: {
      to: (id: Uuid) => id.toString(),
      from: (id: string) => Uuid.create(id),
    },
  })
  public override readonly id: Uuid;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  private _status: OrderStatus;
  @Column({ name: 'x', type: 'integer' })
  private _x: number;
  @Column({ name: 'y', type: 'integer' })
  private _y: number;
  @Column({
    name: 'volume',
    type: 'integer',
    transformer: {
      to: (volume: Volume) => volume.value,
      from: (value: number) => Volume.create(value),
    },
  })
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
    this.id = id;
    this._x = location.xCoordinate;
    this._y = location.yCoordinate;
    this._volume = volume;
    this._status = OrderStatus.Created;
  }

  @AfterLoad()
  private validateLoadedState(): void {
    Location.create(this._x, this._y);
    if (!Object.values(OrderStatus).includes(this._status)) {
      throw new Error('Invalid status');
    }
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
    return Location.create(this._x, this._y);
  }

  public get volume(): Volume {
    return this._volume;
  }
}
