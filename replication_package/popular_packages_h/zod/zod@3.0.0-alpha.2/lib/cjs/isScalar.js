"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./helpers/util");
var base_1 = require("./types/base");
exports.isScalar = function (schema, params) {
    if (params === void 0) { params = { root: true }; }
    var def = schema._def;
    var returnValue = false;
    switch (def.t) {
        case base_1.ZodTypes.string:
            returnValue = true;
            break;
        case base_1.ZodTypes.number:
            returnValue = true;
            break;
        case base_1.ZodTypes.bigint:
            returnValue = true;
            break;
        case base_1.ZodTypes.boolean:
            returnValue = true;
            break;
        case base_1.ZodTypes.undefined:
            returnValue = true;
            break;
        case base_1.ZodTypes.null:
            returnValue = true;
            break;
        case base_1.ZodTypes.any:
            returnValue = false;
            break;
        case base_1.ZodTypes.unknown:
            returnValue = false;
            break;
        case base_1.ZodTypes.never:
            returnValue = false;
            break;
        case base_1.ZodTypes.void:
            returnValue = false;
            break;
        case base_1.ZodTypes.array:
            if (params.root === false)
                return false;
            returnValue = exports.isScalar(def.type, { root: false });
            break;
        case base_1.ZodTypes.object:
            returnValue = false;
            break;
        case base_1.ZodTypes.union:
            returnValue = def.options.every(function (x) { return exports.isScalar(x); });
            break;
        case base_1.ZodTypes.intersection:
            returnValue = exports.isScalar(def.left) && exports.isScalar(def.right);
            break;
        case base_1.ZodTypes.tuple:
            returnValue = def.items.every(function (x) { return exports.isScalar(x, { root: false }); });
            break;
        case base_1.ZodTypes.lazy:
            returnValue = exports.isScalar(def.getter());
            break;
        case base_1.ZodTypes.literal:
            returnValue = true;
            break;
        case base_1.ZodTypes.enum:
            returnValue = true;
            break;
        case base_1.ZodTypes.nativeEnum:
            returnValue = true;
            break;
        case base_1.ZodTypes.function:
            returnValue = false;
            break;
        case base_1.ZodTypes.record:
            returnValue = false;
            break;
        case base_1.ZodTypes.map:
            returnValue = false;
            break;
        case base_1.ZodTypes.date:
            returnValue = true;
            break;
        case base_1.ZodTypes.promise:
            returnValue = false;
            break;
        case base_1.ZodTypes.transformer:
            returnValue = exports.isScalar(def.schema);
            break;
        case base_1.ZodTypes.optional:
            returnValue = exports.isScalar(def.innerType);
            break;
        case base_1.ZodTypes.nullable:
            returnValue = exports.isScalar(def.innerType);
            break;
        default:
            util_1.util.assertNever(def);
    }
    return returnValue;
};
//# sourceMappingURL=isScalar.js.map