import { MetadataSnapshot } from './metadata';
import { Query } from './query';
import { Stream } from './stream';
import { Awaitable } from './awaitable';

/**
 * Describes base adapter API.
 */
export interface Adapter {
  /**
   * Get count of documents based on {@link Query}.
   *
   * @param metadata
   * @param query
   */
  count(metadata: MetadataSnapshot, query: Query): Awaitable<number>;

  /**
   * Fetch all documents based on {@link Query}.
   *
   * @param metadata
   * @param query
   */
  fetch<T extends object>(metadata: MetadataSnapshot<T>, query: Query): Awaitable<T[]>;

  /**
   * Get documents stream based on {@link Query}.
   *
   * @param metadata
   * @param query
   */
  stream<T extends object>(metadata: MetadataSnapshot<T>, query: Query): Stream<T>;

  /**
   * Create document in collection.
   *
   * @param metadata
   * @param document
   */
  create(metadata: MetadataSnapshot, document: object): Awaitable<void>;

  /**
   * Update document in collection.
   *
   * @param metadata
   * @param document
   */
  update(metadata: MetadataSnapshot, document: object): Awaitable<void>;

  /**
   * Delete document from collection.
   *
   * @param metadata
   * @param document
   */
  delete(metadata: MetadataSnapshot, document: object): Awaitable<void>;
}
