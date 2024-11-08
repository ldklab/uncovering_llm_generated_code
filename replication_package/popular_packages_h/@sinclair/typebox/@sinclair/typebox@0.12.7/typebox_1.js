"use strict";

// Defining core and extended kinds of schemas as symbols
const ReadonlyOptionalModifier = Symbol('ReadonlyOptionalModifier');
const OptionalModifier = Symbol('OptionalModifier');
const ReadonlyModifier = Symbol('ReadonlyModifier');

const UnionKind = Symbol('UnionKind');
const IntersectKind = Symbol('IntersectKind');
const TupleKind = Symbol('TupleKind');
const ObjectKind = Symbol('ObjectKind');
const DictKind = Symbol('DictKind');
const ArrayKind = Symbol('ArrayKind');
const EnumKind = Symbol('EnumKind');
const LiteralKind = Symbol('LiteralKind');
const StringKind = Symbol('StringKind');
const NumberKind = Symbol('NumberKind');
const IntegerKind = Symbol('IntegerKind');
const BooleanKind = Symbol('BooleanKind');
const NullKind = Symbol('NullKind');
const UnknownKind = Symbol('UnknownKind');
const AnyKind = Symbol('AnyKind');

const ConstructorKind = Symbol('ConstructorKind');
const FunctionKind = Symbol('FunctionKind');
const PromiseKind = Symbol('PromiseKind');
const UndefinedKind = Symbol('UndefinedKind');
const VoidKind = Symbol('VoidKind');

// Helper to get the type of a value
function reflect(value) {
    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        default: return 'unknown';
    }
}

// TypeBuilder class that provides methods to create schemas
class TypeBuilder {
    ReadonlyOptional(item) {
        return { ...item, modifier: ReadonlyOptionalModifier };
    }
    Readonly(item) {
        return { ...item, modifier: ReadonlyModifier };
    }
    Optional(item) {
        return { ...item, modifier: OptionalModifier };
    }
    Intersect(items, options = {}) {
        return { ...options, kind: IntersectKind, allOf: items };
    }
    Union(items, options = {}) {
        return { ...options, kind: UnionKind, anyOf: items };
    }
    Tuple(items, options = {}) {
        return { ...options, kind: TupleKind, type: 'array', items, 
                 additionalItems: false, minItems: items.length, maxItems: items.length };
    }
    Object(properties, options = {}) {
        const propertyNames = Object.keys(properties);
        const optional = propertyNames.filter(name => {
            const candidate = properties[name];
            return candidate.modifier && 
                   (candidate.modifier === OptionalModifier || 
                    candidate.modifier === ReadonlyOptionalModifier);
        });
        const required = propertyNames.filter(name => !optional.includes(name));
        return { ...options, kind: ObjectKind, type: 'object', properties, required: required.length ? required : undefined };
    }
    Dict(item, options = {}) {
        return { ...options, kind: DictKind, type: 'object', additionalProperties: item };
    }
    Array(items, options = {}) {
        return { ...options, kind: ArrayKind, type: 'array', items };
    }
    Enum(item, options = {}) {
        const values = Object.keys(item).filter(key => isNaN(key)).map(key => item[key]);
        return { ...options, kind: EnumKind, enum: values };
    }
    Literal(value, options = {}) {
        const type = reflect(value);
        if (type === 'unknown') throw Error(`Invalid literal value '${value}'`);
        return { ...options, kind: LiteralKind, type, enum: [value] };
    }
    String(options = {}) {
        return { ...options, kind: StringKind, type: 'string' };
    }
    RegEx(regex, options = {}) {
        return this.String({ ...options, pattern: regex.source });
    }
    Number(options = {}) {
        return { ...options, kind: NumberKind, type: 'number' };
    }
    Integer(options = {}) {
        return { ...options, kind: IntegerKind, type: 'integer' };
    }
    Boolean(options = {}) {
        return { ...options, kind: BooleanKind, type: 'boolean' };
    }
    Null(options = {}) {
        return { ...options, kind: NullKind, type: 'null' };
    }
    Unknown(options = {}) {
        return { ...options, kind: UnknownKind };
    }
    Any(options = {}) {
        return { ...options, kind: AnyKind };
    }
    Constructor(args, returns, options = {}) {
        return { ...options, kind: ConstructorKind, type: 'constructor', arguments: args, returns };
    }
    Function(args, returns, options = {}) {
        return { ...options, kind: FunctionKind, type: 'function', arguments: args, returns };
    }
    Promise(item, options = {}) {
        return { ...options, type: 'promise', kind: PromiseKind, item };
    }
    Undefined(options = {}) {
        return { ...options, type: 'undefined', kind: UndefinedKind };
    }
    Void(options = {}) {
        return { ...options, type: 'void', kind: VoidKind };
    }
}

exports.TypeBuilder = TypeBuilder;
exports.Type = new TypeBuilder();
