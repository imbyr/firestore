import { createWhere, WhereOperator } from '../src/where';
import { Query } from '../src/query';
import { createOrderBy, OrderByDirection } from '../src/order-by';

describe('Query', () => {
  const SELECT = ['x'];
  const WHERE = [createWhere('x', WhereOperator.EqualTo, 'y')];
  const ORDER = [createOrderBy('x', OrderByDirection.Descending)];
  const LIMIT = 8;
  const OFFSET = 12;

  let query: Query;

  beforeEach(() => query = new Query({
    select: SELECT,
    where: WHERE,
    orderBy: ORDER,
    limit: LIMIT,
    offset: OFFSET,
  }));

  it('should validate properties', () => {
    expect(query.select).toBe(SELECT);
    expect(query.where).toBe(WHERE);
    expect(query.orderBy).toBe(ORDER);
    expect(query.limit).toBe(LIMIT);
    expect(query.offset).toBe(OFFSET);
  });
});

