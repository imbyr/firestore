import { Query } from './query';
import { createWhere, Where, WhereOperator } from './where';
import { createOrderBy, OrderBy, OrderByDirection } from './order-by';

export class QueryBuilder<T extends object = any> {
  get version() { return this._version };
  private _version = 0;
  private _select: (keyof T | string)[] = [];
  private _where: Where[] = [];
  private _orderBy: OrderBy[] = [];
  private _limit: number | null = null;
  private _offset: number | null = null;

  private clone(changes: (instance: this) => void): this {
    const clone = Object.assign(Object.create(this), {
      ...this,
      _select: this._select.slice(),
      _where: this._where.slice(),
      _orderBy: this._orderBy.slice(),
      _version: this._version + 1,
    });

    changes(clone);
    return clone;
  }

  select(keys: '*' | keyof T | string | (keyof T | string)[]): this {
    const select = Array.isArray(keys) ? keys.slice() : ('*' === keys ? [] : [keys]);
    return this.clone(x => x._select = select);
  }

  /**
   * Alias for #where(key: string, {@link WhereOperator.EqualTo}, value: any)
   * @param key
   * @param value
   */
  where(key: string, value: any): this;

  /**
   * Push {@link WhereOperator.EqualTo} where expression ('==').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.EqualTo | '==', value: any): this;

  /**
   * Push {@link WhereOperator.LessThan} where expression ('<').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.LessThan | '<', value: any): this;

  /**
   * Push {@link WhereOperator.LessThanOrEqualTo} where expression ('<=').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.LessThanOrEqualTo | '<=', value: any): this;

  /**
   * Push {@link WhereOperator.GreaterThan} where expression ('>').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.GreaterThan | '>', value: any): this;

  /**
   * Push {@link WhereOperator.GreaterThanOrEqualTo} where expression ('>=').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.GreaterThanOrEqualTo | '>=', value: any): this;

  /**
   * Push {@link WhereOperator.ArrayContains} where expression ('array-contains').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.ArrayContains | 'array-contains', value: any): this;

  /**
   * Push {@link WhereOperator.In} where expression ('in').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.In | 'in', value: any[]): this;

  /**
   * Push {@link WhereOperator.ArrayContainsAny} where expression ('array-contains-any').
   *
   * @param key
   * @param operator
   * @param value
   */
  where(key: string, operator: WhereOperator.ArrayContainsAny | 'array-contains-any', value: any[]): this;
  where(key: string, operator: WhereOperator | any, value?: any): this {
    if (arguments.length === 2) {
      value = operator;
      operator = WhereOperator.EqualTo;
    }

    const where = createWhere(key, operator, value);
    return this.clone(x => x._where.push(where));
  }

  whereEqualTo(key: string, value: any): this {
    return this.where(key, WhereOperator.EqualTo, value);
  }

  whereLessThan(key: string, value: any): this {
    return this.where(key, WhereOperator.LessThan, value);
  }

  whereLessThanOrEqualTo(key: string, value: any): this {
    return this.where(key, WhereOperator.LessThanOrEqualTo, value);
  }

  whereGreaterThan(key: string, value: any): this {
    return this.where(key, WhereOperator.GreaterThan, value);
  }

  whereGreaterThanOrEqualTo(key: string, value: any): this {
    return this.where(key, WhereOperator.GreaterThanOrEqualTo, value);
  }

  whereArrayContains(key: string, value: any): this {
    return this.where(key, WhereOperator.ArrayContains, value);
  }

  whereIn(key: string, value: any[]): this {
    return this.where(key, WhereOperator.In, value.slice());
  }

  whereArrayContainsAny(key: string, value: any[]): this {
    return this.where(key, WhereOperator.ArrayContainsAny, value.slice());
  }

  orderBy(key: string, direction: OrderByDirection = OrderByDirection.Ascending): this {
    const order = createOrderBy(key, direction);
    return this.clone(x => x._orderBy.push(order));
  }

  orderByAscending(key: string): this {
    return this.orderBy(key, OrderByDirection.Ascending);
  }

  orderByDescending(key: string): this {
    return this.orderBy(key, OrderByDirection.Descending);
  }

  limit(limit: number): this {
    return this.clone(x => x._limit = limit);
  }

  offset(offset: number): this {
    return this.clone(x => x._offset = offset);
  }

  toQuery(): Query<T> {
    const {
      _select: select,
      _where: where,
      _orderBy: orderBy,
      _limit: limit,
      _offset: offset,
    } = this;

    return new Query<T>({
      select,
      where: where.slice(),
      orderBy: orderBy.slice(),
      limit,
      offset,
    });
  }
}
