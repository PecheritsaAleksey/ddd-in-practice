import { Aggregate } from '../../../../../common/Aggregate';
import { Uuid } from '../../../../../common/Uuid';
import { Assignment } from '../Assignment';
import { AssignmentStatus } from '../AssignmentStatus';
import { Location } from '../Location';
import { Order } from '../order/Order';
import { OrderStatus } from '../order/OrderStatus';
import { Volume } from '../Volume';
import { AssignmentSnapshot } from './AssignmentSnapshot';

export class Courier extends Aggregate<Uuid> {
  private _location: Location;
  private _name: string;
  private readonly _maxVolume: Volume = Volume.create();
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

    super(Uuid.generate());

    this._location = location;
    this._name = name;
  }

  public get location(): Location {
    return this._location;
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

    return (
      this.getVolumeOfAssignments() + order.volume.value <=
      this._maxVolume.value
    );
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

    const totalVolume = this.getVolumeOfAssignments() + order.volume.value;
    if (totalVolume > this._maxVolume.value) {
      throw new Error('Cannot add assignment, exceeds max volume');
    }

    const assignment = new Assignment(order.id, order.location, order.volume);

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

    assignment.complete(this._location);
  }

  public updateLocation(newLocation: Location): void {
    if (
      newLocation === null ||
      newLocation === undefined ||
      !(newLocation instanceof Location)
    ) {
      throw new Error('new location is required');
    }

    if (newLocation.distanceTo(this._location) > 1) {
      throw new Error('Courier is too far away');
    }

    this._location = newLocation;
  }

  private getVolumeOfAssignments(): number {
    return this._assignments
      .filter((a) => a.status !== AssignmentStatus.Completed)
      .reduce<number>((total, assignment) => {
        return total + assignment.volume.value;
      }, 0);
  }
}
