import { ValueObject } from '../../../../common/ValueObject';

export class Volume extends ValueObject {
  public static readonly MIN_VOLUME = 0;
  public static readonly MAX_VOLUME = 20;
  public static readonly DEFAULT_MAX_VOLUME = Volume.MAX_VOLUME;

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

  public add(other: Volume): Volume {
    this.ensureVolume(other, 'other volume is required');

    return Volume.create(this.value + other.value);
  }

  public subtract(other: Volume): Volume {
    this.ensureVolume(other, 'other volume is required');

    const result = this.value - other.value;
    if (result < Volume.MIN_VOLUME) {
      throw new Error('Volume cannot be negative');
    }

    return Volume.create(result);
  }

  public compareTo(other: Volume): number {
    this.ensureVolume(other, 'other volume is required');

    return this.value - other.value;
  }

  public isLessThan(other: Volume): boolean {
    return this.compareTo(other) < 0;
  }

  public isLessThanOrEqualTo(other: Volume): boolean {
    return this.compareTo(other) <= 0;
  }

  public isGreaterThan(other: Volume): boolean {
    return this.compareTo(other) > 0;
  }

  public isGreaterThanOrEqualTo(other: Volume): boolean {
    return this.compareTo(other) >= 0;
  }

  public canFitWithin(maxVolume: Volume): boolean {
    return this.isLessThanOrEqualTo(maxVolume);
  }

  public static sum(volumes: readonly Volume[]): Volume {
    return volumes.reduce<Volume>(
      (total, volume) => total.add(volume),
      Volume.create(0),
    );
  }

  protected override getEqualityComponents(): readonly unknown[] {
    return [this.value];
  }

  private ensureVolume(volume: Volume | null | undefined, message: string): void {
    if (volume === null || volume === undefined || !(volume instanceof Volume)) {
      throw new Error(message);
    }
  }
}
