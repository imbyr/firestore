import { Metadata } from '../src/metadata'
import { DocumentNotDecoratedError } from '../src/errors';

describe('Metadata', () => {
  const X_ID_KEY = 'xid';
  const X_COLLECTION = 'xs';
  const X_TYPE = class X {};
  const X_NAME = X_TYPE.name;
  const DOCUMENT_ERROR = `Type of "${X_NAME}" already mapped to "${X_COLLECTION}" collection.`;

  beforeEach(() => Metadata.clearAll());

  it('#addDocument() should add metadata and assign default values', () => {
    Metadata.addDocument(X_COLLECTION, X_ID_KEY, X_TYPE);
    const metadata = Metadata.getDocument(X_TYPE);

    expect(metadata.documentType).toBe(X_TYPE);
    expect(metadata.collectionName).toBe(X_COLLECTION);
    expect(metadata.idKey).toBe(X_ID_KEY);
    expect(metadata.references).toEqual([]);
  });

  it('#addDocument() should thrown error when document type decorated twice', () => {
    Metadata.addDocument(X_COLLECTION, X_ID_KEY, X_TYPE);
    expect(() => Metadata.addDocument(X_COLLECTION, X_ID_KEY, X_TYPE)).toThrow(DOCUMENT_ERROR);
  });

  const X_PROPERTY_KEY = 'y';
  const Y_COLLECTION = 'ys';
  const Y_TYPE = class T {};
  const T_NAME = Y_TYPE.name;
  const REFERENCE_ERROR = `Property key "${X_PROPERTY_KEY}" of "${X_NAME}" already has reference to "${T_NAME}".`;

  it('#addReference() should add metadata and assign default values', () => {
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);
    const metadata = Metadata.getDocument(X_TYPE);

    expect(metadata.documentType).toBe(X_TYPE);
    expect(metadata.collectionName).toBeNull();
    expect(metadata.idKey).toBeNull();

    const [reference] = metadata.references;
    expect(reference.referentType).toBe(Y_TYPE);
    expect(reference.propertyKey).toBe(X_PROPERTY_KEY);
  });

  it('#addReference() should throw error when property decorated twice', () => {
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);
    expect(() => Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE)).toThrow(REFERENCE_ERROR);
  });

  it('#validateAll() should throw DocumentNotDecoratedError when missed @Document() decoration', () => {
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);
    expect(() => Metadata.validateAll()).toThrow(DocumentNotDecoratedError);
  });

  it('#validateAll() should throw DocumentNotDecoratedError when missed @Document() on referent document', () => {
    Metadata.addDocument(X_COLLECTION, X_ID_KEY, X_TYPE);
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);
    expect(() => Metadata.validateAll()).toThrow(DocumentNotDecoratedError);
  });

  it('#mergeAll() should throw DocumentNotDecoratedError on internal #validateAll()', () => {
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);
    expect(() => Metadata.mergeAll()).toThrow(DocumentNotDecoratedError);
  });

  const Y_ID_KEY = 'yid';

  it('#mergeAll() should return merged mapping tree', () => {
    Metadata.addDocument(X_COLLECTION, X_ID_KEY, X_TYPE);
    Metadata.addDocument(Y_COLLECTION, Y_ID_KEY, Y_TYPE);
    Metadata.addReference(X_TYPE, X_PROPERTY_KEY, Y_TYPE);

    const snapshots = Metadata.mergeAll();

    const document = snapshots.find(x => x.documentType === X_TYPE);

    expect(document.documentType).toBe(X_TYPE);
    expect(document.collectionName).toBe(X_COLLECTION);
    expect(document.idKey).toBe(X_ID_KEY);

    const referent = snapshots.find(x => x.documentType === Y_TYPE);

    expect(referent.documentType).toBe(Y_TYPE);
    expect(referent.collectionName).toBe(Y_COLLECTION);
    expect(referent.idKey).toBe(Y_ID_KEY);
    expect(referent.references).toEqual({});

    expect(document.references[X_PROPERTY_KEY]).toBe(referent);
  });
});
