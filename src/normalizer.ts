import { DocumentSnapshot } from '@google-cloud/firestore';

import { MetadataSnapshot } from './metadata';

export interface Normalizer {
  normalize<T extends object>(metadata: MetadataSnapshot<T>, snapshot: DocumentSnapshot): T | Promise<T>;
  denormalize<T extends object>(metadata: MetadataSnapshot<T>, document: T): object | Promise<object>;
}

