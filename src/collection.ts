import { QueryBuilder } from './query-builder';
import { Query } from './query';
import { MetadataSnapshot } from './metadata';
import { Adapter } from './adapter';
import { Stream } from './stream';
import { CollectionMutatedError, DocumentNotFoundError } from './errors';
import { InlineWhere } from './where';

/**
 * {@link Collection} represents a repository API for particular collection.
 */
export class Collection<T extends object = any> extends QueryBuilder<T> implements AsyncIterable<T> {
  constructor(readonly adapter: Adapter, readonly metadata: MetadataSnapshot<T>) {
    super();
  }

  /**
   * Find the first document that meets {@link Query} criteria.
   * If document not found you'll get a {@link DocumentNotFoundError} error.
   *
   * @throws DocumentNotFoundError
   */
  async first(): Promise<T> {
    const [entry] = await this.limit(1).fetch();

    if (!entry) {
      throw new DocumentNotFoundError();
    }

    return entry;
  }

  /**
   * Validate current {@link QueryBuilder.version}. Ensure that collection is original without any changes.
   *
   * @throws CollectionMutatedError
   */
  private _validateVersion() {
    if (this.version > 0) {
      throw new CollectionMutatedError();
    }
  }

  /**
   * Find a first document by its string identifier.
   *
   * Example:
   *
   * const document = await collection.find('bar');
   *
   * @throws CollectionMutatedError
   * @throws DocumentNotFoundError
   */
  find(id: string): Promise<T>;

  /**
   * Find a first document that matched {@link Where}.
   *
   * Example:
   *
   * const document = await collection.find({ id: 'bar' });
   *
   * @throws CollectionMutatedError
   * @throws DocumentNotFoundError
   */
  find(where: InlineWhere<T>): Promise<T>;

  /**
   * Find a first document by its string identifier.
   *
   * Example:
   *
   * const document = await collection.find('bar');
   *
   * @throws CollectionMutatedError
   * @throws DocumentNotFoundError
   */
  find(where: string | InlineWhere<T>): Promise<T> {
    this._validateVersion();

    if (typeof where === 'string') {
      where = { [this.metadata.idKey]: where } as InlineWhere<T>;
    }

    return Object.entries(where).reduce((query, [key, value]: [string, any | any[]]) => {
      return Array.isArray(value) ? query.whereIn(key, value) : query.whereEqualTo(key, value);
    }, this).first();
  }

  async count(where: InlineWhere<T> = {}): Promise<number> {
    let query = this;

    query = Object.entries(where).reduce((_query, [key, value]: [string, any | any[]]) => {
      return Array.isArray(value) ? _query.whereIn(key, value) : _query.whereEqualTo(key, value);
    }, query);

    return this.adapter.count(this.metadata, query.toQuery());
  }

  // region Write operations

  /**
   * Create a new document in current collection.
   *
   * @param document
   *
   * @throws CollectionMutatedError
   */
  async create(document: T): Promise<void> {
    this._validateVersion();
    return this.adapter.create(this.metadata, document);
  }

  /**
   * Update document data.
   *
   * @param document
   *
   * @throws CollectionMutatedError
   */
  async update(document: T): Promise<void> {
    this._validateVersion();
    return this.adapter.update(this.metadata, document);
  }

  /**
   * Delete document from collection.
   *
   * @param document
   *
   * @throws CollectionMutatedError
   */
  async delete(document: T): Promise<void> {
    this._validateVersion();
    return this.adapter.delete(this.metadata, document);
  }

  // endregion

  /**
   * Fetch all documents that meets {@link Query} criteria.
   */
  async fetch(): Promise<T[]> {
    const query = this.toQuery();
    return this.adapter.fetch(this.metadata, query);
  }

  /**
   * Get {@link Stream} of documents that meet {@link Query} criteria.
   */
  stream(): Stream<T> {
    const query = this.toQuery();
    return this.adapter.stream(this.metadata, query);
  }

  /**
   * Iterate {@link Stream} of documents that meet {@link Query} criteria.
   */
  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this.stream()[Symbol.asyncIterator]();
  }
}
