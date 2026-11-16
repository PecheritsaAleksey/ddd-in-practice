import { Uuid } from '../../../../../../src/common/Uuid';
import { AssignmentStatus } from '../../../../../../src/delivery/core/domain/model/AssignmentStatus';
import { Location } from '../../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../../src/delivery/core/domain/model/Volume';
import { Courier } from '../../../../../../src/delivery/core/domain/model/courier/Courier';
import { Order } from '../../../../../../src/delivery/core/domain/model/order/Order';

describe('Courier', () => {
  it('uses the fixed courier max volume and exposes immutable assignment snapshots', () => {
    const courier = new Courier(
      Location.create(2, 2),
      'Alice',
    );

    expect(courier.maxVolume.equals(Volume.create())).toBe(true);

    const order = new Order(
      Uuid.create('550e8400-e29b-41d4-a716-446655440002'),
      Location.create(1, 1),
      Volume.create(2),
    );

    expect(courier.canTakeOrder(order)).toBe(true);

    courier.addAssignment(order);

    const snapshot = courier.assignments as any;

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].status).toBe(AssignmentStatus.Assigned);
    expect('complete' in snapshot[0]).toBe(false);
    expect(() => snapshot.push({})).toThrow();
  });
});
