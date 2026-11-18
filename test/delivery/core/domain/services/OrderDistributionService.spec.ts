import { Uuid } from '../../../../../src/common/Uuid';
import { NoAvailableCourierError } from '../../../../../src/delivery/core/domain/errors/NoAvailableCourierError';
import { OrderNotCreatedError } from '../../../../../src/delivery/core/domain/errors/OrderNotCreatedError';
import { AssignmentStatus } from '../../../../../src/delivery/core/domain/model/AssignmentStatus';
import { Location } from '../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';
import { Courier } from '../../../../../src/delivery/core/domain/model/courier/Courier';
import { Order } from '../../../../../src/delivery/core/domain/model/order/Order';
import { OrderStatus } from '../../../../../src/delivery/core/domain/model/order/OrderStatus';
import { OrderDistributionService } from '../../../../../src/delivery/core/domain/services/OrderDistributionService';

describe('OrderDistributionService', () => {
  const service = new OrderDistributionService();
  const createOrder = (id: string, x: number, y: number, volume: number) =>
    new Order(Uuid.create(id), Location.create(x, y), Volume.create(volume));
  const orderId = '550e8400-e29b-41d4-a716-446655440001';
  const otherId = '550e8400-e29b-41d4-a716-446655440002';

  it('assigns the nearest eligible courier and updates both aggregates', () => {
    const order = createOrder(orderId, 5, 5, 3);
    const far = new Courier(Location.create(1, 1), 'Far');
    const near = new Courier(Location.create(5, 4), 'Near');

    const selected = service.distributeOrder(order, [far, near]);

    expect(selected).toBe(near);
    expect(order.status).toBe(OrderStatus.Assigned);
    expect(near.assignments).toHaveLength(1);
    expect(near.assignments[0].orderId.equals(order.id)).toBe(true);
    expect(near.assignments[0].status).toBe(AssignmentStatus.Assigned);
    expect(far.assignments).toHaveLength(0);
  });

  it('skips a closer courier whose remaining capacity is insufficient', () => {
    const order = createOrder(orderId, 5, 5, 2);
    const full = new Courier(Location.create(5, 5), 'Full');
    const available = new Courier(Location.create(8, 5), 'Available');
    full.addAssignment(createOrder(otherId, 1, 1, 19));

    expect(service.distributeOrder(order, [full, available])).toBe(available);
    expect(full.assignments).toHaveLength(1);
    expect(available.assignments[0].orderId.equals(order.id)).toBe(true);
    expect(order.status).toBe(OrderStatus.Assigned);
  });

  it('chooses the first courier when distances are equal', () => {
    const order = createOrder(orderId, 5, 5, 1);
    const first = new Courier(Location.create(4, 5), 'First');
    const second = new Courier(Location.create(5, 4), 'Second');

    expect(service.distributeOrder(order, [first, second])).toBe(first);
    expect(first.assignments).toHaveLength(1);
    expect(second.assignments).toHaveLength(0);
    expect(order.status).toBe(OrderStatus.Assigned);
  });

  it('rejects an empty courier list without changing the order', () => {
    const order = createOrder(orderId, 5, 5, 1);

    expect(() => service.distributeOrder(order, [])).toThrow(
      NoAvailableCourierError,
    );
    expect(order.status).toBe(OrderStatus.Created);
  });

  it('rejects dispatch when every courier lacks capacity without changing state', () => {
    const order = createOrder(orderId, 5, 5, 2);
    const courier = new Courier(Location.create(5, 5), 'Full');
    courier.addAssignment(createOrder(otherId, 1, 1, 19));
    const previousAssignments = courier.assignments;

    expect(() => service.distributeOrder(order, [courier])).toThrow(
      NoAvailableCourierError,
    );
    expect(order.status).toBe(OrderStatus.Created);
    expect(courier.assignments).toEqual(previousAssignments);
  });

  it.each([OrderStatus.Assigned, OrderStatus.Completed])(
    'rejects an order in %s status without changing the courier',
    (status) => {
      const order = createOrder(orderId, 5, 5, 1);
      const courier = new Courier(Location.create(5, 5), 'Courier');
      order.setStatus(OrderStatus.Assigned);
      if (status === OrderStatus.Completed) order.setStatus(status);

      expect(() => service.distributeOrder(order, [courier])).toThrow(
        OrderNotCreatedError,
      );
      expect(order.status).toBe(status);
      expect(courier.assignments).toHaveLength(0);
    },
  );

  it.each([null, undefined, {}])('rejects an invalid order: %p', (invalid) => {
    const courier = new Courier(Location.create(5, 5), 'Courier');

    expect(() => service.distributeOrder(invalid as Order, [courier])).toThrow(
      'order is required',
    );
    expect(courier.assignments).toHaveLength(0);
  });

  it.each([null, undefined, {}])(
    'rejects an invalid courier list: %p',
    (invalid) => {
      const order = createOrder(orderId, 5, 5, 1);

      expect(() =>
        service.distributeOrder(order, invalid as Courier[]),
      ).toThrow('couriers is required');
      expect(order.status).toBe(OrderStatus.Created);
    },
  );
});
