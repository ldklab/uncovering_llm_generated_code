/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter as EE } from 'events';
import { BrotliDecompress, Unzip } from 'minizlib';
import { Yallist } from 'yallist';
import { TarOptions } from './options.js';
import { Pax } from './pax.js';
import { ReadEntry } from './read-entry.js';
import { type WarnData, type Warner } from './warn-method.js';
declare const STATE: unique symbol;
declare const WRITEENTRY: unique symbol;
declare const READENTRY: unique symbol;
declare const NEXTENTRY: unique symbol;
declare const PROCESSENTRY: unique symbol;
declare const EX: unique symbol;
declare const GEX: unique symbol;
declare const META: unique symbol;
declare const EMITMETA: unique symbol;
declare const BUFFER: unique symbol;
declare const QUEUE: unique symbol;
declare const ENDED: unique symbol;
declare const EMITTEDEND: unique symbol;
declare const EMIT: unique symbol;
declare const UNZIP: unique symbol;
declare const CONSUMECHUNK: unique symbol;
declare const CONSUMECHUNKSUB: unique symbol;
declare const CONSUMEBODY: unique symbol;
declare const CONSUMEMETA: unique symbol;
declare const CONSUMEHEADER: unique symbol;
declare const CONSUMING: unique symbol;
declare const BUFFERCONCAT: unique symbol;
declare const MAYBEEND: unique symbol;
declare const WRITING: unique symbol;
declare const ABORTED: unique symbol;
declare const SAW_VALID_ENTRY: unique symbol;
declare const SAW_NULL_BLOCK: unique symbol;
declare const SAW_EOF: unique symbol;
declare const CLOSESTREAM: unique symbol;
export type State = 'begin' | 'header' | 'ignore' | 'meta' | 'body';
export declare class Parser extends EE implements Warner {
    file: string;
    strict: boolean;
    maxMetaEntrySize: number;
    filter: Exclude<TarOptions['filter'], undefined>;
    brotli?: TarOptions['brotli'];
    writable: true;
    readable: false;
    [QUEUE]: Yallist<ReadEntry | [string | symbol, any, any]>;
    [BUFFER]?: Buffer;
    [READENTRY]?: ReadEntry;
    [WRITEENTRY]?: ReadEntry;
    [STATE]: State;
    [META]: string;
    [EX]?: Pax;
    [GEX]?: Pax;
    [ENDED]: boolean;
    [UNZIP]?: false | Unzip | BrotliDecompress;
    [ABORTED]: boolean;
    [SAW_VALID_ENTRY]?: boolean;
    [SAW_NULL_BLOCK]: boolean;
    [SAW_EOF]: boolean;
    [WRITING]: boolean;
    [CONSUMING]: boolean;
    [EMITTEDEND]: boolean;
    constructor(opt?: TarOptions);
    warn(code: string, message: string | Error, data?: WarnData): void;
    [CONSUMEHEADER](chunk: Buffer, position: number): void;
    [CLOSESTREAM](): void;
    [PROCESSENTRY](entry?: ReadEntry | [string | symbol, any, any]): boolean;
    [NEXTENTRY](): void;
    [CONSUMEBODY](chunk: Buffer, position: number): number;
    [CONSUMEMETA](chunk: Buffer, position: number): number;
    [EMIT](ev: string | symbol, data?: any, extra?: any): void;
    [EMITMETA](entry: ReadEntry): void;
    abort(error: Error): void;
    write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
    write(str: string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): boolean;
    [BUFFERCONCAT](c: Buffer): void;
    [MAYBEEND](): void;
    [CONSUMECHUNK](chunk?: Buffer): void;
    [CONSUMECHUNKSUB](chunk: Buffer): void;
    end(cb?: () => void): this;
    end(data: string | Buffer, cb?: () => void): this;
    end(str: string, encoding?: BufferEncoding, cb?: () => void): this;
}
export {};
//# sourceMappingURL=parse.d.ts.map