import { randomUUID } from 'crypto';
import { ValueObject } from './ValueObject';

export class Uuid extends ValueObject {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(public readonly value: string) {
    super();
    Object.freeze(this);
  }

  public static generate(): Uuid {
    return Uuid.create(randomUUID());
  }

  public static create(value: string): Uuid {
    if (typeof value !== 'string' || !Uuid.UUID_REGEX.test(value)) {
      throw new Error('UUID is invalid');
    }

    return new Uuid(value.toLowerCase());
  }

  protected override getEqualityComponents(): readonly unknown[] {
    return [this.value];
  }

  public toString(): string {
    return this.value;
  }
}
