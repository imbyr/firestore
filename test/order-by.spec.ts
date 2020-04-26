import { createOrderBy, OrderByDirection } from '../src/order-by';

describe('OrderBy', () => {
  const KEY = 'key';
  const DIRECTION = OrderByDirection.Descending;

  it('#createOrderBy() should return OrderBy object with default direction', () => {
    const orderBy = createOrderBy(KEY);

    expect(orderBy.key).toBe(KEY);
    expect(orderBy.direction).toBe(OrderByDirection.Ascending);
  });

  it('#createOrderBy() should return OrderBy object with custom direction', () => {
    const orderBy = createOrderBy(KEY, DIRECTION);

    expect(orderBy.key).toBe(KEY);
    expect(orderBy.direction).toBe(DIRECTION);
  });
});
