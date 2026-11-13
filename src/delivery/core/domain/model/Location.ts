import { ValueObject } from '../../../../common/ValueObject';

export class Location extends ValueObject {
  public static readonly MIN_COORDINATE = 1;
  public static readonly MAX_COORDINATE = 10;

  private constructor(
    public readonly xCoordinate: number,
    public readonly yCoordinate: number,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(xCoordinate: number, yCoordinate: number): Location {
    if (
      !Number.isInteger(xCoordinate) ||
      !Number.isInteger(yCoordinate) ||
      xCoordinate < Location.MIN_COORDINATE ||
      xCoordinate > Location.MAX_COORDINATE ||
      yCoordinate < Location.MIN_COORDINATE ||
      yCoordinate > Location.MAX_COORDINATE
    ) {
      throw new Error(
        `Coordinates must be integers between ${Location.MIN_COORDINATE} and ${Location.MAX_COORDINATE}`,
      );
    }

    return new Location(xCoordinate, yCoordinate);
  }

  protected override getEqualityComponents(): readonly unknown[] {
    return [this.xCoordinate, this.yCoordinate];
  }

  public distanceTo(other: Location): number {
    const deltaX = Math.abs(this.xCoordinate - other.xCoordinate);
    const deltaY = Math.abs(this.yCoordinate - other.yCoordinate);

    return deltaX + deltaY;
  }
}
