import { Where } from './where';
import { OrderBy } from './order-by';

export class Query<T extends object = any> {
  select: (keyof T | string)[];
  where: Where[];
  orderBy: OrderBy[];
  limit: number | null;
  offset: number | null;

  constructor({
                select,
                where,
                orderBy,
                limit,
                offset,
              }: {
    select: (keyof T | string)[],
    where: Where[],
    orderBy: OrderBy[],
    limit: number | null;
    offset: number | null;
  }) {
    this.select = select;
    this.where = where;
    this.orderBy = orderBy;
    this.limit = limit;
    this.offset = offset;
  }
}
