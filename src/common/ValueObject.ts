export abstract class ValueObject {
  protected abstract getEqualityComponents(): readonly unknown[];

  public equals(other: this): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    if (thisComponents.length !== otherComponents.length) {
      return false;
    }

    return thisComponents.every((component, index) =>
      Object.is(component, otherComponents[index]),
    );
  }
}
