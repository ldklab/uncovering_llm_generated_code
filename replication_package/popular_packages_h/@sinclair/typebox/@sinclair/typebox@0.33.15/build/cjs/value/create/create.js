"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueCreateError = void 0;
exports.Create = Create;
const index_1 = require("../guard/index");
const index_2 = require("../check/index");
const index_3 = require("../clone/index");
const index_4 = require("../deref/index");
const index_5 = require("../../type/template-literal/index");
const index_6 = require("../../type/patterns/index");
const index_7 = require("../../type/registry/index");
const index_8 = require("../../type/symbols/index");
const index_9 = require("../../type/error/index");
const guard_1 = require("../guard/guard");
// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class ValueCreateError extends index_9.TypeBoxError {
    constructor(schema, message) {
        super(message);
        this.schema = schema;
    }
}
exports.ValueCreateError = ValueCreateError;
// ------------------------------------------------------------------
// Default
// ------------------------------------------------------------------
function FromDefault(value) {
    return (0, guard_1.IsFunction)(value) ? value() : (0, index_3.Clone)(value);
}
// ------------------------------------------------------------------
// Create
// ------------------------------------------------------------------
function FromAny(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return {};
    }
}
function FromArray(schema, references) {
    if (schema.uniqueItems === true && !(0, index_1.HasPropertyKey)(schema, 'default')) {
        throw new ValueCreateError(schema, 'Array with the uniqueItems constraint requires a default value');
    }
    else if ('contains' in schema && !(0, index_1.HasPropertyKey)(schema, 'default')) {
        throw new ValueCreateError(schema, 'Array with the contains constraint requires a default value');
    }
    else if ('default' in schema) {
        return FromDefault(schema.default);
    }
    else if (schema.minItems !== undefined) {
        return Array.from({ length: schema.minItems }).map((item) => {
            return Visit(schema.items, references);
        });
    }
    else {
        return [];
    }
}
function FromAsyncIterator(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return (async function* () { })();
    }
}
function FromBigInt(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return BigInt(0);
    }
}
function FromBoolean(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return false;
    }
}
function FromConstructor(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        const value = Visit(schema.returns, references);
        if (typeof value === 'object' && !Array.isArray(value)) {
            return class {
                constructor() {
                    for (const [key, val] of Object.entries(value)) {
                        const self = this;
                        self[key] = val;
                    }
                }
            };
        }
        else {
            return class {
            };
        }
    }
}
function FromDate(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimumTimestamp !== undefined) {
        return new Date(schema.minimumTimestamp);
    }
    else {
        return new Date();
    }
}
function FromFunction(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return () => Visit(schema.returns, references);
    }
}
function FromInteger(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimum !== undefined) {
        return schema.minimum;
    }
    else {
        return 0;
    }
}
function FromIntersect(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        // --------------------------------------------------------------
        // Note: The best we can do here is attempt to instance each
        // sub type and apply through object assign. For non-object
        // sub types, we just escape the assignment and just return
        // the value. In the latter case, this is typically going to
        // be a consequence of an illogical intersection.
        // --------------------------------------------------------------
        const value = schema.allOf.reduce((acc, schema) => {
            const next = Visit(schema, references);
            return typeof next === 'object' ? { ...acc, ...next } : next;
        }, {});
        if (!(0, index_2.Check)(schema, references, value))
            throw new ValueCreateError(schema, 'Intersect produced invalid value. Consider using a default value.');
        return value;
    }
}
function FromIterator(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return (function* () { })();
    }
}
function FromLiteral(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return schema.const;
    }
}
function FromNever(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'Never types cannot be created. Consider using a default value.');
    }
}
function FromNot(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'Not types must have a default value');
    }
}
function FromNull(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return null;
    }
}
function FromNumber(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minimum !== undefined) {
        return schema.minimum;
    }
    else {
        return 0;
    }
}
function FromObject(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        const required = new Set(schema.required);
        const Acc = {};
        for (const [key, subschema] of Object.entries(schema.properties)) {
            if (!required.has(key))
                continue;
            Acc[key] = Visit(subschema, references);
        }
        return Acc;
    }
}
function FromPromise(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Promise.resolve(Visit(schema.item, references));
    }
}
function FromRecord(schema, references) {
    const [keyPattern, valueSchema] = Object.entries(schema.patternProperties)[0];
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (!(keyPattern === index_6.PatternStringExact || keyPattern === index_6.PatternNumberExact)) {
        const propertyKeys = keyPattern.slice(1, keyPattern.length - 1).split('|');
        const Acc = {};
        for (const key of propertyKeys)
            Acc[key] = Visit(valueSchema, references);
        return Acc;
    }
    else {
        return {};
    }
}
function FromRef(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Visit((0, index_4.Deref)(schema, references), references);
    }
}
function FromRegExp(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new ValueCreateError(schema, 'RegExp types cannot be created. Consider using a default value.');
    }
}
function FromString(schema, references) {
    if (schema.pattern !== undefined) {
        if (!(0, index_1.HasPropertyKey)(schema, 'default')) {
            throw new ValueCreateError(schema, 'String types with patterns must specify a default value');
        }
        else {
            return FromDefault(schema.default);
        }
    }
    else if (schema.format !== undefined) {
        if (!(0, index_1.HasPropertyKey)(schema, 'default')) {
            throw new ValueCreateError(schema, 'String types with formats must specify a default value');
        }
        else {
            return FromDefault(schema.default);
        }
    }
    else {
        if ((0, index_1.HasPropertyKey)(schema, 'default')) {
            return FromDefault(schema.default);
        }
        else if (schema.minLength !== undefined) {
            // prettier-ignore
            return Array.from({ length: schema.minLength }).map(() => ' ').join('');
        }
        else {
            return '';
        }
    }
}
function FromSymbol(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if ('value' in schema) {
        return Symbol.for(schema.value);
    }
    else {
        return Symbol();
    }
}
function FromTemplateLiteral(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    if (!(0, index_5.IsTemplateLiteralFinite)(schema))
        throw new ValueCreateError(schema, 'Can only create template literals that produce a finite variants. Consider using a default value.');
    const generated = (0, index_5.TemplateLiteralGenerate)(schema);
    return generated[0];
}
function FromThis(schema, references) {
    if (recursiveDepth++ > recursiveMaxDepth)
        throw new ValueCreateError(schema, 'Cannot create recursive type as it appears possibly infinite. Consider using a default.');
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return Visit((0, index_4.Deref)(schema, references), references);
    }
}
function FromTuple(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    if (schema.items === undefined) {
        return [];
    }
    else {
        return Array.from({ length: schema.minItems }).map((_, index) => Visit(schema.items[index], references));
    }
}
function FromUndefined(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return undefined;
    }
}
function FromUnion(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.anyOf.length === 0) {
        throw new Error('ValueCreate.Union: Cannot create Union with zero variants');
    }
    else {
        return Visit(schema.anyOf[0], references);
    }
}
function FromUint8Array(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else if (schema.minByteLength !== undefined) {
        return new Uint8Array(schema.minByteLength);
    }
    else {
        return new Uint8Array(0);
    }
}
function FromUnknown(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return {};
    }
}
function FromVoid(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        return void 0;
    }
}
function FromKind(schema, references) {
    if ((0, index_1.HasPropertyKey)(schema, 'default')) {
        return FromDefault(schema.default);
    }
    else {
        throw new Error('User defined types must specify a default value');
    }
}
function Visit(schema, references) {
    const references_ = (0, index_4.Pushref)(schema, references);
    const schema_ = schema;
    switch (schema_[index_8.Kind]) {
        case 'Any':
            return FromAny(schema_, references_);
        case 'Array':
            return FromArray(schema_, references_);
        case 'AsyncIterator':
            return FromAsyncIterator(schema_, references_);
        case 'BigInt':
            return FromBigInt(schema_, references_);
        case 'Boolean':
            return FromBoolean(schema_, references_);
        case 'Constructor':
            return FromConstructor(schema_, references_);
        case 'Date':
            return FromDate(schema_, references_);
        case 'Function':
            return FromFunction(schema_, references_);
        case 'Integer':
            return FromInteger(schema_, references_);
        case 'Intersect':
            return FromIntersect(schema_, references_);
        case 'Iterator':
            return FromIterator(schema_, references_);
        case 'Literal':
            return FromLiteral(schema_, references_);
        case 'Never':
            return FromNever(schema_, references_);
        case 'Not':
            return FromNot(schema_, references_);
        case 'Null':
            return FromNull(schema_, references_);
        case 'Number':
            return FromNumber(schema_, references_);
        case 'Object':
            return FromObject(schema_, references_);
        case 'Promise':
            return FromPromise(schema_, references_);
        case 'Record':
            return FromRecord(schema_, references_);
        case 'Ref':
            return FromRef(schema_, references_);
        case 'RegExp':
            return FromRegExp(schema_, references_);
        case 'String':
            return FromString(schema_, references_);
        case 'Symbol':
            return FromSymbol(schema_, references_);
        case 'TemplateLiteral':
            return FromTemplateLiteral(schema_, references_);
        case 'This':
            return FromThis(schema_, references_);
        case 'Tuple':
            return FromTuple(schema_, references_);
        case 'Undefined':
            return FromUndefined(schema_, references_);
        case 'Union':
            return FromUnion(schema_, references_);
        case 'Uint8Array':
            return FromUint8Array(schema_, references_);
        case 'Unknown':
            return FromUnknown(schema_, references_);
        case 'Void':
            return FromVoid(schema_, references_);
        default:
            if (!index_7.TypeRegistry.Has(schema_[index_8.Kind]))
                throw new ValueCreateError(schema_, 'Unknown type');
            return FromKind(schema_, references_);
    }
}
// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
const recursiveMaxDepth = 512;
let recursiveDepth = 0;
/** Creates a value from the given schema */
function Create(...args) {
    recursiveDepth = 0;
    return args.length === 2 ? Visit(args[0], args[1]) : Visit(args[0], []);
}