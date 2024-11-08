'use strict';

let undefined;
const $Function = Function;
const { getOwnPropertyDescriptor: $gOPD } = Object;

// Import error classes
const $Error = require('es-errors');
const $EvalError = require('es-errors/eval');
const $RangeError = require('es-errors/range');
const $ReferenceError = require('es-errors/ref');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const $URIError = require('es-errors/uri');

// Import utility modules
const hasSymbols = require('has-symbols')();
const hasProto = require('has-proto')();
const bind = require('function-bind');
const hasOwn = require('hasown');

// Function bindings
const $concat = bind.call(Function.call, Array.prototype.concat);
const $spliceApply = bind.call(Function.apply, Array.prototype.splice);
const $replace = bind.call(Function.call, String.prototype.replace);
const $strSlice = bind.call(Function.call, String.prototype.slice);
const $exec = bind.call(Function.call, RegExp.prototype.exec);

// Helper function to evaluate expressions safely
const getEvalledConstructor = (expressionSyntax) => {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

// Determine TypeError throwing need
let throwTypeError = () => { throw new $TypeError(); };
let ThrowTypeError = throwTypeError;

if ($gOPD) {
	try {
		// Attempt to use .callee, which throws in modern contexts
		arguments.callee;
		ThrowTypeError = throwTypeError;
	} catch (e) {
		ThrowTypeError = ($gOPD(arguments, 'callee') || {}).get || throwTypeError;
	}
}

// Helper: get prototype
const getProto = Object.getPrototypeOf || (
	hasProto ? (x) => x.__proto__ : null // eslint-disable-line no-proto
);

// Cache for evaluated constructs
const needsEval = {};

// TypedArray detection
const TypedArray = (typeof Uint8Array !== 'undefined' && getProto) ? getProto(Uint8Array) : undefined;

// Object of intrinsics
const INTRINSICS = {
	__proto__: null,
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': $Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': $EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': $RangeError,
	'%ReferenceError%': $ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': $URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

// If we can determine the prototype of an error, cache it
if (getProto) {
	try {
		null.error; // forcing a mistake
	} catch (e) {
		const errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

// Dynamically evaluated intrinsics
const doEval = (name) => {
	let value;
	switch (name) {
		case '%AsyncFunction%':
			value = getEvalledConstructor('async function(){}');
			break;
		case '%GeneratorFunction%':
			value = getEvalledConstructor('function*(){}');
			break;
		case '%AsyncGeneratorFunction%':
			value = getEvalledConstructor('async function*(){}');
			break;
		case '%AsyncGenerator%':
			const fn = doEval('%AsyncGeneratorFunction%');
			value = fn ? fn.prototype : undefined;
			break;
		case '%AsyncIteratorPrototype%':
			const gen = doEval('%AsyncGenerator%');
			value = gen && getProto ? getProto(gen.prototype) : undefined;
			break;
		default:
			value = undefined;
	}

	INTRINSICS[name] = value;
	return value;
};

// Legacy intrinsic aliases
const LEGACY_ALIASES = {
	__proto__: null,
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

// Regular expressions to parse property paths
const rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
const reEscapeChar = /\\(\\)?/g;

const stringToPath = (string) => {
	const result = [];
	if ($strSlice(string, 0, 1) === '%' && $strSlice(string, -1) !== '%') {
		throw new $SyntaxError('intrinsic must start and end with `%`');
	}
	let match;
	while ((match = rePropName.exec(string)) !== null) {
		const [, number, quote, subString] = match;
		result.push(quote ? $replace(subString, reEscapeChar, '$1') : number || match[0]);
	}
	return result;
};

// Retrieve base intrinsic data
const getBaseIntrinsic = (name, allowMissing) => {
	const alias = LEGACY_ALIASES[name];
	const intrinsicName = alias ? `%${alias[0]}%` : name;
	let value = INTRINSICS[intrinsicName] || (needsEval === INTRINSICS[intrinsicName] && doEval(intrinsicName));
	if (typeof value === 'undefined' && !allowMissing) {
		throw new $TypeError(`intrinsic "${name}" exists but is not available.`);
	}
	return { alias, name: intrinsicName, value };
};

// Main export function to retrieve intrinsic
module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || !name) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}
	if (!$exec(/^%?[^%]*%?$/, name)) {
		throw new $SyntaxError('`%` may only appear at the beginning and end of the intrinsic name');
	}
	let intrinsicBaseName, parts = stringToPath(name);
	if (!parts.length) {
		throw new $SyntaxError('intrinsic name parse results in empty parts');
	}
	intrinsicBaseName = parts[0];
	let { alias, value } = getBaseIntrinsic(`%${intrinsicBaseName}%`, allowMissing);

	for (let i = 1, part; i < parts.length; i++) {
		part = parts[i];
		if ((part === 'constructor') && !alias) continue;

		let isOwn = $gOPD && (i + 1) >= parts.length ? $gOPD(value, part) : hasOwn(value, part);
		if (!value || !isOwn) {
			if (!allowMissing) {
				throw new $TypeError(`property "${part}" of intrinsic "${name}" does not exist.`);
			}
			return undefined;
		}
		value = value[part];
		if ($gOPD && i + 1 === parts.length && isOwn && $gOPD(value, part)) {
			const desc = $gOPD(value, part);
			if (desc.get) value = desc.get;
		}
		if (alias && parts.length === i + 1) {
			INTRINSICS[`%${intrinsicBaseName}.${part}%`] = value;
		}
		intrinsicBaseName += `.${part}`;
	}
	return value;
};
