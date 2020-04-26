import { Type } from './type';
import { Metadata } from './metadata';

/**
 * Default id key for a document.
 */
export const DEFAULT_ID_KEY = 'id';

/**
 * Represents default document structure if there is no custom id key.
 */
export interface DocumentWithDefaultId {
  [DEFAULT_ID_KEY]: string;
}

/**
 * Decorate class as the document of Firestore collection.
 * Decorated class should implements signature of {@link DocumentWithDefaultId}.
 * If you'd like to use custom id key, add second argument "idKey: string".
 *
 * Example:
 *
 * @Document('tasks')
 * class Task {
 *   id: string;
 *   name: string;
 * }
 *
 * @param collectionName Collection name.
 */
export function Document<T extends DocumentWithDefaultId>(collectionName: string): (documentType: Type<T>) => void;

/**
 * Decorate class as the document of Firestore collection with custom id key.
 *
 * Example:
 *
 * @Document('tasks', 'tid')
 * class Task {
 *   tid: string;
 *   name: string;
 * }
 *
 * @param collectionName Collection name.
 * @param idKey Name of id property.
 */
export function Document<T extends object>(collectionName: string, idKey: keyof T): (documentType: Type<T>) => void;
export function Document<T extends object>(collectionName: string, idKey = DEFAULT_ID_KEY) {
  return (documentType: Type<T>) =>
    Metadata.addDocument(collectionName, idKey, documentType)
}
