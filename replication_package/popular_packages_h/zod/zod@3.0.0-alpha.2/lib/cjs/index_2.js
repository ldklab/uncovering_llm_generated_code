"use strict";

import { ZodCodeGenerator } from './codegen';
import { ZodParsedType } from './parser';
import { ZodAny, create as anyType } from './types/any';
import { ZodArray, create as arrayType } from './types/array';
import { ZodType, ZodTypes } from './types/base';
import { ZodBigInt, create as bigIntType } from './types/bigint';
import { ZodBoolean, create as booleanType } from './types/boolean';
import { ZodDate, create as dateType } from './types/date';
import { ZodEnum, create as enumType } from './types/enum';
import { ZodFunction, create as functionType } from './types/function';
import { ZodIntersection, create as intersectionType } from './types/intersection';
import { ZodLazy, create as lazyType } from './types/lazy';
import { ZodLiteral, create as literalType } from './types/literal';
import { ZodMap, create as mapType } from './types/map';
import { ZodNativeEnum, create as nativeEnumType } from './types/nativeEnum';
import { ZodNever, create as neverType } from './types/never';
import { ZodNull, create as nullType } from './types/null';
import { ZodNullable, create as nullableType } from './types/nullable';
import { ZodNumber, create as numberType } from './types/number';
import { ZodObject, create as objectType, lazycreate as lazyObjectCreate } from './types/object';
import { ZodOptional, create as optionalType } from './types/optional';
import { ZodPromise, create as promiseType } from './types/promise';
import { ZodRecord, create as recordType } from './types/record';
import { ZodString, create as stringType } from './types/string';
import { ZodTransformer, create as transformerType } from './types/transformer';
import { ZodTuple, create as tupleType } from './types/tuple';
import { ZodUndefined, create as undefinedType } from './types/undefined';
import { ZodUnion, create as unionType } from './types/union';
import { ZodUnknown, create as unknownType } from './types/unknown';
import { ZodVoid, create as voidType } from './types/void';
import * as ZodError from './ZodError';

export {
    ZodCodeGenerator,
    ZodParsedType,
    ZodAny,
    ZodArray,
    ZodType as Schema,
    ZodType as ZodSchema,
    ZodType as ZodType,
    ZodTypes,
    ZodBigInt,
    ZodBoolean,
    ZodDate,
    ZodEnum,
    ZodFunction,
    ZodIntersection,
    ZodLazy,
    ZodLiteral,
    ZodMap,
    ZodNativeEnum,
    ZodNever,
    ZodNull,
    ZodNullable,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodPromise,
    ZodRecord,
    ZodString,
    ZodTransformer,
    ZodTuple,
    ZodUndefined,
    ZodUnion,
    ZodUnknown,
    ZodVoid,
    stringType as string,
    numberType as number,
    bigIntType as bigint,
    booleanType as boolean,
    dateType as date,
    undefinedType as undefined,
    nullType as null,
    anyType as any,
    unknownType as unknown,
    neverType as never,
    voidType as void,
    arrayType as array,
    objectType as object,
    unionType as union,
    intersectionType as intersection,
    tupleType as tuple,
    recordType as record,
    mapType as map,
    functionType as function,
    lazyType as lazy,
    literalType as literal,
    enumType as enum,
    nativeEnumType as nativeEnum,
    promiseType as promise,
    transformerType as transformer,
    optionalType as optional,
    nullableType as nullable,
};

export const ostring = () => stringType().optional();
export const onumber = () => numberType().optional();
export const oboolean = () => booleanType().optional();

export const codegen = ZodCodeGenerator.create;

export const custom = (check, params) => {
    if (check) return anyType().refine(check, params);
    return anyType();
};

export const instanceofType = (cls, params = { message: `Input not instance of ${cls.name}` }) => 
    custom((data) => data instanceof cls, params);

export const late = {
    object: lazyObjectCreate,
};

export { ZodError as __export };
