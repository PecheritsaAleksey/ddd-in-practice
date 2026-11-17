import { Uuid } from '../../../../../../src/common/Uuid';
import { AssignmentStatus } from '../../../../../../src/delivery/core/domain/model/AssignmentStatus';
import { Location } from '../../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../../src/delivery/core/domain/model/Volume';
import { Courier } from '../../../../../../src/delivery/core/domain/model/courier/Courier';
import { Order } from '../../../../../../src/delivery/core/domain/model/order/Order';

describe('Courier', () => {
  const createCourier = () => new Courier(Location.create(2, 2), 'Alice');

  const createOrder = (
    id: string,
    x: number,
    y: number,
    volume: number,
  ): Order =>
    new Order(
      Uuid.create(id),
      Location.create(x, y),
      Volume.create(volume),
    );

  it('uses the fixed courier max volume and exposes immutable assignment snapshots', () => {
    const courier = createCourier();

    expect(
      courier.maxVolume.equals(Volume.create(Volume.DEFAULT_MAX_VOLUME)),
    ).toBe(true);

    const order = createOrder(
      '550e8400-e29b-41d4-a716-446655440002',
      1,
      1,
      2,
    );

    expect(courier.canTakeOrder(order)).toBe(true);

    courier.addAssignment(order);

    const snapshot = courier.assignments as any;

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].status).toBe(AssignmentStatus.Assigned);
    expect('complete' in snapshot[0]).toBe(false);
    expect(() => snapshot.push({})).toThrow();
  });

  it('accepts an order exactly at the max volume boundary and rejects overload', () => {
    const courier = createCourier();
    const exactFitOrder = createOrder(
      '550e8400-e29b-41d4-a716-446655440003',
      1,
      1,
      Volume.DEFAULT_MAX_VOLUME,
    );

    expect(courier.canTakeOrder(exactFitOrder)).toBe(true);
    courier.addAssignment(exactFitOrder);

    const overflowOrder = createOrder(
      '550e8400-e29b-41d4-a716-446655440004',
      3,
      3,
      1,
    );

    expect(courier.canTakeOrder(overflowOrder)).toBe(false);
    expect(() => courier.addAssignment(overflowOrder)).toThrow(
      'Cannot add assignment, exceeds max volume',
    );
  });

  it('rejects assigning the same order twice', () => {
    const courier = createCourier();
    const order = createOrder(
      '550e8400-e29b-41d4-a716-446655440005',
      1,
      1,
      2,
    );

    courier.addAssignment(order);

    expect(courier.canTakeOrder(order)).toBe(false);
    expect(() => courier.addAssignment(order)).toThrow(
      'Assignment for this order already exists',
    );
  });

  it('completes an assignment when the courier is near the order', () => {
    const courier = createCourier();
    const order = createOrder(
      '550e8400-e29b-41d4-a716-446655440006',
      3,
      2,
      2,
    );

    courier.addAssignment(order);

    expect(() => courier.completeAssignment(order.id)).not.toThrow();
    expect(courier.assignments[0].status).toBe(AssignmentStatus.Completed);
  });

  it('rejects completing an assignment when the courier is too far from the order', () => {
    const courier = createCourier();
    const order = createOrder(
      '550e8400-e29b-41d4-a716-446655440007',
      5,
      2,
      2,
    );

    courier.addAssignment(order);

    expect(() => courier.completeAssignment(order.id)).toThrow(
      'Courier is too far away',
    );
  });

  it('allows moving within one distance and rejects farther moves', () => {
    const courier = createCourier();

    const validMove = Location.create(2, 3);
    expect(() => courier.updateLocation(validMove)).not.toThrow();
    expect(courier.location.equals(validMove)).toBe(true);

    const invalidMove = Location.create(5, 5);
    expect(() => courier.updateLocation(invalidMove)).toThrow(
      'Courier is too far away',
    );
  });
});
