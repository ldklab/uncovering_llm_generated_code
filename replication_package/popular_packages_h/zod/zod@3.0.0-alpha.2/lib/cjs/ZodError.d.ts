import { ZodParsedType } from "./parser";
export declare const ZodIssueCode: {
    invalid_type: "invalid_type";
    nonempty_array_is_empty: "nonempty_array_is_empty";
    custom: "custom";
    invalid_union: "invalid_union";
    invalid_literal_value: "invalid_literal_value";
    invalid_enum_value: "invalid_enum_value";
    unrecognized_keys: "unrecognized_keys";
    invalid_arguments: "invalid_arguments";
    invalid_return_type: "invalid_return_type";
    invalid_date: "invalid_date";
    invalid_string: "invalid_string";
    too_small: "too_small";
    too_big: "too_big";
    invalid_intersection_types: "invalid_intersection_types";
};
export declare type ZodIssueCode = keyof typeof ZodIssueCode;
export declare type ZodIssueBase = {
    path: (string | number)[];
    message?: string;
};
export interface ZodInvalidTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_type;
    expected: ZodParsedType;
    received: ZodParsedType;
}
export interface ZodNonEmptyArrayIsEmptyIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.nonempty_array_is_empty;
}
export interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.unrecognized_keys;
    keys: string[];
}
export interface ZodInvalidUnionIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_union;
    unionErrors: ZodError[];
}
export interface ZodInvalidLiteralValueIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_literal_value;
    expected: string | number | boolean;
}
export interface ZodInvalidEnumValueIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_enum_value;
    options: (string | number)[];
}
export interface ZodInvalidArgumentsIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_arguments;
    argumentsError: ZodError;
}
export interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_return_type;
    returnTypeError: ZodError;
}
export interface ZodInvalidDateIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_date;
}
export declare type StringValidation = "email" | "url" | "uuid" | "regex";
export interface ZodInvalidStringIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_string;
    validation: StringValidation;
}
export interface ZodTooSmallIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_small;
    minimum: number;
    inclusive: boolean;
    type: "array" | "string" | "number";
}
export interface ZodTooBigIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_big;
    maximum: number;
    inclusive: boolean;
    type: "array" | "string" | "number";
}
export interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_intersection_types;
}
export interface ZodCustomIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params?: {
        [k: string]: any;
    };
}
export declare type ZodIssueOptionalMessage = ZodInvalidTypeIssue | ZodNonEmptyArrayIsEmptyIssue | ZodUnrecognizedKeysIssue | ZodInvalidUnionIssue | ZodInvalidLiteralValueIssue | ZodInvalidEnumValueIssue | ZodInvalidArgumentsIssue | ZodInvalidReturnTypeIssue | ZodInvalidDateIssue | ZodInvalidStringIssue | ZodTooSmallIssue | ZodTooBigIssue | ZodInvalidIntersectionTypesIssue | ZodCustomIssue;
export declare type ZodIssue = ZodIssueOptionalMessage & {
    message: string;
};
export declare const quotelessJson: (obj: any) => string;
export declare class ZodError extends Error {
    issues: ZodIssue[];
    get errors(): ZodIssue[];
    constructor(issues: ZodIssue[]);
    static create: (issues: ZodIssue[]) => ZodError;
    get message(): string;
    get isEmpty(): boolean;
    addIssue: (sub: ZodIssue) => void;
    addIssues: (subs?: ZodIssue[]) => void;
    flatten: () => {
        formErrors: string[];
        fieldErrors: {
            [k: string]: string[];
        };
    };
    get formErrors(): {
        formErrors: string[];
        fieldErrors: {
            [k: string]: string[];
        };
    };
}
