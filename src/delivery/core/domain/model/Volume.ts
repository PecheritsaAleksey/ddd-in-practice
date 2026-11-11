import { ValueObject } from '../../../../common/ValueObject';

export class Volume extends ValueObject {
  public static readonly MIN_VOLUME = 1;
  public static readonly MAX_VOLUME = 10;

  private constructor(public readonly value: number) {
    super();
    Object.freeze(this);
  }

  public static create(value: number): Volume {
    if (
      !Number.isInteger(value) ||
      value < Volume.MIN_VOLUME ||
      value > Volume.MAX_VOLUME
    ) {
      throw new Error(
        `Volume must be integers between ${Volume.MIN_VOLUME} and ${Volume.MAX_VOLUME}`,
      );
    }

    return new Volume(value);
  }

  protected override getEqualityComponents(): readonly unknown[] {
    return [this.value];
  }
}
