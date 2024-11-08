import { objectUtil } from "../helpers/objectUtil";
import { partialUtil } from "../helpers/partialUtil";
import { Scalars } from "../helpers/primitive";
import * as z from "./base";
declare type UnknownKeysParam = "passthrough" | "strict" | "strip";
export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.object;
    shape: () => T;
    catchall: Catchall;
    unknownKeys: UnknownKeys;
}
export declare type baseObjectOutputType<Shape extends z.ZodRawShape> = objectUtil.flatten<objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_output"];
}>>;
export declare type objectOutputType<Shape extends z.ZodRawShape, Catchall extends z.ZodTypeAny> = z.ZodTypeAny extends Catchall ? baseObjectOutputType<Shape> : objectUtil.flatten<baseObjectOutputType<Shape> & {
    [k: string]: Catchall["_output"];
}>;
export declare type baseObjectInputType<Shape extends z.ZodRawShape> = objectUtil.flatten<objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
}>>;
export declare type objectInputType<Shape extends z.ZodRawShape, Catchall extends z.ZodTypeAny> = z.ZodTypeAny extends Catchall ? baseObjectInputType<Shape> : objectUtil.flatten<baseObjectInputType<Shape> & {
    [k: string]: Catchall["_input"];
}>;
export declare type AnyZodObject = ZodObject<any, any, any>;
export declare class ZodObject<T extends z.ZodRawShape, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends z.ZodTypeAny = z.ZodTypeAny, Output = objectOutputType<T, Catchall>, Input = objectInputType<T, Catchall>> extends z.ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
    readonly _shape: T;
    readonly _unknownKeys: UnknownKeys;
    readonly _catchall: Catchall;
    get shape(): T;
    toJSON: () => {
        t: z.ZodTypes.object;
        shape: any;
    };
    strict: () => ZodObject<T, "strict", Catchall, objectOutputType<T, Catchall>, objectInputType<T, Catchall>>;
    strip: () => ZodObject<T, "strip", Catchall, objectOutputType<T, Catchall>, objectInputType<T, Catchall>>;
    passthrough: () => ZodObject<T, "passthrough", Catchall, objectOutputType<T, Catchall>, objectInputType<T, Catchall>>;
    nonstrict: () => ZodObject<T, "passthrough", Catchall, objectOutputType<T, Catchall>, objectInputType<T, Catchall>>;
    augment: <Augmentation extends z.ZodRawShape>(augmentation: Augmentation) => ZodObject<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, UnknownKeys, Catchall, objectOutputType<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Catchall>, objectInputType<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Catchall>>;
    extend: <Augmentation extends z.ZodRawShape>(augmentation: Augmentation) => ZodObject<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, UnknownKeys, Catchall, objectOutputType<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Catchall>, objectInputType<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Catchall>>;
    setKey: <Key extends string, Schema extends z.ZodTypeAny>(key: Key, schema: Schema) => ZodObject<T & { [k in Key]: Schema; }, UnknownKeys, Catchall, objectOutputType<T & { [k in Key]: Schema; }, Catchall>, objectInputType<T & { [k in Key]: Schema; }, Catchall>>;
    merge: <Incoming extends AnyZodObject>(other: Incoming) => ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall>;
    catchall: <Index extends z.ZodTypeAny>(index: Index) => ZodObject<T, UnknownKeys, Index, objectOutputType<T, Index>, objectInputType<T, Index>>;
    pick: <Mask extends { [k in keyof T]?: true | undefined; }>(mask: Mask) => ZodObject<{ [k_3 in { [k_2 in keyof { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }]: [{ [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_2]] extends [never] ? never : k_2; }[keyof Mask]]: k_3 extends keyof Mask ? { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_3] : never; }, UnknownKeys, Catchall, objectOutputType<{ [k_3 in { [k_2 in keyof { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }]: [{ [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_2]] extends [never] ? never : k_2; }[keyof Mask]]: k_3 extends keyof Mask ? { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_3] : never; }, Catchall>, objectInputType<{ [k_3 in { [k_2 in keyof { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }]: [{ [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_2]] extends [never] ? never : k_2; }[keyof Mask]]: k_3 extends keyof Mask ? { [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }[k_3] : never; }, Catchall>>;
    omit: <Mask extends { [k in keyof T]?: true | undefined; }>(mask: Mask) => ZodObject<{ [k_3 in { [k_2 in keyof { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }]: [{ [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_2]] extends [never] ? never : k_2; }[keyof T]]: k_3 extends keyof T ? { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_3] : never; }, UnknownKeys, Catchall, objectOutputType<{ [k_3 in { [k_2 in keyof { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }]: [{ [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_2]] extends [never] ? never : k_2; }[keyof T]]: k_3 extends keyof T ? { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_3] : never; }, Catchall>, objectInputType<{ [k_3 in { [k_2 in keyof { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }]: [{ [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_2]] extends [never] ? never : k_2; }[keyof T]]: k_3 extends keyof T ? { [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }[k_3] : never; }, Catchall>>;
    partial: () => ZodObject<{ [k in keyof T]: ReturnType<T[k]["optional"]>; }, UnknownKeys, Catchall, objectOutputType<{ [k in keyof T]: ReturnType<T[k]["optional"]>; }, Catchall>, objectInputType<{ [k in keyof T]: ReturnType<T[k]["optional"]>; }, Catchall>>;
    primitives: () => ZodObject<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_2] : never; }, UnknownKeys, Catchall, objectOutputType<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_2] : never; }, Catchall>, objectInputType<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never; }[k_2] : never; }, Catchall>>;
    nonprimitives: () => ZodObject<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_2] : never; }, UnknownKeys, Catchall, objectOutputType<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_2] : never; }, Catchall>, objectInputType<{ [k_2 in { [k_1 in keyof { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }]: [{ [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_1]] extends [never] ? never : k_1; }[keyof T]]: k_2 extends keyof T ? { [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k]; }[k_2] : never; }, Catchall>>;
    deepPartial: () => partialUtil.RootDeepPartial<this>;
    static create: <T_1 extends z.ZodRawShape>(shape: T_1) => ZodObject<T_1, "strip", z.ZodTypeAny, { [k_1 in keyof objectUtil.addQuestionMarks<{ [k in keyof T_1]: T_1[k]["_output"]; }>]: objectUtil.addQuestionMarks<{ [k in keyof T_1]: T_1[k]["_output"]; }>[k_1]; }, { [k_3 in keyof objectUtil.addQuestionMarks<{ [k_2 in keyof T_1]: T_1[k_2]["_input"]; }>]: objectUtil.addQuestionMarks<{ [k_2 in keyof T_1]: T_1[k_2]["_input"]; }>[k_3]; }>;
    static lazycreate: <T_1 extends z.ZodRawShape>(shape: () => T_1) => ZodObject<T_1, "strip", z.ZodTypeAny, { [k_1 in keyof objectUtil.addQuestionMarks<{ [k in keyof T_1]: T_1[k]["_output"]; }>]: objectUtil.addQuestionMarks<{ [k in keyof T_1]: T_1[k]["_output"]; }>[k_1]; }, { [k_3 in keyof objectUtil.addQuestionMarks<{ [k_2 in keyof T_1]: T_1[k_2]["_input"]; }>]: objectUtil.addQuestionMarks<{ [k_2 in keyof T_1]: T_1[k_2]["_input"]; }>[k_3]; }>;
}
export {};
