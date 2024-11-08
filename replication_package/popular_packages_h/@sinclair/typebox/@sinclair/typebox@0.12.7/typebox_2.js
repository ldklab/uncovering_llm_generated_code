"use strict";
/*--------------------------------------------------------------------------

TypeBox: JSON Schema Type Builder with Static Type Resolution for TypeScript

The MIT License (MIT)

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.TypeBuilder = exports.VoidKind = exports.UndefinedKind = exports.PromiseKind = exports.FunctionKind = exports.ConstructorKind = exports.AnyKind = exports.UnknownKind = exports.NullKind = exports.BooleanKind = exports.IntegerKind = exports.NumberKind = exports.StringKind = exports.LiteralKind = exports.EnumKind = exports.ArrayKind = exports.DictKind = exports.ObjectKind = exports.TupleKind = exports.IntersectKind = exports.UnionKind = exports.ReadonlyModifier = exports.OptionalModifier = exports.ReadonlyOptionalModifier = void 0;

// Modifiers
exports.ReadonlyOptionalModifier = Symbol('ReadonlyOptionalModifier');
exports.OptionalModifier = Symbol('OptionalModifier');
exports.ReadonlyModifier = Symbol('ReadonlyModifier');

// Schema: Core
exports.UnionKind = Symbol('UnionKind');
exports.IntersectKind = Symbol('IntersectKind');
exports.TupleKind = Symbol('TupleKind');
exports.ObjectKind = Symbol('ObjectKind');
exports.DictKind = Symbol('DictKind');
exports.ArrayKind = Symbol('ArrayKind');
exports.EnumKind = Symbol('EnumKind');
exports.LiteralKind = Symbol('LiteralKind');
exports.StringKind = Symbol('StringKind');
exports.NumberKind = Symbol('NumberKind');
exports.IntegerKind = Symbol('IntegerKind');
exports.BooleanKind = Symbol('BooleanKind');
exports.NullKind = Symbol('NullKind');
exports.UnknownKind = Symbol('UnknownKind');
exports.AnyKind = Symbol('AnyKind');

// Schema: Extended
exports.ConstructorKind = Symbol('ConstructorKind');
exports.FunctionKind = Symbol('FunctionKind');
exports.PromiseKind = Symbol('PromiseKind');
exports.UndefinedKind = Symbol('UndefinedKind');
exports.VoidKind = Symbol('VoidKind');

// Reflect
function reflect(value) {
    switch (typeof value) {
        case 'string':
            return 'string';
        case 'number':
            return 'number';
        case 'boolean':
            return 'boolean';
        default:
            return 'unknown';
    }
}

// TypeBuilder
class TypeBuilder {
    ReadonlyOptional(item) {
        return { ...item, modifier: exports.ReadonlyOptionalModifier };
    }
    Readonly(item) {
        return { ...item, modifier: exports.ReadonlyModifier };
    }
    Optional(item) {
        return { ...item, modifier: exports.OptionalModifier };
    }
    Intersect(items, options = {}) {
        return { ...options, kind: exports.IntersectKind, allOf: items };
    }
    Union(items, options = {}) {
        return { ...options, kind: exports.UnionKind, anyOf: items };
    }
    Tuple(items, options = {}) {
        return { ...options, kind: exports.TupleKind, type: 'array', items, additionalItems: false, minItems: items.length, maxItems: items.length };
    }
    Object(properties, options = {}) {
        const optional = Object.keys(properties).filter(name => {
            const candidate = properties[name];
            return candidate.modifier === exports.OptionalModifier || candidate.modifier === exports.ReadonlyOptionalModifier;
        });
        const required = optional.length ? undefined : Object.keys(properties).filter(name => !optional.includes(name));
        return { ...options, kind: exports.ObjectKind, type: 'object', properties, required };
    }
    Dict(item, options = {}) {
        return { ...options, kind: exports.DictKind, type: 'object', additionalProperties: item };
    }
    Array(items, options = {}) {
        return { ...options, kind: exports.ArrayKind, type: 'array', items };
    }
    Enum(item, options = {}) {
        const values = Object.keys(item).filter(key => isNaN(key)).map(key => item[key]);
        return { ...options, kind: exports.EnumKind, enum: values };
    }
    Literal(value, options = {}) {
        const type = reflect(value);
        if (type === 'unknown') {
            throw Error(`Invalid literal value '${value}'`);
        }
        return { ...options, kind: exports.LiteralKind, type, enum: [value] };
    }
    String(options = {}) {
        return { ...options, kind: exports.StringKind, type: 'string' };
    }
    RegEx(regex, options = {}) {
        return this.String({ ...options, pattern: regex.source });
    }
    Number(options = {}) {
        return { ...options, kind: exports.NumberKind, type: 'number' };
    }
    Integer(options = {}) {
        return { ...options, kind: exports.IntegerKind, type: 'integer' };
    }
    Boolean(options = {}) {
        return { ...options, kind: exports.BooleanKind, type: 'boolean' };
    }
    Null(options = {}) {
        return { ...options, kind: exports.NullKind, type: 'null' };
    }
    Unknown(options = {}) {
        return { ...options, kind: exports.UnknownKind };
    }
    Any(options = {}) {
        return { ...options, kind: exports.AnyKind };
    }
    Constructor(args, returns, options = {}) {
        return { ...options, kind: exports.ConstructorKind, type: 'constructor', arguments: args, returns };
    }
    Function(args, returns, options = {}) {
        return { ...options, kind: exports.FunctionKind, type: 'function', arguments: args, returns };
    }
    Promise(item, options = {}) {
        return { ...options, type: 'promise', kind: exports.PromiseKind, item };
    }
    Undefined(options = {}) {
        return { ...options, type: 'undefined', kind: exports.UndefinedKind };
    }
    Void(options = {}) {
        return { ...options, type: 'void', kind: exports.VoidKind };
    }
}
exports.TypeBuilder = TypeBuilder;
exports.Type = new TypeBuilder();
