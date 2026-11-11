import { BaseEntity } from '../../../../../src/common/BaseEntity';
import { Uuid } from '../../../../../src/common/Uuid';

class TestEntity extends BaseEntity<Uuid> {}

describe('BaseEntity', () => {
  it('treats entities with equal UUID values as equal', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const first = new TestEntity(Uuid.create(id));
    const second = new TestEntity(Uuid.create(id));

    expect(first.equals(second)).toBe(true);
  });

  it('treats entities with different UUID values as different', () => {
    const first = new TestEntity(Uuid.create('550e8400-e29b-41d4-a716-446655440000'));
    const second = new TestEntity(Uuid.create('550e8400-e29b-41d4-a716-446655440001'));

    expect(first.equals(second)).toBe(false);
  });
});
