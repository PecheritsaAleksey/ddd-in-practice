import { Uuid } from '../../../../../src/common/Uuid';
import { Assignment } from '../../../../../src/delivery/core/domain/model/Assignment';
import { AssignmentStatus } from '../../../../../src/delivery/core/domain/model/AssignmentStatus';
import { Location } from '../../../../../src/delivery/core/domain/model/Location';
import { Volume } from '../../../../../src/delivery/core/domain/model/Volume';

describe('Assignment', () => {
  const location = Location.create(2, 3);
  const volume = Volume.create(5);
  const validOrderId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates a valid assignment with assigned status', () => {
    const orderId = Uuid.create(validOrderId);
    const assignment = new Assignment(orderId, location, volume);

    expect(assignment.getOrderId().equals(orderId)).toBe(true);
    expect(assignment.location).toBe(location);
    expect(assignment.volume).toBe(volume);
    expect(assignment.getStatus()).toBe(AssignmentStatus.Assigned);
  });

  it.each([
    ['', 'order id is required'],
    [undefined as unknown as string, 'order id is required'],
    [null as unknown as string, 'order id is required'],
    ['not-a-uuid', 'UUID is invalid'],
  ])('rejects invalid order id: %p', (orderId, message) => {
    expect(() => new Assignment(orderId, location, volume)).toThrow(message);
  });

  it.each([
    [undefined as unknown as Location, 'location is required'],
    [null as unknown as Location, 'location is required'],
  ])('rejects invalid location: %p', (invalidLocation, message) => {
    expect(() => new Assignment(validOrderId, invalidLocation, volume)).toThrow(
      message,
    );
  });

  it.each([
    [undefined as unknown as Volume, 'volume is required'],
    [null as unknown as Volume, 'volume is required'],
  ])('rejects invalid volume: %p', (invalidVolume, message) => {
    expect(() => new Assignment(validOrderId, location, invalidVolume)).toThrow(
      message,
    );
  });

  it('rejects status that is not assigned on creation', () => {
    expect(
      () =>
        new Assignment(validOrderId, location, volume, AssignmentStatus.Completed),
    ).toThrow('Assignment status must be Assigned on creation');
  });

  describe('complete', () => {
    it.each([
      [2, 3],
      [1, 3],
      [3, 3],
      [2, 2],
      [2, 4],
    ])('completes when the courier is at (%s, %s)', (x, y) => {
      const assignment = new Assignment(validOrderId, location, volume);

      assignment.complete(Location.create(x, y));

      expect(assignment.getStatus()).toBe(AssignmentStatus.Completed);
    });

    it.each([
      [4, 3],
      [3, 4],
    ])('rejects a courier two steps away at (%s, %s)', (x, y) => {
      const assignment = new Assignment(validOrderId, location, volume);

      expect(() => assignment.complete(Location.create(x, y))).toThrow(
        'Courier is too far away',
      );
      expect(assignment.getStatus()).toBe(AssignmentStatus.Assigned);
    });

    it.each([null, undefined, {}])(
      'rejects an invalid courier location: %p',
      (invalidLocation) => {
        const assignment = new Assignment(validOrderId, location, volume);

        expect(() =>
          assignment.complete(invalidLocation as unknown as Location),
        ).toThrow('courierLocation is required');
        expect(assignment.getStatus()).toBe(AssignmentStatus.Assigned);
      },
    );

    it('keeps a completed assignment completed on a repeated call', () => {
      const assignment = new Assignment(validOrderId, location, volume);
      assignment.complete(location);

      expect(() => assignment.complete(Location.create(10, 10))).not.toThrow();
      expect(assignment.getStatus()).toBe(AssignmentStatus.Completed);
    });

    it.each([null, undefined, {}])(
      'rejects an invalid courier location even after completion: %p',
      (invalidLocation) => {
        const assignment = new Assignment(validOrderId, location, volume);
        assignment.complete(location);

        expect(() =>
          assignment.complete(invalidLocation as unknown as Location),
        ).toThrow('courierLocation is required');
        expect(assignment.getStatus()).toBe(AssignmentStatus.Completed);
      },
    );
  });
});
