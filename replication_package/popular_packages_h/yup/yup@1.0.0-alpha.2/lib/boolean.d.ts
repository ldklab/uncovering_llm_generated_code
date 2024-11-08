import BaseSchema from './schema';
import type { AnyObject, Maybe, Message } from './types';
import type { Config, Defined, NotNull, Thunk, ToggleDefault } from './util/types';
export declare function create(): BooleanSchema;
export declare namespace create {
    var prototype: BooleanSchema<any, any>;
}
export declare function create<T extends boolean, TContext = AnyObject>(): BooleanSchema<T | undefined, Config<TContext>>;
export declare namespace create {
    var prototype: BooleanSchema<any, any>;
}
export default class BooleanSchema<TType extends Maybe<boolean> = boolean | undefined, TConfig extends Config<any, any> = Config> extends BaseSchema<TType, TConfig> {
    constructor();
    protected _typeCheck(v: any): v is NonNullable<TType>;
    isTrue(message?: string | Record<string | number | symbol, unknown> | ((params: any) => unknown) | undefined): BooleanSchema<TType | true, TConfig>;
    isFalse(message?: string | Record<string | number | symbol, unknown> | ((params: any) => unknown) | undefined): BooleanSchema<TType | false, TConfig>;
}
export default interface BooleanSchema<TType extends Maybe<boolean>, TConfig extends Config<any, any> = Config> extends BaseSchema<TType, TConfig> {
    default<D extends Maybe<TType>>(def: Thunk<D>): BooleanSchema<TType, ToggleDefault<TConfig, D>>;
    concat<TOther extends BooleanSchema<any, any>>(schema: TOther): TOther;
    defined(msg?: Message): BooleanSchema<Defined<TType>, TConfig>;
    optional(): BooleanSchema<TType | undefined, TConfig>;
    required(msg?: Message): BooleanSchema<NonNullable<TType>, TConfig>;
    notRequired(): BooleanSchema<Maybe<TType>, TConfig>;
    nullable(msg?: Message): BooleanSchema<TType | null, TConfig>;
    nonNullable(): BooleanSchema<NotNull<TType>, TConfig>;
}
