import { QueryBuilder } from '../src/query-builder';
import { WhereOperator } from '../src/where';
import { OrderByDirection } from '../src/order-by';

describe('QueryBuilder', () => {
  let builder: QueryBuilder;

  beforeEach(() => builder = new QueryBuilder());

  function toQuery(builder: QueryBuilder) {
    return builder.toQuery();
  }

  it('should be immutable after every method', () => {
    for (const [method, args] of [
      ['select', ['id']],
      ['where', ['id', WhereOperator.EqualTo, '2']],
      ['whereEqualTo', ['id', '4']],
      ['whereLessThan', ['id', '6']],
      ['whereLessThanOrEqualTo', ['id', '6']],
      ['whereGreaterThan', ['id', '6']],
      ['whereGreaterThanOrEqualTo', ['id', '6']],
      ['whereIn', ['id', ['4', '5', '6']]],
      ['whereArrayContains', ['id', '0']],
      ['whereArrayContainsAny', ['id', ['0', '1']]],
      ['orderBy', ['id', OrderByDirection.Descending]],
      ['orderByAscending', ['id']],
      ['orderByDescending', ['id']],
      ['limit', [0]],
      ['offset', [0]],
    ] as [keyof QueryBuilder, any[]][]) {
      let previous = builder;
      builder = (builder[method] as any).call(builder, ...args);
      expect(builder).not.toBe(previous);
    }
  });

  it('Query#version default value should equals 0', () => {
    expect(builder.version).toEqual(0);
  });

  it('Query#version value should increase after modification', () => {
    expect(builder.select('*').version).toEqual(1);
  });

  // region Select

  it('Query#select() should be [] by default', () => {
    const query = toQuery(builder);
    expect(query.select).toEqual([]);
  });

  it('#select() should be [] if argument is "*"', () => {
    const query = toQuery(builder.select('*'));
    expect(query.select).toEqual([]);
  });

  it('#select() should be ["a"] if argument is "a"', () => {
    const query = toQuery(builder.select('a'));
    expect(query.select).toEqual(['a']);
  });

  it('#select() should be ["a", "b"] if argument is ["a", "b"]', () => {
    const query = toQuery(builder.select(['a', 'b']));
    expect(query.select).toEqual(['a', 'b']);
  });

  it('Query#select be different instance of Array', () => {
    const select = ['a', 'b'];
    const query = toQuery(builder.select(select));
    expect(query.select).not.toBe(select);
  });

  // endregion

  // region Where

  it('Query#where() should be [] by default', () => {
    const query = toQuery(builder);
    expect(query.where).toEqual([]);
  });

  it('Query#where should be different instance after #where()', () => {
    const x = toQuery(builder);
    const y = toQuery(builder.where('x', WhereOperator.EqualTo, 'y'));
    expect(x.where).not.toBe(y.where);
    expect(x.where).not.toEqual(y.where);
  });

  it('#where() with 2 arguments should push a right Where', () => {
    const where = toQuery(builder.where('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.EqualTo);
    expect(where.value).toBe('y');
  });

  it('#where() with 3 arguments should push a right Where', () => {
    const where = toQuery(builder.where('x', WhereOperator.EqualTo, 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.EqualTo);
    expect(where.value).toBe('y');
  });

  it('#whereEqualTo() should push a right Where', () => {
    const where = toQuery(builder.whereEqualTo('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.EqualTo);
    expect(where.value).toBe('y');
  });

  it('#whereLessThan() should push a right Where', () => {
    const where = toQuery(builder.whereLessThan('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.LessThan);
    expect(where.value).toBe('y');
  });

  it('#whereLessThanOrEqualTo() should push a right Where', () => {
    const where = toQuery(builder.whereLessThanOrEqualTo('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.LessThanOrEqualTo);
    expect(where.value).toBe('y');
  });

  it('#whereGreaterThan() should push a right Where', () => {
    const where = toQuery(builder.whereGreaterThan('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.GreaterThan);
    expect(where.value).toBe('y');
  });

  it('#whereGreaterThanOrEqualTo() should push a right Where', () => {
    const where = toQuery(builder.whereGreaterThanOrEqualTo('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.GreaterThanOrEqualTo);
    expect(where.value).toBe('y');
  });

  it('#whereArrayContains() should push a right Where', () => {
    const where = toQuery(builder.whereArrayContains('x', 'y')).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.ArrayContains);
    expect(where.value).toBe('y');
  });

  it('#whereIn() should push a right Where', () => {
    const where = toQuery(builder.whereIn('x', ['y'])).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.In);
    expect(where.value).toEqual(['y']);
  });

  it('#whereArrayContainsAny() should push a right Where', () => {
    const where = toQuery(builder.whereArrayContainsAny('x', ['y'])).where[0];
    expect(where.key).toBe('x');
    expect(where.operator).toBe(WhereOperator.ArrayContainsAny);
    expect(where.value).toEqual(['y']);
  });

  // endregion

  // region Order

  it('#orderBy() should push a right Order with default value', () => {
    const order = toQuery(builder.orderBy('x')).orderBy[0];
    expect(order.key).toBe('x');
    expect(order.direction).toBe(OrderByDirection.Ascending);
  });

  it('#orderBy() should push a right Order specified direction', () => {
    const order = toQuery(builder.orderBy('x', OrderByDirection.Descending)).orderBy[0];
    expect(order.key).toBe('x');
    expect(order.direction).toBe(OrderByDirection.Descending);
  });

  it('Query#order should be different instance after #orderBy()', () => {
    const x = toQuery(builder);
    const y = toQuery(builder.orderBy('x', OrderByDirection.Descending));
    expect(x.orderBy).not.toBe(y.orderBy);
    expect(x.orderBy).not.toEqual(y.orderBy);
  });

  it('#orderAscending() should push a right Order value', () => {
    const order = toQuery(builder.orderByAscending('x')).orderBy[0];
    expect(order.key).toBe('x');
    expect(order.direction).toBe(OrderByDirection.Ascending);
  });

  it('#orderDescending() should push a right Order value', () => {
    const order = toQuery(builder.orderByDescending('x')).orderBy[0];
    expect(order.key).toBe('x');
    expect(order.direction).toBe(OrderByDirection.Descending);
  });

  // endregion

  // region Limit

  it('#limit() should be null by default', () => {
    const query = toQuery(builder);
    expect(query.limit).toBeNull();
  });

  it('#limit() should set number', () => {
    const query = toQuery(builder.limit(10));
    expect(query.limit).toBe(10);
  });

  // endregion

  // region Offset

  it('#offset() should be null by default', () => {
    const query = toQuery(builder);
    expect(query.offset).toBeNull();
  });

  it('#offset() should set number', () => {
    const query = toQuery(builder.offset(10));
    expect(query.offset).toBe(10);
  });

  // endregion
});

