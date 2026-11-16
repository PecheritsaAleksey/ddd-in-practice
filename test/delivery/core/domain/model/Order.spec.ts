import { Uuid } from '../../../../../src/common/Uuid';
import { Location } from '../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';
import { Order } from '../../../../../src/delivery/core/domain/model/order/Order';
import { OrderStatus } from '../../../../../src/delivery/core/domain/model/order/OrderStatus';

describe('Order', () => {
  const id = Uuid.create('550e8400-e29b-41d4-a716-446655440000');
  const location = Location.create(2, 3);
  const volume = Volume.create(5);

  it('preserves the provided values and starts in Created status', () => {
    const order = new Order(id, location, volume);

    expect(order.id.equals(id)).toBe(true);
    expect(order.location).toBe(location);
    expect(order.volume).toBe(volume);
    expect(order.status).toBe(OrderStatus.Created);
  });

  it.each([null, undefined, {}])('rejects an invalid id: %p', (invalid) => {
    expect(() => new Order(invalid as Uuid, location, volume)).toThrow();
  });

  it.each([null, undefined, {}])('rejects an invalid location: %p', (invalid) => {
    expect(() => new Order(id, invalid as Location, volume)).toThrow();
  });

  it.each([null, undefined, {}])('rejects an invalid volume: %p', (invalid) => {
    expect(() => new Order(id, location, invalid as Volume)).toThrow();
  });

  it('allows Created to Assigned to Completed', () => {
    const order = new Order(id, location, volume);

    order.setStatus(OrderStatus.Assigned);
    expect(order.status).toBe(OrderStatus.Assigned);
    order.setStatus(OrderStatus.Completed);
    expect(order.status).toBe(OrderStatus.Completed);
  });

  it('rejects completion before assignment without changing status', () => {
    const order = new Order(id, location, volume);

    expect(() => order.setStatus(OrderStatus.Completed)).toThrow();
    expect(order.status).toBe(OrderStatus.Created);
  });

  it('rejects a return from Assigned to Created without changing status', () => {
    const order = new Order(id, location, volume);
    order.setStatus(OrderStatus.Assigned);

    expect(() => order.setStatus(OrderStatus.Created)).toThrow();
    expect(order.status).toBe(OrderStatus.Assigned);
  });

  it.each([OrderStatus.Created, OrderStatus.Assigned])(
    'rejects a return from Completed to %s',
    (status) => {
      const order = new Order(id, location, volume);
      order.setStatus(OrderStatus.Assigned);
      order.setStatus(OrderStatus.Completed);

      expect(() => order.setStatus(status)).toThrow();
      expect(order.status).toBe(OrderStatus.Completed);
    },
  );

  it.each([null, undefined, 'Unknown', 'toString'])(
    'rejects an invalid status: %p',
    (status) => {
      const order = new Order(id, location, volume);

      expect(() => order.setStatus(status as OrderStatus)).toThrow();
      expect(order.status).toBe(OrderStatus.Created);
    },
  );
});
