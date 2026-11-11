import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';

describe('Volume', () => {
  it.each([1, 5, 10])('accepts a valid volume: %s', (value) => {
    expect(Volume.create(value).value).toBe(value);
  });

  it.each([0, -1, 11, 1.5, NaN, Infinity])(
    'rejects an invalid volume: %s',
    (value) => {
      expect(() => Volume.create(value as number)).toThrow(
        'Volume must be integers between 1 and 10',
      );
    },
  );
});
