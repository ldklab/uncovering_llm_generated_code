import type { AnyObject, Preserve } from '../types';
export declare type Defined<T> = T extends undefined ? never : T;
export declare type NotNull<T> = T extends null ? never : T;
export declare type TypedSchema = {
    __type: any;
    __outputType: any;
};
export declare type TypeOf<TSchema extends TypedSchema> = TSchema['__type'];
export declare type Asserts<TSchema extends TypedSchema> = TSchema['__outputType'];
export declare type Thunk<T> = T | (() => T);
export declare type If<T, Y, N> = Exclude<T, undefined> extends never ? Y : N;
export declare type _<T> = T extends {} ? {
    [k in keyof T]: _<T[k]>;
} : T;
declare type OptionalKeys<T extends {}> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];
declare type RequiredKeys<T extends object> = Exclude<keyof T, OptionalKeys<T>>;
export declare type MakePartial<T extends object> = {
    [k in OptionalKeys<T>]?: T[k];
} & {
    [k in RequiredKeys<T>]: T[k];
};
export declare type Flags = 's' | 'd' | '';
export interface Config<C = AnyObject, F extends Flags = ''> {
    context: C;
    flags: F;
}
export declare type AnyConfig = Config<any, any>;
export declare type MergeConfig<T extends AnyConfig, U extends AnyConfig> = Config<T['context'] & U['context'], T['flags'] | U['flags']>;
export declare type SetFlag<C extends AnyConfig, F extends Flags> = C extends Config<infer Context, infer Old> ? Config<Context, Exclude<Old, ''> | F> : never;
export declare type UnsetFlag<C extends AnyConfig, F extends Flags> = C extends Config<infer Context, infer Old> ? Exclude<Old, F> extends never ? Config<Context, ''> : Config<Context, Exclude<Old, F>> : never;
export declare type ToggleDefault<C extends AnyConfig, D> = Preserve<D, undefined> extends never ? SetFlag<C, 'd'> : UnsetFlag<C, 'd'>;
export {};
