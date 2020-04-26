import { Type } from './type';

export class FirestoreError extends Error {
  name = 'FirestoreError';
}

export class AdapterError extends Error {
  name = 'AdapterError';
}

export class AdapterNotConfiguredError extends AdapterError {
  name = 'AdapterNotConfiguredError';

  constructor() {
    super('Adapter not configured.');
  }
}

export class CollectionError extends Error {
  name = 'CollectionError';
}

export class DocumentNotFoundError extends CollectionError {
  name = 'DocumentNotFound';

  constructor() {
    super('Document not found.');
  }
}

export class CollectionMutatedError extends CollectionError {
  name = 'CollectionMutatedError';

  constructor() {
    super('Collection already mutated. Please use original instance of Collection.');
  }
}

export class MetadataError extends Error {
  name = 'MetadataError';
}

export class ClassNotDecoratedError extends MetadataError {
  name = 'ClassNotDecoratedError';

  constructor(type: Type, decoratorName: string) {
    super('Class "' + type.name + '" not decorated with @' + decoratorName + '().');
  }
}

export class DocumentNotDecoratedError extends ClassNotDecoratedError {
  name = 'DocumentNotDecoratedError';

  constructor(documentType: Type) {
    super(documentType, 'Document');
  }
}
