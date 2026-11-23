import { BaseEntity } from '../../../../common/BaseEntity';
import { Uuid } from '../../../../common/Uuid';
import { AssignmentStatus } from './AssignmentStatus';
import { Location } from './Location';
import { Volume } from './Volume';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Courier } from './courier/Courier';

@Entity({ name: 'assignments' })
export class Assignment extends BaseEntity<Uuid> {
  @PrimaryColumn('uuid', {
    transformer: {
      to: (id: Uuid) => id.toString(),
      from: (id: string) => Uuid.create(id),
    },
  })
  public override readonly id: Uuid;
  @Column('uuid', {
    name: 'order_id',
    unique: true,
    transformer: {
      to: (id: Uuid) => id.toString(),
      from: (id: string) => Uuid.create(id),
    },
  })
  public readonly orderId: Uuid;
  @Column({ name: 'status', type: 'varchar', length: 20 })
  private _status: AssignmentStatus;
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
  public readonly volume: Volume;
  @ManyToOne(() => Courier, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courier_id' })
  public courier!: Courier;
  @Column('uuid', {
    name: 'courier_id',
    transformer: {
      to: (id: Uuid) => id.toString(),
      from: (id: string) => Uuid.create(id),
    },
  })
  private readonly _courierId?: Uuid;

  constructor(
    orderId: string | Uuid,
    location: Location,
    volume: Volume,
    status: AssignmentStatus = AssignmentStatus.Assigned,
    courierId?: Uuid,
  ) {
    const id = Uuid.generate();
    super(id);
    this.id = id;

    if (orderId === null || orderId === undefined) {
      throw new Error('order id is required');
    }

    if (typeof orderId === 'string' && orderId.trim() === '') {
      throw new Error('order id is required');
    }

    const normalizedOrderId =
      orderId instanceof Uuid ? orderId : Uuid.create(orderId);

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

    if (status !== AssignmentStatus.Assigned) {
      throw new Error('Assignment status must be Assigned on creation');
    }

    this.orderId = normalizedOrderId;
    this._x = location.xCoordinate;
    this._y = location.yCoordinate;
    this.volume = volume;
    this._status = status;
    this._courierId = courierId;
  }

  public get location(): Location {
    return Location.create(this._x, this._y);
  }

  @AfterLoad()
  private validateLoadedState(): void {
    Location.create(this._x, this._y);
    if (!Object.values(AssignmentStatus).includes(this._status))
      throw new Error('Invalid assignment status');
  }

  public get status(): AssignmentStatus {
    return this._status;
  }

  public complete(courierLocation: Location): void {
    if (
      courierLocation === null ||
      courierLocation === undefined ||
      !(courierLocation instanceof Location)
    ) {
      throw new Error('courierLocation is required');
    }

    if (this._status === AssignmentStatus.Completed) {
      return;
    }

    if (this._status !== AssignmentStatus.Assigned) {
      throw new Error('Only assigned assignment can be completed');
    }

    if (courierLocation.distanceTo(this.location) > 1) {
      throw new Error('Courier is too far away');
    }

    this._status = AssignmentStatus.Completed;
  }
}
