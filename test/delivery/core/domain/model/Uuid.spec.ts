import { Uuid } from '../../../../../src/common/Uuid';

describe('Uuid', () => {
  it('creates a valid uuid from a canonical string', () => {
    const uuid = Uuid.create('550e8400-e29b-41d4-a716-446655440000');

    expect(uuid.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('normalizes uuid values to lowercase', () => {
    const uuid = Uuid.create('550E8400-E29B-41D4-A716-446655440000');

    expect(uuid.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(uuid.equals(Uuid.create('550e8400-e29b-41d4-a716-446655440000'))).toBe(true);
  });

  it('rejects invalid uuid strings', () => {
    expect(() => Uuid.create('not-a-uuid')).toThrow('UUID is invalid');
  });

  it('generates a valid uuid', () => {
    const uuid = Uuid.generate();

    expect(uuid.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
