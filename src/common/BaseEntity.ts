export abstract class BaseEntity<TId> {
  constructor(public readonly id: TId) {}

  public equals(other: BaseEntity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.hasSameIdentity(this.id, other.id);
  }

  private hasSameIdentity(left: TId, right: TId): boolean {
    if (
      left === null ||
      left === undefined ||
      right === null ||
      right === undefined
    ) {
      return left === right;
    }

    if (
      typeof left === 'object' &&
      typeof right === 'object' &&
      'equals' in left &&
      'equals' in right &&
      typeof left.equals === 'function' &&
      typeof right.equals === 'function'
    ) {
      return left.equals(right);
    }

    return Object.is(left, right);
  }
}
