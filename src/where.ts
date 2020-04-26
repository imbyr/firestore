/**
 * Where operators list.
 */
export enum WhereOperator {
  EqualTo = '==',
  LessThan = '<',
  LessThanOrEqualTo = '<=',
  GreaterThan = '>',
  GreaterThanOrEqualTo = '<=',
  In = 'in',
  ArrayContains = 'array-contains',
  ArrayContainsAny = 'array-contains-any',
}

/**
 * Represents structure for a single where statement.
 */
export interface Where<T extends string = string> {
  key: T;
  operator: WhereOperator;
  value: any;
}

/**
 * Factory function to create {@link Where} using inline arguments.
 *
 * @param key
 * @param operator
 * @param value
 */
export const createWhere = (key: string, operator: WhereOperator, value: any): Where =>
  ({ key, operator, value });

export type InlineWhere<T extends object = any> = Partial<Record<keyof T | string, any | any[]>>;

