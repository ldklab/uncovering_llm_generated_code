"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var codegen_1 = require("./codegen");
exports.ZodCodeGenerator = codegen_1.ZodCodeGenerator;
var parser_1 = require("./parser");
exports.ZodParsedType = parser_1.ZodParsedType;
var any_1 = require("./types/any");
exports.ZodAny = any_1.ZodAny;
var array_1 = require("./types/array");
exports.ZodArray = array_1.ZodArray;
var base_1 = require("./types/base");
exports.Schema = base_1.ZodType;
exports.ZodSchema = base_1.ZodType;
exports.ZodType = base_1.ZodType;
exports.ZodTypes = base_1.ZodTypes;
var bigint_1 = require("./types/bigint");
exports.ZodBigInt = bigint_1.ZodBigInt;
var boolean_1 = require("./types/boolean");
exports.ZodBoolean = boolean_1.ZodBoolean;
var date_1 = require("./types/date");
exports.ZodDate = date_1.ZodDate;
var enum_1 = require("./types/enum");
exports.ZodEnum = enum_1.ZodEnum;
var function_1 = require("./types/function");
exports.ZodFunction = function_1.ZodFunction;
var intersection_1 = require("./types/intersection");
exports.ZodIntersection = intersection_1.ZodIntersection;
var lazy_1 = require("./types/lazy");
exports.ZodLazy = lazy_1.ZodLazy;
var literal_1 = require("./types/literal");
exports.ZodLiteral = literal_1.ZodLiteral;
var map_1 = require("./types/map");
var nativeEnum_1 = require("./types/nativeEnum");
exports.ZodNativeEnum = nativeEnum_1.ZodNativeEnum;
var never_1 = require("./types/never");
exports.ZodNever = never_1.ZodNever;
var null_1 = require("./types/null");
exports.ZodNull = null_1.ZodNull;
var nullable_1 = require("./types/nullable");
exports.ZodNullable = nullable_1.ZodNullable;
var number_1 = require("./types/number");
exports.ZodNumber = number_1.ZodNumber;
var object_1 = require("./types/object");
exports.ZodObject = object_1.ZodObject;
var optional_1 = require("./types/optional");
exports.ZodOptional = optional_1.ZodOptional;
var promise_1 = require("./types/promise");
exports.ZodPromise = promise_1.ZodPromise;
var record_1 = require("./types/record");
exports.ZodRecord = record_1.ZodRecord;
var string_1 = require("./types/string");
exports.ZodString = string_1.ZodString;
var transformer_1 = require("./types/transformer");
exports.ZodTransformer = transformer_1.ZodTransformer;
var tuple_1 = require("./types/tuple");
exports.ZodTuple = tuple_1.ZodTuple;
var undefined_1 = require("./types/undefined");
exports.ZodUndefined = undefined_1.ZodUndefined;
var union_1 = require("./types/union");
exports.ZodUnion = union_1.ZodUnion;
var unknown_1 = require("./types/unknown");
exports.ZodUnknown = unknown_1.ZodUnknown;
var void_1 = require("./types/void");
exports.ZodVoid = void_1.ZodVoid;
var stringType = string_1.ZodString.create;
exports.string = stringType;
var numberType = number_1.ZodNumber.create;
exports.number = numberType;
var bigIntType = bigint_1.ZodBigInt.create;
exports.bigint = bigIntType;
var booleanType = boolean_1.ZodBoolean.create;
exports.boolean = booleanType;
var dateType = date_1.ZodDate.create;
exports.date = dateType;
var undefinedType = undefined_1.ZodUndefined.create;
exports.undefined = undefinedType;
var nullType = null_1.ZodNull.create;
exports.null = nullType;
var anyType = any_1.ZodAny.create;
exports.any = anyType;
var unknownType = unknown_1.ZodUnknown.create;
exports.unknown = unknownType;
var neverType = never_1.ZodNever.create;
exports.never = neverType;
var voidType = void_1.ZodVoid.create;
exports.void = voidType;
var arrayType = array_1.ZodArray.create;
exports.array = arrayType;
var objectType = object_1.ZodObject.create;
exports.object = objectType;
var unionType = union_1.ZodUnion.create;
exports.union = unionType;
var intersectionType = intersection_1.ZodIntersection.create;
exports.intersection = intersectionType;
var tupleType = tuple_1.ZodTuple.create;
exports.tuple = tupleType;
var recordType = record_1.ZodRecord.create;
exports.record = recordType;
var mapType = map_1.ZodMap.create;
exports.map = mapType;
var functionType = function_1.ZodFunction.create;
exports.function = functionType;
var lazyType = lazy_1.ZodLazy.create;
exports.lazy = lazyType;
var literalType = literal_1.ZodLiteral.create;
exports.literal = literalType;
var enumType = enum_1.ZodEnum.create;
exports.enum = enumType;
var nativeEnumType = nativeEnum_1.ZodNativeEnum.create;
exports.nativeEnum = nativeEnumType;
var promiseType = promise_1.ZodPromise.create;
exports.promise = promiseType;
var transformerType = transformer_1.ZodTransformer.create;
exports.transformer = transformerType;
var optionalType = optional_1.ZodOptional.create;
exports.optional = optionalType;
var nullableType = nullable_1.ZodNullable.create;
exports.nullable = nullableType;
var ostring = function () { return stringType().optional(); };
exports.ostring = ostring;
var onumber = function () { return numberType().optional(); };
exports.onumber = onumber;
var oboolean = function () { return booleanType().optional(); };
exports.oboolean = oboolean;
var codegen = codegen_1.ZodCodeGenerator.create;
exports.codegen = codegen;
exports.custom = function (check, params) {
    if (check)
        return anyType().refine(check, params);
    return anyType();
};
var instanceOfType = function (cls, params) {
    if (params === void 0) { params = {
        message: "Input not instance of " + cls.name,
    }; }
    return exports.custom(function (data) { return data instanceof cls; }, params);
};
exports.instanceof = instanceOfType;
exports.late = {
    object: object_1.ZodObject.lazycreate,
};
__export(require("./ZodError"));
//# sourceMappingURL=index.js.map