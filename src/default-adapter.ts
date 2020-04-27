import { ok } from 'assert';
import {
  CollectionReference,
  FieldPath,
  Firestore,
  OrderByDirection as _OrderByDirection,
  Query as _Query,
  WhereFilterOp,
  Timestamp,
} from '@google-cloud/firestore';

import { MetadataSnapshot } from './metadata';
import { Query } from './query';
import { Where, WhereOperator } from './where';
import { OrderBy, OrderByDirection } from './order-by';
import { StreamNormalizer } from './stream-normalizer';
import { Stream } from './stream';
import { Normalizer } from './normalizer';
import { Adapter } from './adapter';

/**
 * {@link Where} operator mapping.
 */
const WHERE: Partial<Record<WhereOperator, WhereFilterOp>> = {
  [WhereOperator.EqualTo]: '==',
  [WhereOperator.In]: 'in',
  [WhereOperator.LessThan]: '<',
  [WhereOperator.LessThanOrEqualTo]: '<=',
  [WhereOperator.GreaterThan]: '>',
  [WhereOperator.GreaterThanOrEqualTo]: '>=',
};

/**
 * {@link OrderBy} direction mapping.
 */
const ORDER: Record<OrderByDirection, _OrderByDirection> = {
  [OrderByDirection.Ascending]: 'asc',
  [OrderByDirection.Descending]: 'desc',
};

export class DefaultAdapter implements Adapter {
  constructor(readonly firestore: Firestore, readonly normalizer: Normalizer) { }

  private collection<T extends object>(metadata: MetadataSnapshot): CollectionReference<T> {
    return this.firestore.collection(metadata.collectionName) as CollectionReference<T>;
  }

  private _where<T extends object>(metadata: MetadataSnapshot, query: _Query<T>, where: Where[]): _Query<T> {
    return where.reduce((_query, { key, operator, value }) => {
      if (key === metadata.idKey) {
        key = FieldPath.documentId() as any;
      }

      const _operator = WHERE[operator];
      ok(_operator, 'Unsupported where operator "' + operator + '"');

      if (metadata.references[key]) {
        const referentMetadata = metadata.references[key];

        if (Array.isArray(value)) {
          // In or any or something like that
          value = value.map(
            _value => _value ? this.collection(referentMetadata).doc(
              _value instanceof referentMetadata.documentType ?
                _value[referentMetadata.idKey] : _value
            ) : null
          );
        } else {
          // Equals or something like that
          value = value ? this.collection(referentMetadata).doc(
            value instanceof referentMetadata.documentType ?
              value[referentMetadata.idKey] : value
          ) : null;
        }
      }

      if (value instanceof Date) {
        value = Timestamp.fromDate(value);
      }

      return _query.where(key, _operator, value);
    }, query);
  }

  private _orderBy<T extends object>(query: _Query<T>, orderBy: OrderBy[]): _Query<T> {
    return orderBy.reduce((_query, { key, direction }) => {
      const _direction = ORDER[direction];
      ok(_direction, 'Unsupported order direction "' + direction + '"');
      return _query.orderBy(key, _direction);
    }, query);
  }

  private _select<T extends object>(metadata: MetadataSnapshot, query: Query): _Query<T> {
    let _query = this.collection(metadata) as _Query<T>;

    if (query.select.length) {
      const select = query.select as string[];
      _query = _query.select(...select);
    }

    _query = this._where(metadata, _query, query.where);
    _query = this._orderBy(_query, query.orderBy);

    if (query.limit) {
      _query = _query.limit(query.limit);
    }

    if (query.offset) {
      _query = _query.offset(query.offset);
    }

    return _query;
  }

  async count(metadata: MetadataSnapshot, query: Query): Promise<number> {
    let _query = this.collection(metadata).select('id');
    _query = this._where(metadata, _query, query.where);
    return (await _query.get()).size;
  }

  stream<T extends object>(metadata: MetadataSnapshot, query: Query): Stream<T> {
    const transformer = new StreamNormalizer(this.normalizer, metadata);
    return this._select(metadata, query).stream().pipe(transformer) as Stream<T>;
  }

  async fetch<T extends object>(metadata: MetadataSnapshot, query: Query): Promise<T[]> {
    const _query = this._select<T>(metadata, query);

    const documents: T[] = [];
    const snapshots = (await _query.get()).docs;

    for (const snapshot of snapshots) {
      documents.push(await this.normalizer.normalize(metadata, snapshot));
    }

    return documents;
  }

  async create(metadata: MetadataSnapshot, document: object): Promise<void> {
    const data = await this.normalizer.denormalize(metadata, document);
    const idKey = metadata.idKey;
    const idValue = document[idKey];

    if (idValue) {
      // TODO: [Feature] check if document exists and than throw an error.
      await this.collection(metadata).doc(idValue).set(data);
    } else {
      const response = await this.collection(metadata).add(data);
      document[idKey] = response.id;
    }
  }

  async update(metadata: MetadataSnapshot, document: object): Promise<void> {
    const data = await this.normalizer.denormalize(metadata, document);
    await this.collection(metadata).doc(document[metadata.idKey]).set(data);
  }

  async delete(metadata: MetadataSnapshot, document: object): Promise<void> {
    await this.collection(metadata).doc(document[metadata.idKey]).delete();
  }
}
