import type { AnyObject, InternalOptions, Callback, Message, Maybe } from './types';
import type Reference from './Reference';
import { Asserts, Config, Defined, NotNull, SetFlag, Thunk, ToggleDefault } from './util/types';
import BaseSchema, { AnySchema, SchemaInnerTypeDescription, SchemaSpec } from './schema';
import Lazy from './Lazy';
import { ResolveOptions } from './Condition';
export declare type RejectorFn = (value: any, index: number, array: any[]) => boolean;
export declare function create<C extends AnyObject = AnyObject, T extends AnySchema | Lazy<any, any> = AnySchema>(type?: T): ArraySchema<T, Config<C, "">, Asserts<T>[] | undefined>;
export declare namespace create {
    var prototype: ArraySchema<any, any, any>;
}
export default class ArraySchema<T extends AnySchema | Lazy<any, any>, C extends Config<any, any> = Config, TIn extends Maybe<Asserts<T>[]> = Asserts<T>[] | undefined> extends BaseSchema<TIn, C> {
    innerType?: T;
    constructor(type?: T);
    protected _typeCheck(v: any): v is NonNullable<TIn>;
    private get _subType();
    protected _cast(_value: any, _opts: InternalOptions<C>): any;
    protected _validate(_value: any, options: InternalOptions<C> | undefined, callback: Callback): void;
    clone(spec?: SchemaSpec<any>): this;
    concat<TOther extends ArraySchema<any, any, any>>(schema: TOther): TOther;
    concat(schema: any): any;
    of<TInner extends AnySchema>(schema: TInner): ArraySchema<TInner>;
    length(length: number | Reference<number>, message?: Message<{
        length: number;
    }>): this;
    min(min: number | Reference<number>, message?: Message<{
        min: number;
    }>): this;
    max(max: number | Reference<number>, message?: Message<{
        max: number;
    }>): this;
    ensure(): ArraySchema<T, SetFlag<C, 'd'>, NonNullable<TIn>>;
    compact(rejector?: RejectorFn): this;
    describe(options?: ResolveOptions<C['context']>): SchemaInnerTypeDescription;
}
export default interface ArraySchema<T extends AnySchema | Lazy<any, any>, C extends Config<any, any> = Config, TIn extends Maybe<Asserts<T>[]> = Asserts<T>[] | undefined> extends BaseSchema<TIn, C> {
    default<D extends Maybe<TIn>>(def: Thunk<D>): ArraySchema<T, ToggleDefault<C, D>, TIn>;
    defined(msg?: Message): ArraySchema<T, C, Defined<TIn>>;
    optional(): ArraySchema<T, C, TIn | undefined>;
    required(msg?: Message): ArraySchema<T, C, NonNullable<TIn>>;
    notRequired(): ArraySchema<T, C, Maybe<TIn>>;
    nullable(isNullable?: true): ArraySchema<T, C, TIn | null>;
    nullable(isNullable: false): ArraySchema<T, C, NotNull<TIn>>;
}
