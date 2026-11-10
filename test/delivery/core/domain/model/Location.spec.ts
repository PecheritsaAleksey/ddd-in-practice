import { Location } from '../../../../../src/delivery/core/domain/model/Location';

describe('Location', () => {
  describe('create', () => {
    it.each([
      [1, 1],
      [1, 10],
      [10, 1],
      [10, 10],
      [5, 6],
    ])('creates a location at (%s, %s)', (x, y) => {
      const location = Location.create(x, y);

      expect(location.xCoordinate).toBe(x);
      expect(location.yCoordinate).toBe(y);
    });

    it.each([
      [0, 5],
      [11, 5],
      [5, 0],
      [5, 11],
      [1.5, 5],
      [5, 1.5],
      [NaN, 5],
      [5, NaN],
      [Infinity, 5],
      [5, -Infinity],
    ])('rejects invalid coordinates (%s, %s)', (x, y) => {
      expect(() => Location.create(x, y)).toThrow();
    });

    it('does not allow coordinates to change after creation', () => {
      const location = Location.create(2, 3);

      expect(Reflect.set(location, 'xCoordinate', 4)).toBe(false);
      expect(Reflect.set(location, 'yCoordinate', 5)).toBe(false);
      expect(location.xCoordinate).toBe(2);
      expect(location.yCoordinate).toBe(3);
    });
  });

  describe('equals', () => {
    it('considers separate locations with the same coordinates equal', () => {
      const first = Location.create(2, 3);
      const second = Location.create(2, 3);

      expect(first).not.toBe(second);
      expect(first.equals(second)).toBe(true);
    });

    it.each([
      [3, 3],
      [2, 4],
      [3, 4],
    ])('does not consider (2, 3) equal to (%s, %s)', (x, y) => {
      expect(Location.create(2, 3).equals(Location.create(x, y))).toBe(false);
    });
  });

  describe('distanceTo', () => {
    it.each([
      [2, 3, 2, 3, 0],
      [2, 3, 5, 3, 3],
      [2, 3, 2, 7, 4],
      [4, 9, 2, 6, 5],
      [2, 6, 4, 9, 5],
      [1, 1, 10, 10, 18],
    ])(
      'calculates distance from (%s, %s) to (%s, %s) as %s',
      (fromX, fromY, toX, toY, expected) => {
        const from = Location.create(fromX, fromY);
        const to = Location.create(toX, toY);

        expect(from.distanceTo(to)).toBe(expected);
      },
    );
  });
});
