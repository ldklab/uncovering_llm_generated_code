import { ZodErrorMap } from "./defaultErrorMap";
import { util } from "./helpers/util";
import * as z from "./types/base";
import { ZodError, ZodIssueOptionalMessage } from "./ZodError";
export declare const getParsedType: (data: any) => "number" | "string" | "nan" | "integer" | "boolean" | "date" | "bigint" | "symbol" | "function" | "undefined" | "null" | "array" | "object" | "unknown" | "promise" | "void" | "never" | "map";
export declare const ZodParsedType: {
    number: "number";
    string: "string";
    nan: "nan";
    integer: "integer";
    boolean: "boolean";
    date: "date";
    bigint: "bigint";
    symbol: "symbol";
    function: "function";
    undefined: "undefined";
    null: "null";
    array: "array";
    object: "object";
    unknown: "unknown";
    promise: "promise";
    void: "void";
    never: "never";
    map: "map";
};
export declare type ZodParsedType = keyof typeof ZodParsedType;
declare type stripPath<T extends object> = T extends any ? util.OmitKeys<T, "path"> : never;
export declare type MakeErrorData = stripPath<ZodIssueOptionalMessage> & {
    path?: (string | number)[];
};
export declare type ParseParams = {
    seen?: {
        schema: z.ZodType<any>;
        objects: {
            input: any;
            error?: ZodError;
            output: any;
        }[];
    }[];
    path?: (string | number)[];
    errorMap?: ZodErrorMap;
    async?: boolean;
    runAsyncValidationsInSeries?: boolean;
};
export declare const ZodParser: (schema: z.ZodType<any, z.ZodTypeDef, any>) => (data: any, baseParams?: ParseParams) => any;
export {};
