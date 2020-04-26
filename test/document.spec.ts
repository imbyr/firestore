import { Document, DEFAULT_ID_KEY } from '../src/document'
import { Metadata } from '../src/metadata'

describe('@Document()', () => {
  const COLLECTION = 'tests';
  const TEST_ID = 'tid';

  it('should decorate document class with default id: "' + DEFAULT_ID_KEY + '"', () => {
    @Document(COLLECTION)
    class Test { id: string; }

    const metadata = Metadata.getDocument(Test);

    expect(metadata.collectionName).toBe(COLLECTION);
    expect(metadata.idKey).toBe(DEFAULT_ID_KEY);
    expect(metadata.documentType).toBe(Test);
  });

  it('should decorate document class with custom id: "tid"', () => {
    @Document(COLLECTION, TEST_ID)
    class Test { [TEST_ID]: string; }

    const metadata = Metadata.getDocument(Test);

    expect(metadata.collectionName).toBe(COLLECTION);
    expect(metadata.idKey).toBe(TEST_ID);
    expect(metadata.documentType).toBe(Test);
  });
});
