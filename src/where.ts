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

/**
 * Structure that decomposes to {@link Where[]}.
 * When value is type of {@link Array} then {@link WhereOperator.In} will be applied.
 * In other cases {@link WhereOperator.EqualTo} used.
 */
export type WhereRecord<T extends object = any> = Partial<Record<keyof T | string, any | any[]>>;

/**
 * Factory method to decompose {@link WhereRecord} into {@link Where[]}.
 *
 * @param record
 */
export function decomposeWhereRecord<T extends object = any>(record: WhereRecord<T>): Where[] {
  return Object.entries(record).map(([key, value]) => {
    return { key, operator: Array.isArray(value) ? WhereOperator.In : WhereOperator.EqualTo, value };
  });
}
