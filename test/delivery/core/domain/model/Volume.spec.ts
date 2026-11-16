import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';

describe('Volume', () => {
  it.each([1, 5, 10, 11, 20])('accepts a valid volume: %s', (value) => {
    expect(Volume.create(value).value).toBe(value);
  });

  it.each([0, -1, 21, 1.5, NaN, Infinity])(
    'rejects an invalid volume: %s',
    (value) => {
      expect(() => Volume.create(value as number)).toThrow(
        'Volume must be integers between 1 and 20',
      );
    },
  );
});
