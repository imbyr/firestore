import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import { Transform, TransformCallback } from 'stream';

import { Normalizer } from './normalizer';
import { MetadataSnapshot } from './metadata';

export class StreamNormalizer extends Transform {
  constructor(private _normalizer: Normalizer, private _metadata: MetadataSnapshot) {
    super({ objectMode: true });
  }

  _transform(snapshot: QueryDocumentSnapshot, encoding: string, callback: TransformCallback): void {
    this._normalizer.normalize(this._metadata, snapshot).then(document => {
      console.log(document);
      this.push(document);
      callback();
    });
  }
}
