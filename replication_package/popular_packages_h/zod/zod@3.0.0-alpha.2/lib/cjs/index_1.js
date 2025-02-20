"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { ZodCodeGenerator } = require("./codegen");
const { ZodParsedType } = require("./parser");
const { ZodAny } = require("./types/any");
const { ZodArray } = require("./types/array");
const { ZodType, ZodTypes } = require("./types/base");
const { ZodBigInt } = require("./types/bigint");
const { ZodBoolean } = require("./types/boolean");
const { ZodDate } = require("./types/date");
const { ZodEnum } = require("./types/enum");
const { ZodFunction } = require("./types/function");
const { ZodIntersection } = require("./types/intersection");
const { ZodLazy } = require("./types/lazy");
const { ZodLiteral } = require("./types/literal");
const { ZodNativeEnum } = require("./types/nativeEnum");
const { ZodNever } = require("./types/never");
const { ZodNull } = require("./types/null");
const { ZodNullable } = require("./types/nullable");
const { ZodNumber } = require("./types/number");
const { ZodObject } = require("./types/object");
const { ZodOptional } = require("./types/optional");
const { ZodPromise } = require("./types/promise");
const { ZodRecord } = require("./types/record");
const { ZodString } = require("./types/string");
const { ZodTransformer } = require("./types/transformer");
const { ZodTuple } = require("./types/tuple");
const { ZodUndefined } = require("./types/undefined");
const { ZodUnion } = require("./types/union");
const { ZodUnknown } = require("./types/unknown");
const { ZodVoid } = require("./types/void");
const { ZodMap } = require("./types/map");

exports.ZodCodeGenerator = ZodCodeGenerator;
exports.ZodParsedType = ZodParsedType;
exports.ZodAny = ZodAny;
exports.ZodArray = ZodArray;
exports.Schema = ZodType;
exports.ZodSchema = ZodType;
exports.ZodType = ZodType;
exports.ZodTypes = ZodTypes;
exports.ZodBigInt = ZodBigInt;
exports.ZodBoolean = ZodBoolean;
exports.ZodDate = ZodDate;
exports.ZodEnum = ZodEnum;
exports.ZodFunction = ZodFunction;
exports.ZodIntersection = ZodIntersection;
exports.ZodLazy = ZodLazy;
exports.ZodLiteral = ZodLiteral;
exports.ZodNativeEnum = ZodNativeEnum;
exports.ZodNever = ZodNever;
exports.ZodNull = ZodNull;
exports.ZodNullable = ZodNullable;
exports.ZodNumber = ZodNumber;
exports.ZodObject = ZodObject;
exports.ZodOptional = ZodOptional;
exports.ZodPromise = ZodPromise;
exports.ZodRecord = ZodRecord;
exports.ZodString = ZodString;
exports.ZodTransformer = ZodTransformer;
exports.ZodTuple = ZodTuple;
exports.ZodUndefined = ZodUndefined;
exports.ZodUnion = ZodUnion;
exports.ZodUnknown = ZodUnknown;
exports.ZodVoid = ZodVoid;
exports.ZodMap = ZodMap;

exports.string = ZodString.create;
exports.number = ZodNumber.create;
exports.bigint = ZodBigInt.create;
exports.boolean = ZodBoolean.create;
exports.date = ZodDate.create;
exports.undefined = ZodUndefined.create;
exports.null = ZodNull.create;
exports.any = ZodAny.create;
exports.unknown = ZodUnknown.create;
exports.never = ZodNever.create;
exports.void = ZodVoid.create;
exports.array = ZodArray.create;
exports.object = ZodObject.create;
exports.union = ZodUnion.create;
exports.intersection = ZodIntersection.create;
exports.tuple = ZodTuple.create;
exports.record = ZodRecord.create;
exports.map = ZodMap.create;
exports.function = ZodFunction.create;
exports.lazy = ZodLazy.create;
exports.literal = ZodLiteral.create;
exports.enum = ZodEnum.create;
exports.nativeEnum = ZodNativeEnum.create;
exports.promise = ZodPromise.create;
exports.transformer = ZodTransformer.create;
exports.optional = ZodOptional.create;
exports.nullable = ZodNullable.create;

exports.ostring = () => exports.string().optional();
exports.onumber = () => exports.number().optional();
exports.oboolean = () => exports.boolean().optional();

exports.codegen = ZodCodeGenerator.create;

exports.custom = (check, params) => check ? exports.any().refine(check, params) : exports.any();

const instanceOfType = (cls, params = null) => exports.custom(data => data instanceof cls, params || { message: `Input not instance of ${cls.name}` });
exports.instanceof = instanceOfType;

exports.late = {
    object: ZodObject.lazycreate,
};

Object.assign(exports, require("./ZodError"));
