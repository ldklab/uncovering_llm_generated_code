import { ZodCodeGenerator } from "./codegen";
import { ZodErrorMap } from "./defaultErrorMap";
import { ZodParsedType } from "./parser";
import { ZodAny, ZodAnyDef } from "./types/any";
import { ZodArray, ZodArrayDef } from "./types/array";
import { input, output, TypeOf, ZodType, ZodTypeAny, ZodTypeDef, ZodTypes } from "./types/base";
import { ZodBigInt, ZodBigIntDef } from "./types/bigint";
import { ZodBoolean, ZodBooleanDef } from "./types/boolean";
import { ZodDate, ZodDateDef } from "./types/date";
import { ZodEnum, ZodEnumDef } from "./types/enum";
import { ZodFunction, ZodFunctionDef } from "./types/function";
import { ZodIntersection, ZodIntersectionDef } from "./types/intersection";
import { ZodLazy, ZodLazyDef } from "./types/lazy";
import { ZodLiteral, ZodLiteralDef } from "./types/literal";
import { ZodMap, ZodMapDef } from "./types/map";
import { ZodNativeEnum, ZodNativeEnumDef } from "./types/nativeEnum";
import { ZodNever, ZodNeverDef } from "./types/never";
import { ZodNull, ZodNullDef } from "./types/null";
import { ZodNullable, ZodNullableDef } from "./types/nullable";
import { ZodNumber, ZodNumberDef } from "./types/number";
import { ZodObject, ZodObjectDef } from "./types/object";
import { ZodOptional, ZodOptionalDef } from "./types/optional";
import { ZodPromise, ZodPromiseDef } from "./types/promise";
import { ZodRecord, ZodRecordDef } from "./types/record";
import { ZodString, ZodStringDef } from "./types/string";
import { ZodTransformer, ZodTransformerDef } from "./types/transformer";
import { ZodTuple, ZodTupleDef } from "./types/tuple";
import { ZodUndefined, ZodUndefinedDef } from "./types/undefined";
import { ZodUnion, ZodUnionDef } from "./types/union";
import { ZodUnknown, ZodUnknownDef } from "./types/unknown";
import { ZodVoid, ZodVoidDef } from "./types/void";
export { ZodTypeDef, ZodTypes };
declare const stringType: () => ZodString;
declare const numberType: () => ZodNumber;
declare const bigIntType: () => ZodBigInt;
declare const booleanType: () => ZodBoolean;
declare const dateType: () => ZodDate;
declare const undefinedType: () => ZodUndefined;
declare const nullType: () => ZodNull;
declare const anyType: () => ZodAny;
declare const unknownType: () => ZodUnknown;
declare const neverType: () => ZodNever;
declare const voidType: () => ZodVoid;
declare const arrayType: <T extends ZodTypeAny>(schema: T) => ZodArray<T>;
declare const objectType: <T extends import("./types/base").ZodRawShape>(shape: T) => ZodObject<T, "strip", ZodTypeAny, { [k_1 in keyof import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>]: import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k_2 in keyof T]: T[k_2]["_input"]; }>]: import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k_2 in keyof T]: T[k_2]["_input"]; }>[k_3]; }>;
declare const unionType: <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(types: T) => ZodUnion<T>;
declare const intersectionType: <T extends ZodTypeAny, U extends ZodTypeAny>(left: T, right: U) => ZodIntersection<T, U>;
declare const tupleType: <T extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(schemas: T) => ZodTuple<T>;
declare const recordType: <Value extends ZodTypeAny = ZodTypeAny>(valueType: Value) => ZodRecord<Value>;
declare const mapType: <Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny>(keyType: Key, valueType: Value) => ZodMap<Key, Value>;
declare const functionType: <T extends ZodTuple<any> = ZodTuple<[]>, U extends ZodTypeAny = ZodUnknown>(args?: T | undefined, returns?: U | undefined) => ZodFunction<T, U>;
declare const lazyType: <T extends ZodTypeAny>(getter: () => T) => ZodLazy<T>;
declare const literalType: <T extends import("./helpers/primitive").Primitive>(value: T) => ZodLiteral<T>;
declare const enumType: <U extends string, T extends [U, ...U[]]>(values: T) => ZodEnum<T>;
declare const nativeEnumType: <T extends {
    [k: string]: string | number;
    [nu: number]: string;
}>(values: T) => ZodNativeEnum<T>;
declare const promiseType: <T extends ZodTypeAny>(schema: T) => ZodPromise<T>;
declare const transformerType: <I extends ZodTypeAny>(schema: I) => ZodTransformer<I, I["_output"]>;
declare const optionalType: <T extends ZodTypeAny>(type: T) => import("./types/optional").ZodOptionalType<T>;
declare const nullableType: <T extends ZodTypeAny>(type: T) => import("./types/nullable").ZodNullableType<T>;
declare const ostring: () => ZodOptional<ZodString>;
declare const onumber: () => ZodOptional<ZodNumber>;
declare const oboolean: () => ZodOptional<ZodBoolean>;
declare const codegen: () => ZodCodeGenerator;
export declare const custom: <T>(check?: ((data: unknown) => any) | undefined, params?: string | Partial<Pick<import("./ZodError").ZodCustomIssue, "params" | "path" | "message">> | ((arg: any) => Partial<Pick<import("./ZodError").ZodCustomIssue, "params" | "path" | "message">>) | undefined) => ZodType<T, ZodTypeDef, T>;
declare const instanceOfType: <T extends new (...args: any[]) => any>(cls: T, params?: string | Partial<Pick<import("./ZodError").ZodCustomIssue, "params" | "path" | "message">> | ((arg: any) => Partial<Pick<import("./ZodError").ZodCustomIssue, "params" | "path" | "message">>) | undefined) => ZodType<InstanceType<T>, ZodTypeDef, InstanceType<T>>;
export { anyType as any, arrayType as array, bigIntType as bigint, booleanType as boolean, codegen, dateType as date, enumType as enum, functionType as function, instanceOfType as instanceof, intersectionType as intersection, lazyType as lazy, literalType as literal, mapType as map, nativeEnumType as nativeEnum, neverType as never, nullType as null, nullableType as nullable, numberType as number, objectType as object, oboolean, onumber, optionalType as optional, ostring, promiseType as promise, recordType as record, stringType as string, transformerType as transformer, tupleType as tuple, undefinedType as undefined, unionType as union, unknownType as unknown, voidType as void, };
export declare const late: {
    object: <T extends import("./types/base").ZodRawShape>(shape: () => T) => ZodObject<T, "strip", ZodTypeAny, { [k_1 in keyof import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>]: import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k_2 in keyof T]: T[k_2]["_input"]; }>]: import("./helpers/objectUtil").objectUtil.addQuestionMarks<{ [k_2 in keyof T]: T[k_2]["_input"]; }>[k_3]; }>;
};
export { ZodType as Schema, ZodAny, ZodArray, ZodBigInt, ZodBoolean, ZodCodeGenerator, ZodDate, ZodEnum, ZodErrorMap, ZodFunction, ZodIntersection, ZodLazy, ZodLiteral, ZodNativeEnum, ZodNever, ZodNull, ZodNullable, ZodNumber, ZodObject, ZodOptional, ZodParsedType, ZodPromise, ZodRecord, ZodType as ZodSchema, ZodString, ZodTransformer, ZodTuple, ZodType, ZodTypeAny, ZodUndefined, ZodUnion, ZodUnknown, ZodVoid, };
export { TypeOf as infer, input, output, TypeOf };
export * from "./ZodError";
export declare type ZodDef = ZodStringDef | ZodNumberDef | ZodBigIntDef | ZodBooleanDef | ZodDateDef | ZodUndefinedDef | ZodNullDef | ZodAnyDef | ZodUnknownDef | ZodNeverDef | ZodVoidDef | ZodArrayDef | ZodObjectDef | ZodUnionDef | ZodIntersectionDef | ZodTupleDef | ZodRecordDef | ZodMapDef | ZodFunctionDef | ZodLazyDef | ZodLiteralDef | ZodEnumDef | ZodTransformerDef | ZodNativeEnumDef | ZodOptionalDef | ZodNullableDef | ZodPromiseDef;