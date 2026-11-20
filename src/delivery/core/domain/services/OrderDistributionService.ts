import { Courier } from '../model/courier/Courier';
import { Order } from '../model/order/Order';
import { OrderStatus } from '../model/order/OrderStatus';
import { NoAvailableCourierError } from '../errors/NoAvailableCourierError';
import { OrderNotCreatedError } from '../errors/OrderNotCreatedError';

export class OrderDistributionService {
  distributeOrder(order: Order, couriers: Courier[]): Courier {
    if (order === null || order === undefined || !(order instanceof Order)) {
      throw new Error('order is required');
    }

    if (
      couriers === null ||
      couriers === undefined ||
      !Array.isArray(couriers) ||
      couriers.some((courier) => !(courier instanceof Courier))
    ) {
      throw new Error('couriers is required');
    }

    if (order.status !== OrderStatus.Created) {
      throw new OrderNotCreatedError();
    }

    const availableCouriers = couriers.filter((courier) =>
      courier.canTakeOrder(order),
    );

    if (availableCouriers.length === 0) {
      throw new NoAvailableCourierError();
    }

    const closestCourier = availableCouriers.reduce((closest, courier) => {
      const closestDistance = closest.location.distanceTo(order.location);
      const courierDistance = courier.location.distanceTo(order.location);

      return courierDistance < closestDistance ? courier : closest;
    });

    closestCourier.addAssignment(order);

    order.setStatus(OrderStatus.Assigned);

    return closestCourier;
  }
}
