import { Aggregate } from '../../../../../common/Aggregate';
import { Uuid } from '../../../../../common/Uuid';
import { Assignment } from '../Assignment';
import { AssignmentStatus } from '../AssignmentStatus';
import { Location } from '../Location';
import { Order } from '../order/Order';
import { OrderStatus } from '../order/OrderStatus';
import { Volume } from '../Volume';
import { AssignmentSnapshot } from './AssignmentSnapshot';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({ name: 'couriers' })
export class Courier extends Aggregate<Uuid> {
  @PrimaryColumn('uuid', {
    transformer: {
      to: (id: Uuid) => id.toString(),
      from: (id: string) => Uuid.create(id),
    },
  })
  public override readonly id: Uuid;
  @Column({ name: 'x', type: 'integer' })
  private _x: number;
  @Column({ name: 'y', type: 'integer' })
  private _y: number;
  @Column({ name: 'name', type: 'varchar' })
  private _name: string;
  @Column({
    name: 'max_volume',
    type: 'integer',
    transformer: {
      to: (volume: Volume) => volume.value,
      from: (value: number) => Volume.create(value),
    },
  })
  private readonly _maxVolume: Volume = Volume.create(
    Volume.DEFAULT_MAX_VOLUME,
  );
  @OneToMany(() => Assignment, (assignment) => assignment.courier, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  private _assignments: Assignment[] = [];

  constructor(location: Location, name: string) {
    if (
      location === null ||
      location === undefined ||
      !(location instanceof Location)
    ) {
      throw new Error('location is required');
    }

    if (
      name === null ||
      name === undefined ||
      typeof name !== 'string' ||
      name.trim() === ''
    ) {
      throw new Error('name is required');
    }

    const id = Uuid.generate();
    super(id);
    this.id = id;

    this._x = location.xCoordinate;
    this._y = location.yCoordinate;
    this._name = name;
  }

  public get location(): Location {
    return Location.create(this._x, this._y);
  }

  public get name(): string {
    return this._name;
  }

  public get maxVolume(): Volume {
    return this._maxVolume;
  }

  public get assignments(): ReadonlyArray<AssignmentSnapshot> {
    return Object.freeze(
      this._assignments.map((assignment) =>
        Object.freeze({
          orderId: assignment.orderId,
          location: assignment.location,
          volume: assignment.volume,
          status: assignment.status,
        }),
      ),
    );
  }

  public canTakeOrder(order: Order): boolean {
    if (order === null || order === undefined || !(order instanceof Order)) {
      return false;
    }

    if (this._assignments.some((a) => a.orderId.equals(order.id))) {
      return false;
    }

    if (order.status !== OrderStatus.Created) {
      return false;
    }

    try {
      return this.getVolumeOfAssignments()
        .add(order.volume)
        .isLessThanOrEqualTo(this._maxVolume);
    } catch {
      return false;
    }
  }

  public addAssignment(order: Order): void {
    if (order === null || order === undefined || !(order instanceof Order)) {
      throw new Error('order is required');
    }

    if (order.status !== OrderStatus.Created) {
      throw new Error('Cannot assign an order that is not in Created status');
    }

    if (this._assignments.some((a) => a.orderId.equals(order.id))) {
      throw new Error('Assignment for this order already exists');
    }

    try {
      const totalVolume = this.getVolumeOfAssignments().add(order.volume);
      if (totalVolume.isGreaterThan(this._maxVolume)) {
        throw new Error('Cannot add assignment, exceeds max volume');
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cannot add assignment, exceeds max volume'
      ) {
        throw error;
      }

      throw new Error('Cannot add assignment, exceeds max volume');
    }

    const assignment = new Assignment(
      order.id,
      order.location,
      order.volume,
      AssignmentStatus.Assigned,
      this.id,
    );

    this._assignments.push(assignment);
  }

  public completeAssignment(orderId: Uuid): void {
    if (
      orderId === null ||
      orderId === undefined ||
      !(orderId instanceof Uuid)
    ) {
      throw new Error('orderId is required');
    }

    const assignment = this._assignments.find((a) => a.orderId.equals(orderId));
    if (!assignment) {
      throw new Error('Assignment not found for the given order id');
    }

    assignment.complete(this.location);
  }

  public updateLocation(newLocation: Location): void {
    if (
      newLocation === null ||
      newLocation === undefined ||
      !(newLocation instanceof Location)
    ) {
      throw new Error('new location is required');
    }

    if (newLocation.distanceTo(this.location) > 1) {
      throw new Error('Courier is too far away');
    }

    this._x = newLocation.xCoordinate;
    this._y = newLocation.yCoordinate;
  }

  public validateLoadedState(): void {
    Location.create(this._x, this._y);
    if (typeof this._name !== 'string' || this._name.trim() === '')
      throw new Error('name is required');
    if (!this._maxVolume.equals(Volume.create(Volume.DEFAULT_MAX_VOLUME)))
      throw new Error('Invalid maximum volume');
    if (!Array.isArray(this._assignments))
      throw new Error('Assignments must be loaded');
    if (this.getVolumeOfAssignments().isGreaterThan(this._maxVolume))
      throw new Error('Courier volume exceeds maximum');
  }

  private getVolumeOfAssignments(): Volume {
    return this._assignments
      .filter((a) => a.status !== AssignmentStatus.Completed)
      .reduce<Volume>(
        (total, assignment) => total.add(assignment.volume),
        Volume.create(0),
      );
  }
}
