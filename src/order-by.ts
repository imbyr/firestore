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

export type InlineOrderBy<T extends object = any> = keyof T | string | Partial<Record<keyof T, OrderByDirection>>
