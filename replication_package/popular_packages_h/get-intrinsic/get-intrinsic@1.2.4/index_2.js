'use strict';

const $Error = require('es-errors');
const $EvalError = require('es-errors/eval');
const $RangeError = require('es-errors/range');
const $ReferenceError = require('es-errors/ref');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const $URIError = require('es-errors/uri');

const getEvalledConstructor = function (expressionSyntax) {
    try {
        return Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    } catch (e) {
        return undefined;
    }
};

let $gOPD = Object.getOwnPropertyDescriptor;
try {
    if ($gOPD) $gOPD({}, '');
} catch (e) {
    $gOPD = null;
}

const throwTypeError = () => { throw new $TypeError(); };
const ThrowTypeError = $gOPD ? (function () {
    try {
        arguments.callee;
        return throwTypeError;
    } catch {
        try {
            return $gOPD(arguments, 'callee').get;
        } catch {
            return throwTypeError;
        }
    }
}()) : throwTypeError;

const hasSymbols = require('has-symbols')();
const hasProto = require('has-proto')();
const getProto = Object.getPrototypeOf || (hasProto ? x => x.__proto__ : null);

const needsEval = {};
const TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

const INTRINSICS = {
    __proto__: null,
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
    '%AsyncFunction%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
    '%Date%': Date,
    '%Error%': $Error,
    '%eval%': eval,
    '%EvalError%': $EvalError,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
    '%Function%': Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
    '%JSON%': typeof JSON === 'object' ? JSON : undefined,
    '%Map%': typeof Map === 'undefined' ? undefined : Map,
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': Object,
    '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
    '%RangeError%': $RangeError,
    '%ReferenceError%': $ReferenceError,
    '%RegExp%': RegExp,
    '%String%': String,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypeError%': $TypeError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
    '%Symbol%': hasSymbols ? Symbol : undefined,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap
};

if (getProto) {
    try {
        null.error;
    } catch (e) {
        INTRINSICS['%Error.prototype%'] = getProto(getProto(e));
    }
}

const doEval = function (name) {
    let value;
    if (name === '%AsyncFunction%') {
        value = getEvalledConstructor('async function () {}');
    } else if (name === '%GeneratorFunction%') {
        value = getEvalledConstructor('function* () {}');
    } else if (name === '%AsyncGeneratorFunction%') {
        value = getEvalledConstructor('async function* () {}');
    }
    INTRINSICS[name] = value;
    return value;
};

const LEGACY_ALIASES = {
    __proto__: null,
    '%ArrayPrototype%': ['Array', 'prototype'],
    '%BooleanPrototype%': ['Boolean', 'prototype'],
    '%FunctionPrototype%': ['Function', 'prototype'],
    '%NumberPrototype%': ['Number', 'prototype'],
    '%ObjectPrototype%': ['Object', 'prototype'],
    '%RegExpPrototype%': ['RegExp', 'prototype'],
    '%StringPrototype%': ['String', 'prototype'],
    '%SymbolPrototype%': ['Symbol', 'prototype'],
    '%TypeErrorPrototype%': ['TypeError', 'prototype'],
    '%ErrorPrototype%': ['Error', 'prototype']
};

const bind = require('function-bind');
const hasOwn = require('hasown');
const $concat = bind.call(Function.call, Array.prototype.concat);
const $spliceApply = bind.call(Function.apply, Array.prototype.splice);
const $replace = bind.call(Function.call, String.prototype.replace);
const $strSlice = bind.call(Function.call, String.prototype.slice);
const $exec = bind.call(Function.call, RegExp.prototype.exec);

const rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
const reEscapeChar = /\\(\\)?/g;

const stringToPath = function (string) {
    const first = $strSlice(string, 0, 1);
    const last = $strSlice(string, -1);
    if ((first === '%' && last !== '%') || (last === '%' && first !== '%')) {
        throw new $SyntaxError('Invalid intrinsic syntax');
    }
    const result = [];
    $replace(string, rePropName, function (match, number, quote, subString) {
        result.push(quote ? $replace(subString, reEscapeChar, '$1') : number || match);
    });
    return result;
};

const getBaseIntrinsic = function (name, allowMissing) {
    let intrinsicName = name;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        const alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = '%' + alias[0] + '%';
    }

    if (hasOwn(INTRINSICS, intrinsicName)) {
        let value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
            value = doEval(intrinsicName);
        }
        if (typeof value === 'undefined' && !allowMissing) {
            throw new $TypeError(`Intrinsic ${name} is not available.`);
        }
        return { name: intrinsicName, value: value };
    }
    throw new $SyntaxError(`Intrinsic ${name} does not exist!`);
};

module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || name.length === 0) {
        throw new $TypeError('Intrinsic name must be a non-empty string');
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
        throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError('Invalid intrinsic name syntax');
    }
    const parts = stringToPath(name);
    let intrinsicBaseName = parts.length > 0 ? parts[0] : '';
    let { name: intrinsicRealName, value } = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    let skipFurtherCaching = false;

    for (let i = 1, isOwn = true; i < parts.length; i += 1) {
        const part = parts[i];
        const first = $strSlice(part, 0, 1);
        const last = $strSlice(part, -1);
        if (([first, last].includes('"') || [first, last].includes('`') || [first, last].includes("'")) && first !== last) {
            throw new $SyntaxError('Property names with quotes must have matching quotes');
        }
        if (part === 'constructor' || !isOwn) {
            skipFurtherCaching = true;
        }
        intrinsicBaseName += '.' + part;
        intrinsicRealName = '%' + intrinsicBaseName + '%';

        if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
        } else if (value != null && (part in value || $gOPD && (i + 1) >= parts.length)) {
            const desc = $gOPD ? $gOPD(value, part) : undefined;
            isOwn = desc ? 'value' in desc : hasOwn(value, part);
            value = desc && ('get' in desc && !('originalValue' in desc.get)) ? desc.get : value[part];
            if (isOwn && !skipFurtherCaching) {
                INTRINSICS[intrinsicRealName] = value;
            }
        }
    }
    return value;
};
