import { ZodArray, ZodCustomIssue, ZodError, ZodOptional, ZodTransformer } from "../index";
import { MakeErrorData, ParseParams } from "../parser";
import { ZodNullableType } from "./nullable";
import { ZodOptionalType } from "./optional";
export declare enum ZodTypes {
    string = "string",
    number = "number",
    bigint = "bigint",
    boolean = "boolean",
    date = "date",
    undefined = "undefined",
    null = "null",
    array = "array",
    object = "object",
    union = "union",
    intersection = "intersection",
    tuple = "tuple",
    record = "record",
    map = "map",
    function = "function",
    lazy = "lazy",
    literal = "literal",
    enum = "enum",
    nativeEnum = "nativeEnum",
    promise = "promise",
    any = "any",
    unknown = "unknown",
    never = "never",
    void = "void",
    transformer = "transformer",
    optional = "optional",
    nullable = "nullable"
}
export declare type ZodTypeAny = ZodType<any, any, any>;
export declare type ZodRawShape = {
    [k: string]: ZodTypeAny;
};
export declare type RefinementCtx = {
    addIssue: (arg: MakeErrorData) => void;
    path: (string | number)[];
};
declare type InternalCheck<T> = {
    type: "check";
    check: (arg: T, ctx: RefinementCtx) => any;
};
declare type Mod<T> = {
    type: "mod";
    mod: (arg: T) => any;
};
declare type Effect<T> = InternalCheck<T> | Mod<T>;
export interface ZodTypeDef {
    t: ZodTypes;
    effects?: Effect<any>[];
    accepts?: ZodType<any, any>;
}
export declare type TypeOf<T extends ZodType<any>> = T["_output"];
export declare type input<T extends ZodType<any>> = T["_input"];
export declare type output<T extends ZodType<any>> = T["_output"];
export declare type infer<T extends ZodType<any>> = T["_output"];
export declare abstract class ZodType<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _type: Output;
    readonly _output: Output;
    readonly _def: Def;
    readonly _input: Input;
    parse: (x: unknown, params?: ParseParams) => Output;
    safeParse: (x: unknown, params?: ParseParams) => {
        success: true;
        data: Output;
    } | {
        success: false;
        error: ZodError;
    };
    parseAsync: (x: unknown, params?: ParseParams) => Promise<Output>;
    safeParseAsync: (x: unknown, params?: ParseParams) => Promise<{
        success: true;
        data: Output;
    } | {
        success: false;
        error: ZodError;
    }>;
    spa: (x: unknown, params?: ParseParams | undefined) => Promise<{
        success: true;
        data: Output;
    } | {
        success: false;
        error: ZodError;
    }>;
    is(u: Input): u is Input;
    check(u: unknown): u is Input;
    refine: <Func extends (arg: Output) => any>(check: Func, message?: string | Partial<Pick<ZodCustomIssue, "params" | "path" | "message">> | ((arg: Output) => Partial<Pick<ZodCustomIssue, "params" | "path" | "message">>)) => this;
    refinement: (check: (arg: Output) => any, refinementData: (Pick<import("..").ZodInvalidTypeIssue, "code" | "message" | "expected" | "received"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodNonEmptyArrayIsEmptyIssue, "code" | "message"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodUnrecognizedKeysIssue, "keys" | "code" | "message"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidUnionIssue, "code" | "message" | "unionErrors"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidLiteralValueIssue, "code" | "message" | "expected"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidEnumValueIssue, "code" | "message" | "options"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidArgumentsIssue, "code" | "message" | "argumentsError"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidReturnTypeIssue, "code" | "message" | "returnTypeError"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidDateIssue, "code" | "message"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidStringIssue, "code" | "message" | "validation"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodTooSmallIssue, "code" | "message" | "minimum" | "inclusive" | "type"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodTooBigIssue, "code" | "message" | "inclusive" | "type" | "maximum"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<import("..").ZodInvalidIntersectionTypesIssue, "code" | "message"> & {
        path?: (string | number)[] | undefined;
    }) | (Pick<ZodCustomIssue, "code" | "params" | "message"> & {
        path?: (string | number)[] | undefined;
    }) | ((arg: Output, ctx: RefinementCtx) => MakeErrorData)) => this;
    _refinement: (refinement: InternalCheck<Output>["check"]) => this;
    constructor(def: Def);
    abstract toJSON: () => object;
    optional: () => ZodOptionalType<this>;
    or: () => ZodOptionalType<this>;
    nullable: () => ZodNullableType<this>;
    array: () => ZodArray<this>;
    transform: <Out, This extends this>(transformer: (arg: Output) => Out | Promise<Out>) => This extends ZodTransformer<infer T, any> ? ZodTransformer<T, Out> : ZodTransformer<This, Out>;
    prependMod: <Out>(mod: (arg: Output) => Out | Promise<Out>) => ZodType<Out, Def, Input>;
    clearEffects: <Out>() => ZodType<Out, Def, Input>;
    setEffects: <Out>(effects: Effect<any>[]) => ZodType<Out, Def, Input>;
    default<T extends Input, This extends this = this>(def: T): ZodTransformer<ZodOptional<This>, Input>;
    default<T extends (arg: this) => Input, This extends this = this>(def: T): ZodTransformer<ZodOptional<This>, Input>;
    isOptional: () => boolean;
    isNullable: () => boolean;
}
export {};
