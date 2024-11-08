"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { ZodCodeGenerator } = require("./codegen");
exports.ZodCodeGenerator = ZodCodeGenerator;

const { ZodParsedType } = require("./parser");
exports.ZodParsedType = ZodParsedType;

const { ZodAny } = require("./types/any");
exports.ZodAny = ZodAny;

const { ZodArray } = require("./types/array");
exports.ZodArray = ZodArray;

const { ZodType, ZodTypes } = require("./types/base");
exports.Schema = ZodType;
exports.ZodSchema = ZodType;
exports.ZodType = ZodType;
exports.ZodTypes = ZodTypes;

const { ZodBigInt } = require("./types/bigint");
exports.ZodBigInt = ZodBigInt;

const { ZodBoolean } = require("./types/boolean");
exports.ZodBoolean = ZodBoolean;

const { ZodDate } = require("./types/date");
exports.ZodDate = ZodDate;

const { ZodEnum } = require("./types/enum");
exports.ZodEnum = ZodEnum;

const { ZodFunction } = require("./types/function");
exports.ZodFunction = ZodFunction;

const { ZodIntersection } = require("./types/intersection");
exports.ZodIntersection = ZodIntersection;

const { ZodLazy } = require("./types/lazy");
exports.ZodLazy = ZodLazy;

const { ZodLiteral } = require("./types/literal");
exports.ZodLiteral = ZodLiteral;

const { ZodMap } = require("./types/map");
const { ZodNativeEnum } = require("./types/nativeEnum");
exports.ZodNativeEnum = ZodNativeEnum;

const { ZodNever } = require("./types/never");
exports.ZodNever = ZodNever;

const { ZodNull } = require("./types/null");
exports.ZodNull = ZodNull;

const { ZodNullable } = require("./types/nullable");
exports.ZodNullable = ZodNullable;

const { ZodNumber } = require("./types/number");
exports.ZodNumber = ZodNumber;

const { ZodObject } = require("./types/object");
exports.ZodObject = ZodObject;

const { ZodOptional } = require("./types/optional");
exports.ZodOptional = ZodOptional;

const { ZodPromise } = require("./types/promise");
exports.ZodPromise = ZodPromise;

const { ZodRecord } = require("./types/record");
exports.ZodRecord = ZodRecord;

const { ZodString } = require("./types/string");
exports.ZodString = ZodString;

const { ZodTransformer } = require("./types/transformer");
exports.ZodTransformer = ZodTransformer;

const { ZodTuple } = require("./types/tuple");
exports.ZodTuple = ZodTuple;

const { ZodUndefined } = require("./types/undefined");
exports.ZodUndefined = ZodUndefined;

const { ZodUnion } = require("./types/union");
exports.ZodUnion = ZodUnion;

const { ZodUnknown } = require("./types/unknown");
exports.ZodUnknown = ZodUnknown;

const { ZodVoid } = require("./types/void");
exports.ZodVoid = ZodVoid;

// Helper type creation functions
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

// Optional type utility functions
exports.ostring = () => exports.string().optional();
exports.onumber = () => exports.number().optional();
exports.oboolean = () => exports.boolean().optional();

// Code generation utility
exports.codegen = ZodCodeGenerator.create;

// Custom validation
exports.custom = (check, params) => {
    return check ? exports.any().refine(check, params) : exports.any();
};

// Instance validation utility
const instanceOfType = (cls, params = { message: `Input not instance of ${cls.name}` }) => {
    return exports.custom(data => data instanceof cls, params);
};
exports.instanceof = instanceOfType;

// Late object creation
exports.late = {
    object: ZodObject.lazycreate,
};

// Exported errors
__export(require("./ZodError"));
