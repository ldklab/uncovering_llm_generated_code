import * as z from "./index";
export declare const crazySchema: z.ZodObject<{
    tuple: z.ZodTuple<[z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodOptional<z.ZodNullable<z.ZodBoolean>>, z.ZodOptional<z.ZodNullable<z.ZodNull>>, z.ZodOptional<z.ZodNullable<z.ZodUndefined>>, z.ZodOptional<z.ZodNullable<z.ZodLiteral<"1234">>>]>;
    merged: z.ZodObject<{
        k1: z.ZodOptional<z.ZodString>;
    } & {
        k1: z.ZodNullable<z.ZodString>;
        k2: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        k1: string;
        k2: number;
    }, {
        k1: string;
        k2: number;
    }>;
    union: import("./types/array").ZodNonEmptyArray<z.ZodUnion<[z.ZodLiteral<"asdf">, z.ZodLiteral<12>]>>;
    array: z.ZodArray<z.ZodNumber>;
    sumMinLength: z.ZodArray<z.ZodNumber>;
    intersection: z.ZodIntersection<z.ZodObject<{
        p1: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        p1?: string | undefined;
    }, {
        p1?: string | undefined;
    }>, z.ZodObject<{
        p1: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        p1?: number | undefined;
    }, {
        p1?: number | undefined;
    }>>;
    enum: z.ZodIntersection<z.ZodEnum<["zero", "one"]>, z.ZodEnum<["one", "two"]>>;
    nonstrict: z.ZodObject<{
        points: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, {
        points: number;
    }, {
        points: number;
    }>;
    numProm: z.ZodPromise<z.ZodNumber>;
    lenfun: z.ZodFunction<z.ZodTuple<[z.ZodString]>, z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    array: number[];
    nonstrict: {
        points: number;
    };
    tuple: [string | null | undefined, number | null | undefined, boolean | null | undefined, null | undefined, null | undefined, "1234" | null | undefined];
    merged: {
        k1: string;
        k2: number;
    };
    union: ["asdf" | 12, ...("asdf" | 12)[]];
    sumMinLength: number[];
    intersection: {
        p1?: string | undefined;
    } & {
        p1?: number | undefined;
    };
    enum: "one";
    numProm: Promise<number>;
    lenfun: (args_0: string) => boolean;
}, {
    array: number[];
    nonstrict: {
        points: number;
    };
    tuple: [string | null | undefined, number | null | undefined, boolean | null | undefined, null | undefined, null | undefined, "1234" | null | undefined];
    merged: {
        k1: string;
        k2: number;
    };
    union: ["asdf" | 12, ...("asdf" | 12)[]];
    sumMinLength: number[];
    intersection: {
        p1?: string | undefined;
    } & {
        p1?: number | undefined;
    };
    enum: "one";
    numProm: Promise<number>;
    lenfun: (args_0: string) => boolean;
}>;
export declare const asyncCrazySchema: z.ZodObject<{
    array: z.ZodArray<z.ZodNumber>;
    nonstrict: z.ZodObject<{
        points: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, {
        points: number;
    }, {
        points: number;
    }>;
    tuple: z.ZodTuple<[z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodOptional<z.ZodNullable<z.ZodBoolean>>, z.ZodOptional<z.ZodNullable<z.ZodNull>>, z.ZodOptional<z.ZodNullable<z.ZodUndefined>>, z.ZodOptional<z.ZodNullable<z.ZodLiteral<"1234">>>]>;
    merged: z.ZodObject<{
        k1: z.ZodOptional<z.ZodString>;
    } & {
        k1: z.ZodNullable<z.ZodString>;
        k2: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        k1: string;
        k2: number;
    }, {
        k1: string;
        k2: number;
    }>;
    union: import("./types/array").ZodNonEmptyArray<z.ZodUnion<[z.ZodLiteral<"asdf">, z.ZodLiteral<12>]>>;
    sumMinLength: z.ZodArray<z.ZodNumber>;
    intersection: z.ZodIntersection<z.ZodObject<{
        p1: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        p1?: string | undefined;
    }, {
        p1?: string | undefined;
    }>, z.ZodObject<{
        p1: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        p1?: number | undefined;
    }, {
        p1?: number | undefined;
    }>>;
    enum: z.ZodIntersection<z.ZodEnum<["zero", "one"]>, z.ZodEnum<["one", "two"]>>;
    numProm: z.ZodPromise<z.ZodNumber>;
    lenfun: z.ZodFunction<z.ZodTuple<[z.ZodString]>, z.ZodBoolean>;
} & {
    async_refine: z.ZodArray<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    array: number[];
    nonstrict: {
        points: number;
    };
    tuple: [string | null | undefined, number | null | undefined, boolean | null | undefined, null | undefined, null | undefined, "1234" | null | undefined];
    merged: {
        k1: string;
        k2: number;
    };
    union: ["asdf" | 12, ...("asdf" | 12)[]];
    sumMinLength: number[];
    intersection: {
        p1?: string | undefined;
    } & {
        p1?: number | undefined;
    };
    enum: "one";
    numProm: Promise<number>;
    lenfun: (args_0: string) => boolean;
    async_refine: number[];
}, {
    array: number[];
    nonstrict: {
        points: number;
    };
    tuple: [string | null | undefined, number | null | undefined, boolean | null | undefined, null | undefined, null | undefined, "1234" | null | undefined];
    merged: {
        k1: string;
        k2: number;
    };
    union: ["asdf" | 12, ...("asdf" | 12)[]];
    sumMinLength: number[];
    intersection: {
        p1?: string | undefined;
    } & {
        p1?: number | undefined;
    };
    enum: "one";
    numProm: Promise<number>;
    lenfun: (args_0: string) => boolean;
    async_refine: number[];
}>;
