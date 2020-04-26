import { createWhere, WhereOperator } from '../src/where';

describe('Where', () => {
  const KEY = 'key';
  const OPERATOR = WhereOperator.EqualTo;
  const VALUE = 'value';

  it('#createWhere() should return Where object', () => {
    const where = createWhere(KEY, OPERATOR, VALUE);

    expect(where.key).toBe(KEY);
    expect(where.operator).toBe(OPERATOR);
    expect(where.value).toBe(VALUE);
  });
});
