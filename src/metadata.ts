import { Type } from './type';
import { DocumentNotDecoratedError } from './errors';
import { ok } from 'assert';

/**
 * Local variable to store decoration.
 */
const METADATA: Metadata[] = [];

/**
 * Structure of document reference metadata.
 */
export interface ReferenceMetadata<T extends object = any> {
  propertyKey: keyof T;
  referentType: Type<T>;
}

/**
 * Structure of collection metadata.
 */
export interface Metadata<T extends object = any> {
  collectionName: string | null;
  idKey: string | null;
  documentType: Type<T>;
  references: ReferenceMetadata[];
}

/**
 * Merged structure of collection metadata.
 * Represents as tree structure where reference includes document metadata.
 */
export interface MetadataSnapshot<T extends object = any> {
  collectionName: string | null;
  idKey: string;
  documentType: Type<T>;
  references: Record<string, MetadataSnapshot>;
}

/**
 * @internal Metadata API. Uses to validate, merge and add decorations.
 */
export namespace Metadata {
  export function addDocument<T extends object>(collectionName: string, idKey: string, documentType: Type<T>) {
    let metadata = METADATA.find(x => documentType === x.documentType);

    if (!metadata) {
      metadata = { collectionName: null, documentType, idKey: null, references: [] };
      METADATA.push(metadata);
    }

    if (metadata.collectionName || metadata.idKey) {
      throw new Error('Type of "' + documentType.name + '" already mapped to "' + metadata.collectionName + '" collection.');
    }

    metadata.collectionName = collectionName;
    metadata.idKey = idKey;
  }

  /**
   * @internal Uses for testing purpose.
   * @param documentType Type of document.
   */
  export function getDocument<T extends object>(documentType: Type<T>): Metadata<T> {
    const metadata = METADATA.find(x => documentType === x.documentType);
    ok(metadata, 'Document metadata not found.');
    return metadata;
  }

  export function addReference(documentType: Type, propertyKey: string, referentType: Type) {
    let metadata = METADATA.find(x => documentType === x.documentType);

    if (!metadata) {
      metadata = { collectionName: null, documentType, idKey: null, references: [] };
      METADATA.push(metadata);
    }

    let reference = metadata.references.find(x => propertyKey === x.propertyKey);

    if (reference) {
      throw new Error('Property key "' + propertyKey + '" of "' + documentType.name + '" already has reference to "' + referentType.name + '".')
    }

    reference = { propertyKey, referentType };
    metadata.references.push(reference);
  }

  /**
   * @internal Uses for testing purpose.
   * @param documentType Type of document.
   * @param propertyKey Document property.
   */
  export function getReference<T extends object>(documentType: Type, propertyKey: string): ReferenceMetadata<T> {
    const metadata = getDocument(documentType);
    const reference = metadata.references.find(x => x.propertyKey === propertyKey);
    ok(reference, 'Reference metadata not found.');
    return reference;
  }

  export function validateAll() {
    for (const { collectionName, idKey, documentType, references } of METADATA) {
      if (null === collectionName || null === idKey) {
        throw new DocumentNotDecoratedError(documentType);
      }

      for (const { referentType } of references) {
        if (!METADATA.some(x => x.documentType === referentType)) {
          throw new DocumentNotDecoratedError(referentType);
        }
      }
    }
  }

  export function mergeAll() {
    validateAll();

    const snapshots: MetadataSnapshot[] = [];
    const queue: ({ snapshot: MetadataSnapshot } & ReferenceMetadata)[] = [];

    for (const { collectionName, documentType, idKey, references } of METADATA) {
      const snapshot = { collectionName, documentType, idKey, references: {} };
      references.forEach(reference => queue.push({ ...reference, snapshot }));
      snapshots.push(snapshot);
    }

    while (queue.length) {
      const { snapshot, propertyKey, referentType } = queue.shift();
      snapshot.references[propertyKey as string] = snapshots.find(x => x.documentType === referentType);
    }

    return snapshots;
  }

  /**
   * @internal Uses for testing purpose.
   */
  export function clearAll() {
    METADATA.splice(0);
  }
}
