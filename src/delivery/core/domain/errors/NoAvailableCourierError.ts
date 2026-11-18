export class NoAvailableCourierError extends Error {
  constructor() {
    super('no available couriers for this order');
    this.name = 'NoAvailableCourierError';
  }
}
