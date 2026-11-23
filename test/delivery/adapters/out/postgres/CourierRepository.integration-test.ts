import { DataSource, DataSourceOptions, QueryRunner } from 'typeorm';
import { Uuid } from '../../../../../src/common/Uuid';
import { postgresOptions } from '../../../../../src/delivery/adapters/out/postgres/postgres.config';
import { TypeOrmCourierRepository } from '../../../../../src/delivery/adapters/out/postgres/TypeOrmCourierRepository';
import { TypeOrmUnitOfWork } from '../../../../../src/delivery/adapters/out/postgres/TypeOrmUnitOfWork';
import { AssignmentStatus } from '../../../../../src/delivery/core/domain/model/AssignmentStatus';
import { Location } from '../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';
import { Courier } from '../../../../../src/delivery/core/domain/model/courier/Courier';
import { Order } from '../../../../../src/delivery/core/domain/model/order/Order';
import { OrderStatus } from '../../../../../src/delivery/core/domain/model/order/OrderStatus';

describe('Courier persistence with PostgreSQL', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;
  let repository: TypeOrmCourierRepository;

  beforeAll(async () => {
    dataSource = new DataSource(postgresOptions as DataSourceOptions);
    await dataSource.initialize();
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    await runner.query(
      'CREATE TEMP TABLE orders (id uuid PRIMARY KEY, x integer NOT NULL, y integer NOT NULL, volume integer NOT NULL, status varchar(20) NOT NULL) ON COMMIT DROP',
    );
    await runner.query(
      'CREATE TEMP TABLE couriers (id uuid PRIMARY KEY, x integer NOT NULL, y integer NOT NULL, name varchar NOT NULL, max_volume integer NOT NULL) ON COMMIT DROP',
    );
    await runner.query(
      'CREATE TEMP TABLE assignments (id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE, x integer NOT NULL, y integer NOT NULL, volume integer NOT NULL, status varchar(20) NOT NULL, courier_id uuid NOT NULL REFERENCES couriers(id)) ON COMMIT DROP',
    );
    repository = new TypeOrmCourierRepository(
      runner.manager.getRepository(Courier),
    );
  });

  afterAll(async () => {
    if (runner?.isTransactionActive) await runner.rollbackTransaction();
    if (runner && !runner.isReleased) await runner.release();
    if (dataSource?.isInitialized) await dataSource.destroy();
  });

  it('restores a courier and its assignments, including after completion', async () => {
    const courier = new Courier(Location.create(2, 2), 'Alice');
    const first = new Order(
      Uuid.generate(),
      Location.create(2, 3),
      Volume.create(8),
    );
    const second = new Order(
      Uuid.generate(),
      Location.create(5, 5),
      Volume.create(10),
    );
    courier.addAssignment(first);
    courier.addAssignment(second);
    await repository.add(courier);
    const before = await runner.query(
      'SELECT id FROM assignments WHERE order_id = $1',
      [first.id.toString()],
    );

    const restored = await repository.findById(courier.id);
    expect(restored?.id.equals(courier.id)).toBe(true);
    expect(restored?.location.equals(Location.create(2, 2))).toBe(true);
    expect(restored?.assignments).toHaveLength(2);
    expect(
      restored?.canTakeOrder(
        new Order(Uuid.generate(), Location.create(1, 1), Volume.create(3)),
      ),
    ).toBe(false);
    restored!.completeAssignment(first.id);
    await repository.update(restored!);

    const again = await repository.findById(courier.id);
    expect(
      again?.assignments.find((a) => a.orderId.equals(first.id))?.status,
    ).toBe(AssignmentStatus.Completed);
    expect(
      again?.canTakeOrder(
        new Order(Uuid.generate(), Location.create(1, 1), Volume.create(10)),
      ),
    ).toBe(true);
    const after = await runner.query(
      'SELECT id FROM assignments WHERE order_id = $1',
      [first.id.toString()],
    );
    expect(after[0].id).toBe(before[0].id);
    expect(
      (await repository.findAll()).some((c) => c.id.equals(courier.id)),
    ).toBe(true);
  });

  it('rolls back changes to both aggregate repositories on failure', async () => {
    const courier = new Courier(Location.create(1, 1), 'Bob');
    const order = new Order(
      Uuid.generate(),
      Location.create(2, 1),
      Volume.create(3),
    );
    // Reuse this test connection so its temporary tables remain visible.
    const testSource = {
      transaction: (
        work: (manager: typeof runner.manager) => Promise<unknown>,
      ) => runner.manager.transaction(work),
    } as unknown as DataSource;
    const unit = new TypeOrmUnitOfWork(testSource);
    await expect(
      unit.transaction(async ({ orders, couriers }) => {
        await orders.add(order);
        await couriers.add(courier);
        courier.addAssignment(order);
        order.setStatus(OrderStatus.Assigned);
        await orders.update(order);
        await couriers.update(courier);
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    expect(
      await runner.manager.getRepository(Order).findOneBy({ id: order.id }),
    ).toBeNull();
    expect(await repository.findById(courier.id)).toBeNull();
  });
});
