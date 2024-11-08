"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./helpers/util");
var z = __importStar(require("./index"));
exports.visitor = function (schema) {
    var def = schema._def;
    switch (def.t) {
        case z.ZodTypes.string:
            break;
        case z.ZodTypes.number:
            break;
        case z.ZodTypes.bigint:
            break;
        case z.ZodTypes.boolean:
            break;
        case z.ZodTypes.undefined:
            break;
        case z.ZodTypes.null:
            break;
        case z.ZodTypes.any:
            break;
        case z.ZodTypes.unknown:
            break;
        case z.ZodTypes.never:
            break;
        case z.ZodTypes.void:
            break;
        case z.ZodTypes.array:
            break;
        case z.ZodTypes.object:
            break;
        case z.ZodTypes.union:
            break;
        case z.ZodTypes.intersection:
            break;
        case z.ZodTypes.tuple:
            break;
        case z.ZodTypes.lazy:
            break;
        case z.ZodTypes.literal:
            break;
        case z.ZodTypes.enum:
            break;
        case z.ZodTypes.nativeEnum:
            break;
        case z.ZodTypes.function:
            break;
        case z.ZodTypes.record:
            break;
        case z.ZodTypes.date:
            break;
        case z.ZodTypes.promise:
            break;
        case z.ZodTypes.transformer:
            break;
        case z.ZodTypes.optional:
            break;
        case z.ZodTypes.nullable:
            break;
        case z.ZodTypes.map:
            break;
        default:
            util_1.util.assertNever(def);
    }
};
//# sourceMappingURL=switcher.js.map