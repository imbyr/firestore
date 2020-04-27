/**
 * Order by direction list.
 */
export enum OrderByDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

/**
 * Represents structure for a single order by statement.
 */
export interface OrderBy {
  key: string;
  direction: OrderByDirection;
}

/**
 * Factory function to create {@link OrderBy} using inline arguments.
 *
 * @param key
 * @param direction
 */
export const createOrderBy = (key: string, direction = OrderByDirection.Ascending): OrderBy =>
  ({ key, direction });

/**
 * Structure that decomposes to {@link OrderBy[]}.
 */
export type OrderByRecord<T extends object = any> = Partial<Record<keyof T, OrderByDirection>>

/**
 * Factory method to decompose {@link OrderByRecord} into {@link OrderBy[]}.
 *
 * @param record
 */
export function decomposeOrderByRecord(record: OrderByRecord): OrderBy[] {
  return Object.entries(record).map(([key, direction]) => ({ key, direction }));
}
