import { Document } from '../src/document'
import { Metadata } from '../src/metadata'
import { Reference } from '../src/reference';

describe('@Reference()', () => {
  const COLLECTION_X = 'xs';
  const COLLECTION_Y = 'ys';

  it('should decorate document with reference', () => {
    @Document(COLLECTION_X)
    class X { id: string; }

    @Document(COLLECTION_Y)
    class Y {
      id: string;

      @Reference(X)
      x: X;
    }

    const reference = Metadata.getReference(Y, 'x');
    expect(reference.referentType).toBe(X);
  });
});
