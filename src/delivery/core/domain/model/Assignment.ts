import { BaseEntity } from '../../../../common/BaseEntity';
import { Uuid } from '../../../../common/Uuid';
import { AssignmentStatus } from './AssignmentStatus';
import { Location } from './Location';
import { Volume } from './Volume';

export class Assignment extends BaseEntity<Uuid> {
  public readonly orderId: Uuid;
  private _status: AssignmentStatus;

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
    this._status = status;
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
