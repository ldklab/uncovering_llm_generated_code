import type { AnyObject, Maybe, Message } from './types';
import type Reference from './Reference';
import type { AnyConfig, Config, Defined, MergeConfig, NotNull, SetFlag, Thunk, ToggleDefault } from './util/types';
import BaseSchema from './schema';
export declare function create(): NumberSchema;
export declare namespace create {
    var prototype: NumberSchema<any, any>;
}
export declare function create<T extends number, TContext = AnyObject>(): NumberSchema<T | undefined, Config<TContext>>;
export declare namespace create {
    var prototype: NumberSchema<any, any>;
}
export default class NumberSchema<TType extends Maybe<number> = number | undefined, TConfig extends Config<any, any> = Config> extends BaseSchema<TType, TConfig> {
    constructor();
    protected _typeCheck(value: any): value is NonNullable<TType>;
    min(min: number | Reference<number>, message?: Message<{
        min: number;
    }>): this;
    max(max: number | Reference<number>, message?: Message<{
        max: number;
    }>): this;
    lessThan(less: number | Reference<number>, message?: Message<{
        less: number;
    }>): this;
    moreThan(more: number | Reference<number>, message?: Message<{
        more: number;
    }>): this;
    positive(msg?: Message<{
        more: number;
    }>): this;
    negative(msg?: Message<{
        less: number;
    }>): this;
    integer(message?: Message<any>): this;
    truncate(): this;
    round(method: 'ceil' | 'floor' | 'round' | 'trunc'): this;
}
export default interface NumberSchema<TType extends Maybe<number> = number | undefined, TConfig extends Config<any, any> = Config> extends BaseSchema<TType, TConfig> {
    strip(): NumberSchema<TType, SetFlag<TConfig, 's'>>;
    default<D extends Maybe<TType>>(def: Thunk<D>): NumberSchema<TType, ToggleDefault<TConfig, D>>;
    concat<T extends Maybe<number>, C extends AnyConfig>(schema: NumberSchema<T, C>): NumberSchema<NonNullable<TType> | T, MergeConfig<TConfig, C>>;
    concat(schema: this): this;
    defined(msg?: Message): NumberSchema<Defined<TType>, TConfig>;
    optional(): NumberSchema<TType | undefined, TConfig>;
    required(msg?: Message): NumberSchema<NonNullable<TType>, TConfig>;
    notRequired(): NumberSchema<Maybe<TType>, TConfig>;
    nullable(msg?: Message): NumberSchema<TType | null, TConfig>;
    nonNullable(): NumberSchema<NotNull<TType>, TConfig>;
}
