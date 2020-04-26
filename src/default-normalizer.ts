import { DocumentReference, DocumentSnapshot, Firestore, Timestamp } from '@google-cloud/firestore';

import { Normalizer } from './normalizer';
import { MetadataSnapshot } from './metadata';

export class DefaultNormalizer implements Normalizer {
  constructor(private _firestore: Firestore) { }

  async normalize<T extends object>(metadata: MetadataSnapshot, snapshot: DocumentSnapshot): Promise<T> {
    const document = Object.create(metadata.documentType.prototype);
    const data = snapshot.data();

    for (let [key, value] of Object.entries(data)) {
      if (value instanceof Timestamp) {
        value = value.toDate();
      }

      document[key] = value;
    }

    if (!document.id) {
      document.id = snapshot.id;
    }

    for (const [referenceKey, referenceMetadata] of Object.entries(metadata.references)) {
      if (document[referenceKey] instanceof DocumentReference) {
        document[referenceKey] = await this.normalize(
          referenceMetadata, await document[referenceKey].get()
        );
      }
    }

    return document;
  }

  /**
   * Denormalize document to save it into firestore.
   * @param metadata
   * @param document
   */
  denormalize(metadata: MetadataSnapshot, document: object): object {
    const data: object = {};

    for (let [key, value] of Object.entries(document)) {
      if (value instanceof Date) {
        value = Timestamp.fromDate(value);
      }

      data[key] = value;
    }

    for (const [referenceKey, referenceMetadata] of Object.entries(metadata.references)) {
      if (data[referenceKey]) {
        data[referenceKey] = this._firestore.collection(referenceMetadata.collectionName)
          .doc(data[referenceKey][referenceMetadata.idKey]);
      } else {
        data[referenceKey] = null;
      }
    }

    delete data[metadata.idKey];
    return data;
  }
}
