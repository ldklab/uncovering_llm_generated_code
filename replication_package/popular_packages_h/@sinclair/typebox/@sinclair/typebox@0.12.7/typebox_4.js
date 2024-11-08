"use strict";
/*--------------------------------------------------------------------------

TypeBox: JSON Schema Type Builder with Static Type Resolution for TypeScript

The MIT License (MIT)

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });

const Modifiers = {
    ReadonlyOptionalModifier: Symbol('ReadonlyOptionalModifier'),
    OptionalModifier: Symbol('OptionalModifier'),
    ReadonlyModifier: Symbol('ReadonlyModifier')
};

const SchemaKind = {
    UnionKind: Symbol('UnionKind'),
    IntersectKind: Symbol('IntersectKind'),
    TupleKind: Symbol('TupleKind'),
    ObjectKind: Symbol('ObjectKind'),
    DictKind: Symbol('DictKind'),
    ArrayKind: Symbol('ArrayKind'),
    EnumKind: Symbol('EnumKind'),
    LiteralKind: Symbol('LiteralKind'),
    StringKind: Symbol('StringKind'),
    NumberKind: Symbol('NumberKind'),
    IntegerKind: Symbol('IntegerKind'),
    BooleanKind: Symbol('BooleanKind'),
    NullKind: Symbol('NullKind'),
    UnknownKind: Symbol('UnknownKind'),
    AnyKind: Symbol('AnyKind'),
    ConstructorKind: Symbol('ConstructorKind'),
    FunctionKind: Symbol('FunctionKind'),
    PromiseKind: Symbol('PromiseKind'),
    UndefinedKind: Symbol('UndefinedKind'),
    VoidKind: Symbol('VoidKind')
};

function reflect(value) {
    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        default: return 'unknown';
    }
}

class TypeBuilder {
    ReadonlyOptional(item) {
        return { ...item, modifier: Modifiers.ReadonlyOptionalModifier };
    }
    Readonly(item) {
        return { ...item, modifier: Modifiers.ReadonlyModifier };
    }
    Optional(item) {
        return { ...item, modifier: Modifiers.OptionalModifier };
    }
    Intersect(items, options = {}) {
        return { ...options, kind: SchemaKind.IntersectKind, allOf: items };
    }
    Union(items, options = {}) {
        return { ...options, kind: SchemaKind.UnionKind, anyOf: items };
    }
    Tuple(items, options = {}) {
        return { ...options, kind: SchemaKind.TupleKind, type: 'array', items, additionalItems: false, minItems: items.length, maxItems: items.length };
    }
    Object(properties, options = {}) {
        const optionalNames = Object.keys(properties).filter(name => {
            const candidate = properties[name];
            return candidate.modifier === Modifiers.OptionalModifier || candidate.modifier === Modifiers.ReadonlyOptionalModifier;
        });
        const requiredNames = Object.keys(properties).filter(name => !optionalNames.includes(name));
        return { ...options, kind: SchemaKind.ObjectKind, type: 'object', properties, required: requiredNames.length ? requiredNames : undefined };
    }
    Dict(item, options = {}) {
        return { ...options, kind: SchemaKind.DictKind, type: 'object', additionalProperties: item };
    }
    Array(items, options = {}) {
        return { ...options, kind: SchemaKind.ArrayKind, type: 'array', items };
    }
    Enum(item, options = {}) {
        const values = Object.keys(item).filter(key => isNaN(key)).map(key => item[key]);
        return { ...options, kind: SchemaKind.EnumKind, enum: values };
    }
    Literal(value, options = {}) {
        const type = reflect(value);
        if (type === 'unknown') throw Error(`Invalid literal value '${value}'`);
        return { ...options, kind: SchemaKind.LiteralKind, type, enum: [value] };
    }
    String(options = {}) {
        return { ...options, kind: SchemaKind.StringKind, type: 'string' };
    }
    RegEx(regex, options = {}) {
        return this.String({ ...options, pattern: regex.source });
    }
    Number(options = {}) {
        return { ...options, kind: SchemaKind.NumberKind, type: 'number' };
    }
    Integer(options = {}) {
        return { ...options, kind: SchemaKind.IntegerKind, type: 'integer' };
    }
    Boolean(options = {}) {
        return { ...options, kind: SchemaKind.BooleanKind, type: 'boolean' };
    }
    Null(options = {}) {
        return { ...options, kind: SchemaKind.NullKind, type: 'null' };
    }
    Unknown(options = {}) {
        return { ...options, kind: SchemaKind.UnknownKind };
    }
    Any(options = {}) {
        return { ...options, kind: SchemaKind.AnyKind };
    }
    Constructor(args, returns, options = {}) {
        return { ...options, kind: SchemaKind.ConstructorKind, type: 'constructor', arguments: args, returns };
    }
    Function(args, returns, options = {}) {
        return { ...options, kind: SchemaKind.FunctionKind, type: 'function', arguments: args, returns };
    }
    Promise(item, options = {}) {
        return { ...options, type: 'promise', kind: SchemaKind.PromiseKind, item };
    }
    Undefined(options = {}) {
        return { ...options, type: 'undefined', kind: SchemaKind.UndefinedKind };
    }
    Void(options = {}) {
        return { ...options, type: 'void', kind: SchemaKind.VoidKind };
    }
}

exports.TypeBuilder = TypeBuilder;
exports.Type = new TypeBuilder();
