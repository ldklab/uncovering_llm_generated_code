import { ZodRawShape } from "../types/base";
import { AnyZodObject, ZodObject } from "../types/object";
export declare namespace objectUtil {
    export type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
        [k in Exclude<keyof U, keyof V>]: U[k];
    } & V;
    type optionalKeys<T extends object> = {
        [k in keyof T]: undefined extends T[k] ? k : never;
    }[keyof T];
    type requiredKeys<T extends object> = Exclude<keyof T, optionalKeys<T>>;
    export type addQuestionMarks<T extends object> = {
        [k in optionalKeys<T>]?: T[k];
    } & {
        [k in requiredKeys<T>]: T[k];
    };
    export type identity<T> = T;
    export type flatten<T extends object> = identity<{
        [k in keyof T]: T[k];
    }>;
    export type NoNeverKeys<T extends ZodRawShape> = {
        [k in keyof T]: [T[k]] extends [never] ? never : k;
    }[keyof T];
    export type NoNever<T extends ZodRawShape> = identity<{
        [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }>;
    export const mergeShapes: <U extends ZodRawShape, T extends ZodRawShape>(first: U, second: T) => T & U;
    export const mergeObjects: <First extends AnyZodObject>(first: First) => <Second extends AnyZodObject>(second: Second) => ZodObject<First["_shape"] & Second["_shape"], First["_unknownKeys"], First["_catchall"], import("../types/object").objectOutputType<First["_shape"] & Second["_shape"], First["_catchall"]>, import("../types/object").objectInputType<First["_shape"] & Second["_shape"], First["_catchall"]>>;
    export {};
}
