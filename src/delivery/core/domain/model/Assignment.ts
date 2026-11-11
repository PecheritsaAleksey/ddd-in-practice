import { BaseEntity } from '../../../../common/BaseEntity';
import { Uuid } from '../../../../common/Uuid';
import { AssignmentStatus } from './AssignmentStatus';
import { Location } from './Location';
import { Volume } from './Volume';

export class Assignment extends BaseEntity<Uuid> {
  public readonly orderId: Uuid;
  private status: AssignmentStatus;

  constructor(
    orderId: string | Uuid,
    public readonly location: Location,
    public readonly volume: Volume,
    status: AssignmentStatus = AssignmentStatus.Assigned,
  ) {
    super(Uuid.generate());

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
    this.location = location;
    this.volume = volume;
    this.status = status;
  }

  public getOrderId(): Uuid {
    return this.orderId;
  }

  public getLocation(): Location {
    return this.location;
  }

  public getVolume(): Volume {
    return this.volume;
  }

  public getStatus(): AssignmentStatus {
    return this.status;
  }

  public complete(courierLocation: Location): void {
    if (
      courierLocation === null ||
      courierLocation === undefined ||
      !(courierLocation instanceof Location)
    ) {
      throw new Error('courierLocation is required');
    }

    if (this.status === AssignmentStatus.Completed) {
      return;
    }

    if (this.status !== AssignmentStatus.Assigned) {
      throw new Error('Only assigned assignment can be completed');
    }

    if (courierLocation.distanceTo(this.location) > 1) {
      throw new Error('Courier is too far away');
    }

    this.status = AssignmentStatus.Completed;
  }
}
