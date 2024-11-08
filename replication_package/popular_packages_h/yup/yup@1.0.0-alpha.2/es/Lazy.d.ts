import type { Callback, ValidateOptions } from './types';
import type { ResolveOptions } from './Condition';
import type { AnySchema, CastOptions, ConfigOf, SchemaFieldDescription, SchemaLazyDescription } from './schema';
import { Config, TypedSchema, TypeOf } from './util/types';
export declare type LazyBuilder<T extends AnySchema = any> = (value: any, options: ResolveOptions) => T;
export declare function create<T extends AnySchema>(builder: LazyBuilder<T>): Lazy<T, ConfigOf<T>>;
export declare type LazyReturnValue<T> = T extends Lazy<infer TSchema> ? TSchema : never;
export declare type LazyType<T> = LazyReturnValue<T> extends TypedSchema ? TypeOf<LazyReturnValue<T>> : never;
export interface LazySpec {
    meta: Record<string, unknown> | undefined;
}
declare class Lazy<T extends AnySchema, TConfig extends Config = ConfigOf<T>> implements TypedSchema {
    private builder;
    type: "lazy";
    __isYupSchema__: boolean;
    readonly __type: T['__type'];
    readonly __outputType: T['__outputType'];
    spec: LazySpec;
    constructor(builder: LazyBuilder<T>);
    clone(): Lazy<T, TConfig>;
    private _resolve;
    resolve(options: ResolveOptions<TConfig['context']>): T;
    cast(value: any, options?: CastOptions<TConfig['context']>): T['__type'];
    validate(value: any, options?: ValidateOptions, maybeCb?: Callback): T['__outputType'];
    validateSync(value: any, options?: ValidateOptions<TConfig['context']>): T['__outputType'];
    validateAt(path: string, value: any, options?: ValidateOptions<TConfig['context']>): Promise<any>;
    validateSyncAt(path: string, value: any, options?: ValidateOptions<TConfig['context']>): any;
    isValid(value: any, options?: ValidateOptions<TConfig['context']>): Promise<boolean>;
    isValidSync(value: any, options?: ValidateOptions<TConfig['context']>): boolean;
    describe(options?: ResolveOptions<TConfig['context']>): SchemaLazyDescription | SchemaFieldDescription;
    meta(): Record<string, unknown> | undefined;
    meta(obj: Record<string, unknown>): Lazy<T, TConfig>;
}
export default Lazy;
