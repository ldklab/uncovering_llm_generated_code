type EventListener = (...arguments_: any[]) => void;
declare class EventManager {
    _eventListeners: Map<string, EventListener[]>;
    _maxListeners: number;
    constructor();
    maxListeners(): number;
    addListener(event: string, listener: EventListener): void;
    on(event: string, listener: EventListener): void;
    removeListener(event: string, listener: EventListener): void;
    off(event: string, listener: EventListener): void;
    emit(event: string, ...arguments_: any[]): void;
    listeners(event: string): EventListener[];
    removeAllListeners(event?: string): void;
    setMaxListeners(n: number): void;
}

type HookHandler = (...arguments_: any[]) => void;
declare class HooksManager extends EventManager {
    _hookHandlers: Map<string, HookHandler[]>;
    constructor();
    addHandler(event: string, handler: HookHandler): void;
    removeHandler(event: string, handler: HookHandler): void;
    trigger(event: string, data: any): void;
    get handlers(): Map<string, HookHandler[]>;
}

declare class StatsManager extends EventManager {
    enabled: boolean;
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    constructor(enabled?: boolean);
    hit(): void;
    miss(): void;
    set(): void;
    delete(): void;
    reset(): void;
}

type DeserializedData<Value> = {
    value?: Value;
    expires?: number | null;
};
interface CompressionAdapter {
    compress(value: any, options?: any): Promise<any>;
    decompress(value: any, options?: any): Promise<any>;
    serialize<Value>(data: DeserializedData<Value>): Promise<string> | string;
    deserialize<Value>(data: string): Promise<DeserializedData<Value> | undefined> | DeserializedData<Value> | undefined;
}
declare enum KeyvHooks {
    PRE_SET = "preSet",
    POST_SET = "postSet",
    PRE_GET = "preGet",
    POST_GET = "postGet",
    PRE_GET_MANY = "preGetMany",
    POST_GET_MANY = "postGetMany",
    PRE_DELETE = "preDelete",
    POST_DELETE = "postDelete"
}
type StoredDataNoRaw<Value> = Value | undefined;
type StoredDataRaw<Value> = DeserializedData<Value> | undefined;
type StoredData<Value> = StoredDataNoRaw<Value> | StoredDataRaw<Value>;
interface IEventEmitter {
    on(event: string, listener: (...arguments_: any[]) => void): this;
}
interface KeyvStoreAdapter extends IEventEmitter {
    opts: any;
    namespace?: string;
    get<Value>(key: string): Promise<StoredData<Value> | undefined>;
    set(key: string, value: any, ttl?: number): any;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has?(key: string): Promise<boolean>;
    getMany?<Value>(keys: string[]): Promise<Array<StoredData<Value | undefined>>>;
    disconnect?(): Promise<void>;
    deleteMany?(key: string[]): Promise<boolean>;
    iterator?<Value>(namespace?: string): AsyncGenerator<Array<string | Awaited<Value> | undefined>, void>;
}
type KeyvOptions = {
    /** Emit errors */
    emitErrors?: boolean;
    /** Namespace for the current instance. */
    namespace?: string;
    /** A custom serialization function. */
    serialize?: CompressionAdapter['serialize'];
    /** A custom deserialization function. */
    deserialize?: CompressionAdapter['deserialize'];
    /** The storage adapter instance to be used by Keyv. */
    store?: KeyvStoreAdapter | Map<any, any> | any;
    /** Default TTL. Can be overridden by specifying a TTL on `.set()`. */
    ttl?: number;
    /** Enable compression option **/
    compression?: CompressionAdapter | any;
    /** Enable or disable statistics (default is false) */
    stats?: boolean;
};
type KeyvOptions_ = Omit<KeyvOptions, 'store'> & {
    store: KeyvStoreAdapter | Map<any, any> & KeyvStoreAdapter;
};
type IteratorFunction = (argument: any) => AsyncGenerator<any, void>;
declare class Keyv<GenericValue = any> extends EventManager {
    opts: KeyvOptions_;
    iterator?: IteratorFunction;
    hooks: HooksManager;
    stats: StatsManager;
    constructor(store?: KeyvStoreAdapter | KeyvOptions | Map<any, any>, options?: Omit<KeyvOptions, 'store'>);
    constructor(options?: KeyvOptions);
    generateIterator(iterator: IteratorFunction): IteratorFunction;
    _checkIterableAdapter(): boolean;
    _getKeyPrefix(key: string): string;
    _getKeyPrefixArray(keys: string[]): string[];
    _getKeyUnprefix(key: string): string;
    _isValidStorageAdapter(store: KeyvStoreAdapter | any): boolean;
    get<Value = GenericValue>(key: string, options?: {
        raw: false;
    }): Promise<StoredDataNoRaw<Value>>;
    get<Value = GenericValue>(key: string, options?: {
        raw: true;
    }): Promise<StoredDataRaw<Value>>;
    get<Value = GenericValue>(key: string[], options?: {
        raw: false;
    }): Promise<Array<StoredDataNoRaw<Value>>>;
    get<Value = GenericValue>(key: string[], options?: {
        raw: true;
    }): Promise<Array<StoredDataRaw<Value>>>;
    set<Value = GenericValue>(key: string, value: Value, ttl?: number): Promise<boolean>;
    delete(key: string | string[]): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    disconnect(): Promise<void>;
}

export { type CompressionAdapter, type DeserializedData, type IEventEmitter, Keyv, KeyvHooks, type KeyvOptions, type KeyvStoreAdapter, type StoredData, type StoredDataNoRaw, type StoredDataRaw, Keyv as default };
