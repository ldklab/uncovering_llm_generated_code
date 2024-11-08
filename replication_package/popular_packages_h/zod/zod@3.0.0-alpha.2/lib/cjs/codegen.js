"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./helpers/util");
var base_1 = require("./types/base");
var isOptional = function (schema) {
    return schema.isOptional();
};
var ZodCodeGenerator = (function () {
    function ZodCodeGenerator() {
        var _this = this;
        this.seen = [];
        this.serial = 0;
        this.randomId = function () {
            return "IZod" + _this.serial++;
        };
        this.findBySchema = function (schema) {
            return _this.seen.find(function (s) { return s.schema === schema; });
        };
        this.findById = function (id) {
            var found = _this.seen.find(function (s) { return s.id === id; });
            if (!found)
                throw new Error("Unfound ID: " + id);
            return found;
        };
        this.dump = function () {
            return "\ntype Identity<T> = T;\n\n" + _this.seen
                .map(function (item) { return "type " + item.id + " = Identity<" + item.type + ">;"; })
                .join("\n\n") + "\n";
        };
        this.setType = function (id, type) {
            var found = _this.findById(id);
            found.type = type;
            return found;
        };
        this.generate = function (schema) {
            var e_1, _a, e_2, _b;
            var found = _this.findBySchema(schema);
            if (found)
                return found;
            var def = schema._def;
            var id = _this.randomId();
            var ty = {
                schema: schema,
                id: id,
                type: "__INCOMPLETE__",
            };
            _this.seen.push(ty);
            switch (def.t) {
                case base_1.ZodTypes.string:
                    return _this.setType(id, "string");
                case base_1.ZodTypes.number:
                    return _this.setType(id, "number");
                case base_1.ZodTypes.bigint:
                    return _this.setType(id, "bigint");
                case base_1.ZodTypes.boolean:
                    return _this.setType(id, "boolean");
                case base_1.ZodTypes.date:
                    return _this.setType(id, "Date");
                case base_1.ZodTypes.undefined:
                    return _this.setType(id, "undefined");
                case base_1.ZodTypes.null:
                    return _this.setType(id, "null");
                case base_1.ZodTypes.any:
                    return _this.setType(id, "any");
                case base_1.ZodTypes.unknown:
                    return _this.setType(id, "unknown");
                case base_1.ZodTypes.never:
                    return _this.setType(id, "never");
                case base_1.ZodTypes.void:
                    return _this.setType(id, "void");
                case base_1.ZodTypes.literal:
                    var val = def.value;
                    var literalType = typeof val === "string" ? "\"" + val + "\"" : "" + val;
                    return _this.setType(id, literalType);
                case base_1.ZodTypes.enum:
                    return _this.setType(id, def.values.map(function (v) { return "\"" + v + "\""; }).join(" | "));
                case base_1.ZodTypes.object:
                    var objectLines = [];
                    var shape = def.shape();
                    for (var key in shape) {
                        var childSchema = shape[key];
                        var childType = _this.generate(childSchema);
                        var OPTKEY = isOptional(childSchema) ? "?" : "";
                        objectLines.push("" + key + OPTKEY + ": " + childType.id);
                    }
                    var baseStruct = "{\n" + objectLines
                        .map(function (line) { return "  " + line + ";"; })
                        .join("\n") + "\n}";
                    _this.setType(id, "" + baseStruct);
                    break;
                case base_1.ZodTypes.tuple:
                    var tupleLines = [];
                    try {
                        for (var _c = __values(def.items), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var elSchema = _d.value;
                            var elType = _this.generate(elSchema);
                            tupleLines.push(elType.id);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var baseTuple = "[\n" + tupleLines
                        .map(function (line) { return "  " + line + ","; })
                        .join("\n") + "\n]";
                    return _this.setType(id, "" + baseTuple);
                case base_1.ZodTypes.array:
                    return _this.setType(id, _this.generate(def.type).id + "[]");
                case base_1.ZodTypes.function:
                    var args = _this.generate(def.args);
                    var returns = _this.generate(def.returns);
                    return _this.setType(id, "(...args: " + args.id + ")=>" + returns.id);
                case base_1.ZodTypes.promise:
                    var promValue = _this.generate(def.type);
                    return _this.setType(id, "Promise<" + promValue.id + ">");
                case base_1.ZodTypes.union:
                    var unionLines = [];
                    try {
                        for (var _e = __values(def.options), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var elSchema = _f.value;
                            var elType = _this.generate(elSchema);
                            unionLines.push(elType.id);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return _this.setType(id, unionLines.join(" | "));
                case base_1.ZodTypes.intersection:
                    return _this.setType(id, _this.generate(def.left).id + " & " + _this.generate(def.right).id);
                case base_1.ZodTypes.record:
                    return _this.setType(id, "{[k:string]: " + _this.generate(def.valueType).id + "}");
                case base_1.ZodTypes.map:
                    return _this.setType(id, "Map<" + _this.generate(def.keyType).id + ", " + _this.generate(def.valueType).id + ">");
                case base_1.ZodTypes.lazy:
                    var lazyType = def.getter();
                    return _this.setType(id, _this.generate(lazyType).id);
                case base_1.ZodTypes.nativeEnum:
                    return _this.setType(id, "asdf");
                case base_1.ZodTypes.optional:
                    return _this.setType(id, _this.generate(def.innerType).id + " | undefined");
                case base_1.ZodTypes.nullable:
                    return _this.setType(id, _this.generate(def.innerType).id + " | null");
                case base_1.ZodTypes.transformer:
                    return _this.setType(id, "" + _this.generate(def.schema).id);
                default:
                    util_1.util.assertNever(def);
            }
            return _this.findById(id);
        };
    }
    ZodCodeGenerator.create = function () { return new ZodCodeGenerator(); };
    return ZodCodeGenerator;
}());
exports.ZodCodeGenerator = ZodCodeGenerator;
//# sourceMappingURL=codegen.js.map