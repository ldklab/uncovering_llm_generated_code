import { InternalOptions, Callback, Maybe, Optionals, Preserve, Message } from './types';
import type { TypedSchema, Defined, Thunk, Config, NotNull, ToggleDefault, _, MakePartial } from './util/types';
import type Reference from './Reference';
import Lazy from './Lazy';
import BaseSchema, { AnySchema, SchemaObjectDescription, SchemaSpec } from './schema';
import { ResolveOptions } from './Condition';
export declare type Assign<T extends {}, U extends {}> = {
    [P in keyof T]: P extends keyof U ? U[P] : T[P];
} & U;
export declare type AnyObject = Record<string, any>;
export declare type ObjectShape = Record<string, AnySchema | Reference | Lazy<any, any>>;
declare type FieldType<T extends AnySchema | Reference | Lazy<any, any>, F extends '__type' | '__outputType'> = T extends TypedSchema ? T[F] : T extends Reference ? unknown : never;
export declare type DefaultFromShape<Shape extends ObjectShape> = {
    [K in keyof Shape]: Shape[K] extends ObjectSchema<infer TShape> ? DefaultFromShape<TShape> : Shape[K] extends {
        getDefault: () => infer D;
    } ? Preserve<D, undefined> extends never ? Defined<D> : Preserve<D, undefined> : undefined;
};
export declare type TypeOfShape<Shape extends ObjectShape> = {
    [K in keyof Shape]: FieldType<Shape[K], '__type'>;
};
export declare type AssertsShape<S extends ObjectShape> = MakePartial<{
    [K in keyof S]: FieldType<S[K], '__outputType'>;
}> & {
    [k: string]: any;
};
export declare type PartialSchema<S extends ObjectShape> = {
    [K in keyof S]: S[K] extends BaseSchema ? ReturnType<S[K]['optional']> : S[K];
};
export declare type DeepPartialSchema<S extends ObjectShape> = {
    [K in keyof S]: S[K] extends ObjectSchema<any, any, any> ? ReturnType<S[K]['deepPartial']> : S[K] extends BaseSchema ? ReturnType<S[K]['optional']> : S[K];
};
export declare type ObjectSchemaSpec = SchemaSpec<any> & {
    noUnknown?: boolean;
};
export default class ObjectSchema<TShape extends ObjectShape, TConfig extends Config<any, any> = Config<AnyObject, 'd'>, TIn extends Maybe<AssertsShape<TShape>> = AssertsShape<TShape> | undefined> extends BaseSchema<TIn, TConfig> {
    fields: TShape;
    spec: ObjectSchemaSpec;
    private _sortErrors;
    private _nodes;
    private _excludedEdges;
    constructor(spec?: TShape);
    protected _typeCheck(value: any): value is NonNullable<TIn>;
    protected _cast(_value: any, options?: InternalOptions<TConfig['context']>): any;
    protected _validate(_value: any, opts: InternalOptions<TConfig["context"]> | undefined, callback: Callback): void;
    clone(spec?: ObjectSchemaSpec): this;
    concat<TOther extends ObjectSchema<any, any, any>>(schema: TOther): TOther extends ObjectSchema<infer S, infer C, infer IType> ? ObjectSchema<TShape & S, TConfig & C, AssertsShape<TShape & S> | Optionals<IType>> : never;
    concat(schema: this): this;
    protected _getDefault(): any;
    getDefaultFromShape(): _<DefaultFromShape<TShape>>;
    private setFields;
    shape<TNextShape extends ObjectShape>(additions: TNextShape, excludes?: [string, string][]): ObjectSchema<Assign<TShape, TNextShape>, TConfig, Extract<TIn, null | undefined> | AssertsShape<Assign<TShape, TNextShape>>>;
    partial(): ObjectSchema<PartialSchema<TShape>, TConfig, Extract<TIn, null | undefined> | AssertsShape<PartialSchema<TShape>>>;
    deepPartial(): ObjectSchema<DeepPartialSchema<TShape>, TConfig, Optionals<TIn> | undefined | AssertsShape<DeepPartialSchema<TShape>>>;
    pick<TKey extends keyof TShape>(keys: TKey[]): ObjectSchema<Pick<TShape, TKey>, TConfig, Extract<TIn, null | undefined> | AssertsShape<Pick<TShape, TKey>>>;
    omit<TKey extends keyof TShape>(keys: TKey[]): ObjectSchema<Pick<TShape, Exclude<keyof TShape, TKey>>, TConfig, Extract<TIn, null | undefined> | AssertsShape<Pick<TShape, Exclude<keyof TShape, TKey>>>>;
    from(from: string, to: keyof TShape, alias?: boolean): this;
    noUnknown(noAllow?: boolean, message?: Message<any>): this;
    unknown(allow?: boolean, message?: Message<any>): this;
    transformKeys(fn: (key: string) => string): this;
    camelCase(): this;
    snakeCase(): this;
    constantCase(): this;
    describe(options?: ResolveOptions<TConfig['context']>): SchemaObjectDescription;
}
export declare function create<TShape extends ObjectShape = {}>(spec?: TShape): ObjectSchema<TShape, Config<Record<string, any>, "d">, AssertsShape<TShape> | undefined>;
export declare namespace create {
    var prototype: ObjectSchema<any, any, any>;
}
export default interface ObjectSchema<TShape extends ObjectShape, TConfig extends Config<any, any> = Config<AnyObject, 'd'>, TIn extends Maybe<AssertsShape<TShape>> = AssertsShape<TShape> | undefined> extends BaseSchema<TIn, TConfig> {
    default<D extends Maybe<AnyObject>>(def: Thunk<D>): ObjectSchema<TShape, ToggleDefault<TConfig, D>, TIn>;
    defined(msg?: Message): ObjectSchema<TShape, TConfig, Defined<TIn>>;
    optional(): ObjectSchema<TShape, TConfig, TIn | undefined>;
    required(msg?: Message): ObjectSchema<TShape, TConfig, NonNullable<TIn>>;
    notRequired(): ObjectSchema<TShape, TConfig, Maybe<TIn>>;
    nullable(isNullable?: true): ObjectSchema<TShape, TConfig, TIn | null>;
    nullable(isNullable: false): ObjectSchema<TShape, TConfig, NotNull<TIn>>;
}
export {};
