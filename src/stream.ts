export interface Stream<T extends any> extends NodeJS.ReadableStream {
  read(size?: number): T;
  setEncoding(encoding: string): this;
  unshift(chunk: T, encoding?: BufferEncoding): void;
  wrap(oldStream: Stream<T>): this;
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
