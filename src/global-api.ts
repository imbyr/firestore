/**
 * Global API to configure/get {@link Adapter} and get particular {@link Collection}.
 */

import { Firestore } from '@google-cloud/firestore';

import { AdapterNotConfiguredError, DocumentNotDecoratedError } from './errors';
import { Adapter } from './adapter';
import { Metadata, MetadataSnapshot } from './metadata';
import { Type } from './type';
import { Collection } from './collection';
import { Normalizer } from './normalizer';
import { DefaultNormalizer } from './default-normalizer';
import { DefaultAdapter } from './default-adapter';

// region Adapter

let ADAPTER: Adapter;

export function configureFirestore(firestore: Firestore): void;
export function configureFirestore(firestore: Firestore, normalizer: Normalizer): void;
export function configureFirestore(firestore: Firestore, normalizer?: Normalizer): void {
  if (!normalizer) {
    normalizer = new DefaultNormalizer(firestore);
  }

  ADAPTER = new DefaultAdapter(firestore, normalizer);
}

export function getAdapter(): Adapter {
  if (!ADAPTER) {
    throw new AdapterNotConfiguredError();
  }

  return ADAPTER;
}

// endregion

// region Collection

interface CollectionFlyweight<T extends object = any> {
  adapter: Adapter;
  documentType: Type<T>;
  collection: Collection<T>;
}

let SNAPSHOTS: MetadataSnapshot[];
const FLYWEIGHTS: CollectionFlyweight[] = [];

export function getCollection<T extends object = any>(documentType: Type<T>): Collection<T>;
export function getCollection<T extends object = any>(documentType: Type<T>, adapter: Adapter): Collection<T>;
export function getCollection<T extends object = any>(documentType: Type<T>, adapter?: Adapter): Collection<T> {
  if (!adapter) {
    adapter = getAdapter();
  }

  const flyweight = FLYWEIGHTS.find(x => documentType === x.documentType && adapter === x.adapter);

  if (flyweight) {
    return flyweight.collection;
  }

  if (!SNAPSHOTS) {
    SNAPSHOTS = Metadata.mergeAll();
  }

  const snapshot = SNAPSHOTS.find(x => documentType === x.documentType);

  if (!snapshot) {
    throw new DocumentNotDecoratedError(documentType);
  }

  const collection = new Collection(adapter, snapshot);
  FLYWEIGHTS.push({ documentType, adapter, collection });
  return collection;
}

// endregion
