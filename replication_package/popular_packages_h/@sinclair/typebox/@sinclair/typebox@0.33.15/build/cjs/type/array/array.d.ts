import { Ensure } from '../helpers/index';
import type { SchemaOptions, TSchema } from '../schema/index';
import type { Static } from '../static/index';
import { Kind } from '../symbols/index';
export interface ArrayOptions extends SchemaOptions {
    /** The minimum number of items in this array */
    minItems?: number;
    /** The maximum number of items in this array */
    maxItems?: number;
    /** Should this schema contain unique items */
    uniqueItems?: boolean;
    /** A schema for which some elements should match */
    contains?: TSchema;
    /** A minimum number of contains schema matches */
    minContains?: number;
    /** A maximum number of contains schema matches */
    maxContains?: number;
}
type ArrayStatic<T extends TSchema, P extends unknown[]> = Ensure<Static<T, P>[]>;
export interface TArray<T extends TSchema = TSchema> extends TSchema, ArrayOptions {
    [Kind]: 'Array';
    static: ArrayStatic<T, this['params']>;
    type: 'array';
    items: T;
}
/** `[Json]` Creates an Array type */
export declare function Array<T extends TSchema>(items: T, options?: ArrayOptions): TArray<T>;
export {};