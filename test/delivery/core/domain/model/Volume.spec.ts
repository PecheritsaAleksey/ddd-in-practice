import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';

describe('Volume', () => {
  it.each([0, 1, 5, 10, 11, 20])('accepts a valid volume: %s', (value) => {
    expect(Volume.create(value).value).toBe(value);
  });

  it.each([-1, 21, 1.5, NaN, Infinity])(
    'rejects an invalid volume: %s',
    (value) => {
      expect(() => Volume.create(value as number)).toThrow(
        'Volume must be integers between 0 and 20',
      );
    },
  );

  it('adds and compares volumes by domain semantics', () => {
    const total = Volume.create(3).add(Volume.create(5));
    expect(total.equals(Volume.create(8))).toBe(true);

    expect(Volume.create(3).isLessThan(Volume.create(5))).toBe(true);
    expect(Volume.create(5).isGreaterThan(Volume.create(3))).toBe(true);
    expect(Volume.create(4).isLessThanOrEqualTo(Volume.create(4))).toBe(true);
    expect(Volume.create(4).isGreaterThanOrEqualTo(Volume.create(4))).toBe(true);
  });

  it('rejects a volume sum that exceeds the max allowed capacity', () => {
    expect(() => Volume.create(15).add(Volume.create(10))).toThrow(
      'Volume must be integers between 0 and 20',
    );
  });
});
