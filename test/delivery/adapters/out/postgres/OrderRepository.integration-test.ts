import { DataSource, DataSourceOptions, QueryRunner } from 'typeorm';
import { Uuid } from '../../../../../src/common/Uuid';
import { TypeOrmOrderRepository } from '../../../../../src/delivery/adapters/out/postgres/TypeOrmOrderRepository';
import { postgresOptions } from '../../../../../src/delivery/adapters/out/postgres/postgres.config';
import { Location } from '../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';
import { Order } from '../../../../../src/delivery/core/domain/model/order/Order';
import { OrderStatus } from '../../../../../src/delivery/core/domain/model/order/OrderStatus';

describe('Order restoration with PostgreSQL', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;
  let repository: TypeOrmOrderRepository;

  beforeAll(async () => {
    dataSource = new DataSource(postgresOptions as DataSourceOptions);
    await dataSource.initialize();
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    await runner.query(`CREATE TEMP TABLE orders (
      id uuid PRIMARY KEY, x integer NOT NULL, y integer NOT NULL,
      volume integer NOT NULL, status varchar(20) NOT NULL
    ) ON COMMIT DROP`);
    repository = new TypeOrmOrderRepository(
      runner.manager.getRepository(Order),
    );
  });

  afterAll(async () => {
    if (runner?.isTransactionActive) await runner.rollbackTransaction();
    if (runner && !runner.isReleased) await runner.release();
    if (dataSource?.isInitialized) await dataSource.destroy();
  });

  it.each([OrderStatus.Created, OrderStatus.Assigned, OrderStatus.Completed])(
    'restores an order in %s status with working value objects',
    async (status) => {
      const id = Uuid.generate();
      const order = new Order(id, Location.create(2, 3), Volume.create(5));
      if (status !== OrderStatus.Created) order.setStatus(OrderStatus.Assigned);
      if (status === OrderStatus.Completed)
        order.setStatus(OrderStatus.Completed);

      await repository.add(order);
      const restored = await repository.findById(id);

      expect(restored).toBeInstanceOf(Order);
      expect(restored).not.toBe(order);
      expect(restored?.id.equals(id)).toBe(true);
      expect(restored?.location.distanceTo(Location.create(4, 6))).toBe(5);
      expect(restored?.volume.equals(Volume.create(5))).toBe(true);
      expect(restored?.status).toBe(status);
      if (status === OrderStatus.Completed) {
        expect(() => restored?.setStatus(OrderStatus.Assigned)).toThrow();
      }
    },
  );

  it.each([
    [0, 3, 5, 'Created'],
    [2, 11, 5, 'Created'],
    [2, 3, 21, 'Created'],
    [2, 3, 5, 'Unknown'],
  ])(
    'rejects invalid persisted data (%s, %s, %s, %s)',
    async (x, y, volume, status) => {
      const id = Uuid.generate();
      await runner.query(
        'INSERT INTO orders (id, x, y, volume, status) VALUES ($1, $2, $3, $4, $5)',
        [id.toString(), x, y, volume, status],
      );

      await expect(repository.findById(id)).rejects.toThrow();
    },
  );
});
