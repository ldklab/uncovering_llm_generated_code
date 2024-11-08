import { ConditionOptions, ResolveOptions } from './Condition';
import { TestFunction, Test, TestConfig } from './util/createValidation';
import { ValidateOptions, TransformFunction, Message, Callback, InternalOptions, Maybe, ExtraParams, Preserve } from './types';
import ReferenceSet from './util/ReferenceSet';
import Reference from './Reference';
import { Config, Defined, Flags, SetFlag, Thunk, _ } from './util/types';
export { Config };
export declare type ConfigOf<T> = T extends AnySchema<any, infer C> ? C : never;
export declare type ContextOf<T> = ConfigOf<T>['context'];
export declare type FlagsOf<T> = T extends AnySchema ? T['__flags'] : never;
export declare type HasFlag<T, F extends Flags> = F extends FlagsOf<T> ? true : never;
export declare type ResolveFlags<T, F extends Flags> = Preserve<F, 'd'> extends never ? T : Defined<T>;
export declare type SchemaSpec<TDefault> = {
    nullable: boolean;
    optional: boolean;
    default?: TDefault | (() => TDefault);
    abortEarly?: boolean;
    strip?: boolean;
    strict?: boolean;
    recursive?: boolean;
    label?: string | undefined;
    meta?: any;
};
export declare type SchemaOptions<TDefault> = {
    type?: string;
    spec?: SchemaSpec<TDefault>;
};
export declare type AnySchema<TType = any, C extends Config = any> = BaseSchema<TType, C>;
export interface CastOptions<C = {}> {
    parent?: any;
    context?: C;
    assert?: boolean;
    stripUnknown?: boolean;
    path?: string;
}
export interface SchemaRefDescription {
    type: 'ref';
    key: string;
}
export declare type Cast<T, D> = T extends undefined ? D extends undefined ? T : Defined<T> : T;
export interface SchemaInnerTypeDescription extends SchemaDescription {
    innerType?: SchemaFieldDescription;
}
export interface SchemaObjectDescription extends SchemaDescription {
    fields: Record<string, SchemaFieldDescription>;
}
export interface SchemaLazyDescription {
    type: string;
    label?: string;
    meta: object | undefined;
}
export declare type SchemaFieldDescription = SchemaDescription | SchemaRefDescription | SchemaObjectDescription | SchemaInnerTypeDescription | SchemaLazyDescription;
export interface SchemaDescription {
    type: string;
    label?: string;
    meta: object | undefined;
    oneOf: unknown[];
    notOneOf: unknown[];
    nullable: boolean;
    optional: boolean;
    tests: Array<{
        name?: string;
        params: ExtraParams | undefined;
    }>;
}
export default abstract class BaseSchema<TType = any, TConfig extends Config<any, any> = Config> {
    readonly type: string;
    readonly __type: TType;
    readonly __outputType: ResolveFlags<TType, TConfig['flags']>;
    readonly __flags: TConfig['flags'];
    readonly __isYupSchema__: boolean;
    readonly deps: readonly string[];
    tests: Test[];
    transforms: TransformFunction<AnySchema>[];
    private conditions;
    private _mutate?;
    private internalTests;
    protected _whitelist: ReferenceSet;
    protected _blacklist: ReferenceSet;
    protected exclusiveTests: Record<string, boolean>;
    spec: SchemaSpec<any>;
    constructor(options?: SchemaOptions<any>);
    get _type(): string;
    protected _typeCheck(_value: any): _value is NonNullable<TType>;
    clone(spec?: Partial<SchemaSpec<any>>): this;
    label(label: string): this;
    meta(): Record<string, unknown> | undefined;
    meta(obj: Record<string, unknown>): this;
    withMutation<T>(fn: (schema: this) => T): T;
    concat(schema: this): this;
    concat(schema: AnySchema): AnySchema;
    isType(v: unknown): v is TType;
    resolve(options: ResolveOptions): this;
    /**
     *
     * @param {*} value
     * @param {Object} options
     * @param {*=} options.parent
     * @param {*=} options.context
     */
    cast(value: any, options?: CastOptions<TConfig['context']>): _<this['__outputType']>;
    protected _cast(rawValue: any, _options: CastOptions<TConfig['context']>): any;
    protected _validate(_value: any, options: InternalOptions<TConfig["context"]> | undefined, cb: Callback): void;
    validate(value: any, options?: ValidateOptions<TConfig['context']>): Promise<_<this['__outputType']>>;
    validateSync(value: any, options?: ValidateOptions<TConfig['context']>): _<this['__outputType']>;
    isValid(value: any, options?: ValidateOptions<TConfig['context']>): Promise<boolean>;
    isValidSync(value: any, options?: ValidateOptions<TConfig['context']>): value is this['__outputType'];
    protected _getDefault(): any;
    getDefault(options?: ResolveOptions): Preserve<TConfig['flags'], 'd'> extends never ? undefined : Defined<TType>;
    default(def: Thunk<any>): any;
    strict(isStrict?: boolean): this;
    protected _isPresent(value: any): boolean;
    protected nullability(nullable: boolean, message?: Message<any>): this;
    protected optionality(optional: boolean, message?: Message<any>): this;
    optional(): any;
    defined(message?: Message<any>): any;
    nullable(): any;
    nonNullable(message?: Message<any>): any;
    required(message?: Message<any>): any;
    notRequired(): any;
    transform(fn: TransformFunction<this>): this;
    /**
     * Adds a test function to the schema's queue of tests.
     * tests can be exclusive or non-exclusive.
     *
     * - exclusive tests, will replace any existing tests of the same name.
     * - non-exclusive: can be stacked
     *
     * If a non-exclusive test is added to a schema with an exclusive test of the same name
     * the exclusive test is removed and further tests of the same name will be stacked.
     *
     * If an exclusive test is added to a schema with non-exclusive tests of the same name
     * the previous tests are removed and further tests of the same name will replace each other.
     */
    test(options: TestConfig<this['__outputType'], TConfig['context']>): this;
    test(test: TestFunction<this['__outputType'], TConfig['context']>): this;
    test(name: string, test: TestFunction<this['__outputType'], TConfig['context']>): this;
    test(name: string, message: Message, test: TestFunction<this['__outputType'], TConfig['context']>): this;
    when(options: ConditionOptions<this>): this;
    when(keys: string | string[], options: ConditionOptions<this>): this;
    typeError(message: Message): this;
    oneOf<U extends TType>(enums: ReadonlyArray<U | Reference>, message?: Message<{
        values: any;
    }>): any;
    notOneOf<U extends TType>(enums: Array<Maybe<U> | Reference>, message?: Message<{
        values: any;
    }>): this;
    strip(strip?: boolean): BaseSchema<TType, SetFlag<TConfig, 's'>>;
    /**
     * Return a serialized description of the schema including validations, flags, types etc.
     *
     * @param options Provide any needed context for resolving runtime schema alterations (lazy, when conditions, etc).
     */
    describe(options?: ResolveOptions<TConfig['context']>): SchemaDescription;
}
export default interface BaseSchema<TType = any, TConfig extends Config<any, any> = Config> {
    validateAt(path: string, value: any, options?: ValidateOptions<TConfig['context']>): Promise<any>;
    validateSyncAt(path: string, value: any, options?: ValidateOptions<TConfig['context']>): any;
    equals: BaseSchema['oneOf'];
    is: BaseSchema['oneOf'];
    not: BaseSchema['notOneOf'];
    nope: BaseSchema['notOneOf'];
}
