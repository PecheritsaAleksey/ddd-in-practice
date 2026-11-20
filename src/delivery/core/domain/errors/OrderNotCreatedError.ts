export class OrderNotCreatedError extends Error {
  constructor() {
    super('order status must be Created');
    this.name = 'OrderNotCreatedError';
  }
}
