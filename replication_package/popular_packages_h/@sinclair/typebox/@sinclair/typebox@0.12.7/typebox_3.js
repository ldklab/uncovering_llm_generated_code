"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const TypeSymbols = {
    ReadonlyOptionalModifier: Symbol('ReadonlyOptionalModifier'),
    OptionalModifier: Symbol('OptionalModifier'),
    ReadonlyModifier: Symbol('ReadonlyModifier'),
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
        return { ...item, modifier: TypeSymbols.ReadonlyOptionalModifier };
    }
    
    Readonly(item) {
        return { ...item, modifier: TypeSymbols.ReadonlyModifier };
    }
    
    Optional(item) {
        return { ...item, modifier: TypeSymbols.OptionalModifier };
    }
    
    Intersect(items, options = {}) {
        return { ...options, kind: TypeSymbols.IntersectKind, allOf: items };
    }
    
    Union(items, options = {}) {
        return { ...options, kind: TypeSymbols.UnionKind, anyOf: items };
    }
    
    Tuple(items, options = {}) {
        const additionalItems = false;
        const minItems = items.length;
        const maxItems = items.length;
        return { ...options, kind: TypeSymbols.TupleKind, type: 'array', items, additionalItems, minItems, maxItems };
    }
    
    Object(properties, options = {}) {
        const property_names = Object.keys(properties);
        const optional = property_names.filter(name => {
            const candidate = properties[name];
            return candidate.modifier === TypeSymbols.OptionalModifier || candidate.modifier === TypeSymbols.ReadonlyOptionalModifier;
        });
        const required = property_names.filter(name => !optional.includes(name));
        return { ...options, kind: TypeSymbols.ObjectKind, type: 'object', properties, required: required.length ? required : undefined };
    }
    
    Dict(item, options = {}) {
        return { ...options, kind: TypeSymbols.DictKind, type: 'object', additionalProperties: item };
    }
    
    Array(items, options = {}) {
        return { ...options, kind: TypeSymbols.ArrayKind, type: 'array', items };
    }
    
    Enum(item, options = {}) {
        const values = Object.keys(item).filter(key => isNaN(key)).map(key => item[key]);
        return { ...options, kind: TypeSymbols.EnumKind, enum: values };
    }
    
    Literal(value, options = {}) {
        const type = reflect(value);
        if (type === 'unknown') {
            throw Error(`Invalid literal value '${value}'`);
        }
        return { ...options, kind: TypeSymbols.LiteralKind, type, enum: [value] };
    }
    
    String(options = {}) {
        return { ...options, kind: TypeSymbols.StringKind, type: 'string' };
    }
    
    RegEx(regex, options = {}) {
        return this.String({ ...options, pattern: regex.source });
    }
    
    Number(options = {}) {
        return { ...options, kind: TypeSymbols.NumberKind, type: 'number' };
    }
    
    Integer(options = {}) {
        return { ...options, kind: TypeSymbols.IntegerKind, type: 'integer' };
    }
    
    Boolean(options = {}) {
        return { ...options, kind: TypeSymbols.BooleanKind, type: 'boolean' };
    }
    
    Null(options = {}) {
        return { ...options, kind: TypeSymbols.NullKind, type: 'null' };
    }
    
    Unknown(options = {}) {
        return { ...options, kind: TypeSymbols.UnknownKind };
    }
    
    Any(options = {}) {
        return { ...options, kind: TypeSymbols.AnyKind };
    }
    
    Constructor(args, returns, options = {}) {
        return { ...options, kind: TypeSymbols.ConstructorKind, type: 'constructor', arguments: args, returns };
    }
    
    Function(args, returns, options = {}) {
        return { ...options, kind: TypeSymbols.FunctionKind, type: 'function', arguments: args, returns };
    }
    
    Promise(item, options = {}) {
        return { ...options, type: 'promise', kind: TypeSymbols.PromiseKind, item };
    }
    
    Undefined(options = {}) {
        return { ...options, type: 'undefined', kind: TypeSymbols.UndefinedKind };
    }
    
    Void(options = {}) {
        return { ...options, type: 'void', kind: TypeSymbols.VoidKind };
    }
}

exports.TypeBuilder = TypeBuilder;
exports.Type = new TypeBuilder();
