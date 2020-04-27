# Firestore ORM

Server ORM to process Firestore operations.

**Main goal of this library is to provide as simple as possible interface, good code design and batch of features 💛**

If you unable to find feature that you interested in, please [report an issue](https://github.com/imbyr/firestore/issues/new) and we'll discuss it!

[`@imbyr/firestore` on npmjs.com](https://www.npmjs.com/package/@imbyr/firestore)

## Contents

- [Configuration: `@google-cloud/firestore` or `firebase-admin` package](#configuration)
- [Usage example: Task management](#usage-example)
- [Document mapping `@Document(collectionName: string, idKey = 'id'')`](#document-mapping)
  - [With default `id` property](#with-default-id-property)
  - [With custom `id` property](#with-custom-id-property)
  - [Document reference `@Reference(referentType: Type)`](#document-reference)
- [Collection `Collection`](#collection)
  - [Get collection `getCollection()`](#get-collection)
  - [Find first document `#first(): Promise<T>`](#find-first-document)
  - [Find document by id `#find(id: string): Promise<T>`](#find-document-by-id)
  - [Find one document where `#find(where: Record<string, any | any[]>): Promise<T>`](#find-one-document-where)
  - [Count documents `#count(): Promise<number>`](#count-documents)
  - [Fetch document array `#fetch(): Promise<T[]>`](#fetch-document-array)
  - [Stream documents `#stream(): Stream<T>`](#stream-documents)
  - [Iterate documents `#[Symbol.asyncIterator](): AsyncIterable<T>`](#iterate-documents)
  - [Create document `#create(document: T): Promise<void>`](#create-document)
  - [Update document `#update(document: T): Promise<void>`](#update-document)
  - [Delete document `#delete(document: T): Promise<void>`](#delete-document)
- [Query builder `QueryBuilder`](#query-builder)
  - [Version `#version: number`](#version)
  - [Select `#select(keys: '*' | string | string[]): this`](#select)
  - [Where `#where(key: string, value: any): this`](#where)
  - [Where record `#where(record: WhereRecord): this`](#where-record)
  - [Order by `#orderBy(key: string, direction = 'asc'): this`](#order-by)
  - [Limit `#limit(limit: number): this`](#limit)
  - [Offset `#offset(offset: number): this`](#offset)
  - [To query `#toQuery(): Query`](#to-query)
- [Query object](#query-object)
- [License](#licence)
  

## Configuration

Install `@imbyr/firestore`:

```typescript
npm install @imbyr/firestore --save
```

Then you need to install `@google-cloud/firestore`. You can use `@google-cloud/firestore` or `firebase-admin`.

Using `@google-cloud/firestore` package:

```
npm install @google-cloud/firestore --save
```

Firestore configuration:

 ```typescript
import { configureFirestore } from '@imbyr/firestore';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({ keyFilename: 'path/to/serviceAccount.json' });
configureFirestore(firestore);
```

Using `firebase-admin` package:

```
npm install firebase-admin --save
```

Firestore configuration:

 ```typescript
import { configureFirestore } from '@imbyr/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.cert('path/to/serviceAccount.json') });

const firestore = admin.firestore();
configureFirestore(firestore);
```

## Usage example

Here the simple example how to manage tasks:

```typescript
import { Document, getCollection } from '@imbyr/firestore';

// Collection name
const TASKS = 'tasks';

@Document(TASKS)
class Task {
  id: string;
  fulfilled = false;
  constructor(public name: string) { }
}

(async () => {
  // Instantiate collection.
  const tasks = getCollection(Task);

  // Prepare fulfilled query.
  const fulfilled = tasks.where('fulfilled', true);
  
  // Create task documents.
  for (let i = 0; i < 5; i++) {
    const task = new Task('Task #' + i);
    await tasks.create(task);
  }

  await tasks.count(); // returns: 5
  await fulfilled.count(); // returns: 0

  // Fulfill 4 tasks.
  for await (const task of tasks.limit(4)) {
    task.fulfilled = true;
    await tasks.update(task);
  } 

  await fulfilled.count(); // returns: 4

  // Delete all fulfilled tasks.
  for await (const task of fulfilled) {
     await tasks.delete(task);
  }

  await tasks.count(); // returns: 1
  await fulfilled.count(); // returns: 0

  // Find the remaining task.
  const task = await tasks.first();
})();
```

## Document mapping

Signature: `@Document(collectionName: string, idKey = 'id');`

Current decorator maps class as document of particular collection.  

The document must have the id property. By default key is `id` but you can use your own.

### With default id property

Example:

```typescript
import { Document } from '@imbyr/firestore';

@Document('tasks')
class Task {
  id: string;
  name: string;
}
```

### With custom id property

Example:

```typescript
import { Document } from '@imbyr/firestore';

@Document('tasks', 'tid')
class Task {
  tid: string;
  name: string;
  // ...
}
```

### Document reference

Signature: `@Reference(referentType: Type)`

References encapsulates Firestore logic to make relation between documents. 

**Important: when document with reference reads, normalizer under the hood gets every reference as particular document. Optimization ideas are welcome.**

Example:

```typescript
import { Document, Reference, getCollection } from '@imbyr/firestore';

@Document('employees')
class Employee {
  id: string;
}

@Document('tasks')
class Task {
  id: string;

  @Reference(Employee)
  assignee: Employee;

  constructor(assignee: Employee) {
    this.assignee = assignee;
  }
}

(async () => { 
  const employees = getCollection(Employee);

  // Create a single employee.
  const employee = new Employee();
  await employees.create(employee);

  const tasks = getCollection(Task); 

  // Create a single taks for employee.
  const task = new Task(employee);
  await tasks.create(task);

  // Find task where assignee
  const status = await tasks.find({ assignee: employee });
  console.log(status);

  /*
   * Result:
   * 
   * Task {
   *   id: 'auto-generated id',
   *   assignee: Employee {
   *     id: 'auto-generated id',
   *   }
   * }
   */
})();
```

## Collection

`Collection` extends `QueryBuild` and provides CRUD API for particular collection.

### Get collection

Factory function that return instance of `Collection<T>`;

Signature: ``getCollection<T extends object>(documentType: Type<T>): Collection<T>;``

Example:

```typescript
import { getCollection } from '@imbyr/firestore';

// Get tasks collection
const collection = getCollection(Task);
```

### Find first document

Signature: `#first(): Promise<T>`

If document not found `DocumentNotFoundError` will be thrown.

Example:

```typescript
const task = await collection.first();
```

Query example:

```typescript
const task = await collection.where('active', true).first();
```

### Find document by id

Signature: `#find<T>(id: string): Promise<T>`

If document not found `DocumentNotFoundError` will be thrown.

Example:

```typescript
const document = await collection.find('1');
```

### Find one document where

Signature: `#find<T>(where: Record<string, any | any[]>): Promise<T>`

If record value is `Array` then `WhereOperator.In` will be used. In other cases `WhereOperator.EqualTo` uses.

If document not found `DocumentNotFoundError` will be thrown.

Example:

```typescript
const document = await collection.find('1');
```

### Count documents

Signature: `#count(): Promise<number>`

Example:

```typescript
const count = await collection.count();
```

### Fetch document array

Signature: `#fetch(): Promise<T[]>`

Example:

```typescript
const documents = await collection.fetch();
```

Example with query:

```typescript
const documents = await collection.limit(20).fetch();
```

### Iterate documents

Collection can be iterated using async `for/of`.

Example:

```typescript
for await (const document of collection) {
  console.log(document);
}
```

```typescript
for await (const document of collection.limit(20)) {
  console.log(document);
}
```

### Stream documents

If you familiar with NodeJS streams you can use it for different purposes.

Signature: `#stream(): NodeJS.ReadableStream`

Collection stream example:

```typescript
const documents = [];

const stream = collection.stream();
stream.on('data', document => documents.push(document));
stream.on('end', () => {
    console.log('Found ' + documents.length ' documents')
});
```

Query stream example:

```typescript
const stream = collection
  .select('id')
  .where('active', 'true')
  .orderBy('name')
  .limit(10)
  .offset(5)
  .stream();

stream.on('data', document => documents.push(document));
stream.on('end', () => {
    console.log('Found ' + documents.length ' documents')
});
```

### Create document

Signature: `#create(document: T): Promise<void>`

Example:

```typescript
const task = new Task();
await collection.create(task);
```

### Update document

Signature: `#update(document: T): Promise<void>`

Example:

```typescript
const document = await collection.first();
document.name = 'Another name';
await collection.update(document);
```

### Delete document

Signature: `#delete(document: T): Promise<void>`

Example:

```typescript
const document = await collection.first();
await tasks.delete(document);
```

## Query builder

`QueryBuilder` is an interface to prepare filtering/sorting/pagination expressions for read operation.

Example:

```typescript
const builder = new QueryBuilder()
  .select('id')
  .where('active', true)
  .whereIn('status', ['foo', 'bar'])
  .orderBy('created')
  .limit(20)
  .offset(10);
```  

Every operation clones instance of `QueryBuilder` and increases `#version` value.

### Version

Version specifies count of operations that was executed on current instance. This value uses in `Collection` to identify that instance was not modified.
 
Example:

```typescript
const version = builder.version;
```

### Select

Signature: `#select(keys: '*' | string | string[]): this`

Example:

```typescript
builder = builder.select('*');
// or
builder = builder.select('id');
// or
builder = builder.select(['id', 'name']);
```

### Where

Signatures: 

- `#where(key: string, value: any): this` shortcut for `#where(key: string, WhereOperator.EqualTo, value: string): this`
- `#where(key: string, operator: WhereOperator, value: any): this`

**Equal to (`==`)** example:

```typescript
builder = builder.where('id', '1');
// or
builder = builder.where('id', WhereOperator.EqualTo, '1');
// or
builder = builder.whereEqualTo('id', '1');
```

**Less than (`<`)** example:

```typescript
builder = builder.where('id', WhereOperator.LessThan, '1');
// or
builder = builder.whereLessThan('id', '1');
```

**Less than or equal to (`<=`)** example:

```typescript
builder = builder.where('id', WhereOperator.LessThanOrEqualTo, '1');
// or
builder = builder.whereLessThanOrEqualTo('id', '1');
```

**Greater than (`>`)** example:

```typescript
builder = builder.where('id', WhereOperator.GreaterThan, '1');
// or
builder = builder.whereGreaterThan('id', '1');
```

**Greater than or equal to (`>=`)** example:

```typescript
builder = builder.where('id', WhereOperator.GreaterThanOrEqualTo, '1');
// or
builder = builder.whereGreaterThanOrEqualTo('id', '1');
```

**Array contains (`array-contains`)** example:

```typescript
builder = builder.where('id', WhereOperator.ArrayContains, '1');
// or
builder = builder.whereArrayContains('id', '1');
```

**In (`in`)** example:

```typescript
builder = builder.where('id', WhereOperator.In, ['1']);
// or
builder = builder.whereIn('id', ['1']);
```

**Array contains any (`array-contains-any`)** example:

```typescript
builder = builder.where('id', WhereOperator.ArrayContainsAny, ['1']);
// or
builder = builder.whereArrayContainsAny('id', ['1']);
```

### Where record

`WhereRecord` decomposes to `Where[]`. 
When value is type of `Array` then `WhereOperator.In` will be applied.
In other cases `WhereOperator.EqualTo` used.

Signatures: 

- `type WhereRecord = Partial<Record<string, any | any[]>>`
- `#where(record: WhereRecord): this`

Example:

```typescript
builder = builder.where({ 
  id: '1', 
  status: 'active',
  author: ['author-a', 'author-b'], 
});
```

### Order by

Signatures: `#orderBy(key: string, direction = OrderByDirection.Ascending): this`

Example:

```typescript
builder = builder.orderBy('id');
// or
builder = builder.orderBy('id', OrderByDirection.Ascending);
// or
builder = builder.orderBy('id', OrderByDirection.Descending);
```

### Limit

Signatures: `#limit(limit: number): this`

Example:

```typescript
builder = builder.limit(20);
```

### Offset

Signatures: `#offset(offset: number): this`

Example:

```typescript
builder = builder.offset(20);
```

### To query

Signatures: `#toQuery(): Query`

Example:

```typescript
const query = builder.toQuery();
```

## Query object

`Query` object is the result or `QueryBuilder`.

Signature:

```typescript
import { Where, OrderBy } from '@imbyr/firestore';

interface Query {
  select: string[];
  where: Where[];
  orderBy: OrderBy[];
  limit: number | null;
  offset: number | null;
}
```

## Licence

See [LICENSE](https://github.com/imbyr/firestore/blob/master/LICENSE) for details.
