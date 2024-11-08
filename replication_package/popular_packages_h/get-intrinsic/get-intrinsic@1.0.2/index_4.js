'use strict';

// Required modules
const hasSymbols = require('has-symbols')();
const bind = require('function-bind');
const hasOwn = require('has');

let $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // For IE 8 compatibility
	}
}

const $SyntaxError = SyntaxError;
const $TypeError = TypeError;
const ThrowTypeError = function() { throw new $TypeError(); };

/**
 * Evaluates JavaScript expressions and returns their constructor function.
 * Uses Function constructor and catches errors in case of invalid expressions.
 */
const getEvalledConstructor = (expressionSyntax) => {
	try {
		return Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

/**
 * Get the prototype of an object.
 * Falls back to `__proto__` if `getPrototypeOf` is unavailable.
 */
const getProto = Object.getPrototypeOf || function (x) { return x.__proto__; };

/**
 * Initializations for async generator functions and prototypes.
 */
const asyncGenFunction = getEvalledConstructor('async function* () {}');
const asyncGenFunctionPrototype = asyncGenFunction ? asyncGenFunction.prototype : undefined;
const asyncGenPrototype = asyncGenFunctionPrototype ? asyncGenFunctionPrototype.prototype : undefined;

/**
 * Determines the prototype of typed arrays if they are defined.
 */
const TypedArray = typeof Uint8Array !== 'undefined' ? getProto(Uint8Array) : undefined;

/**
 * A collection of fundamental intrinsic objects and their values. 
 * Utilizes `undefined` for non-existent objects in certain environments.
 */
const INTRINSICS = {
	'%AggregateError%': typeof AggregateError !== 'undefined' ? AggregateError : undefined,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer !== 'undefined' ? ArrayBuffer : undefined,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFunction%': getEvalledConstructor('async function () {}'),
	'%AsyncGenerator%': asyncGenFunctionPrototype,
	'%AsyncGeneratorFunction%': asyncGenFunction,
	'%AsyncIteratorPrototype%': asyncGenPrototype ? getProto(asyncGenPrototype) : undefined,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView !== 'undefined' ? DataView : undefined,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval,
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array !== 'undefined' ? Float32Array : undefined,
	'%Float64Array%': typeof Float64Array !== 'undefined' ? Float64Array : undefined,
	'%Function%': Function,
	'%GeneratorFunction%': getEvalledConstructor('function* () {}'),
	'%Int8Array%': typeof Int8Array !== 'undefined' ? Int8Array : undefined,
	'%Int16Array%': typeof Int16Array !== 'undefined' ? Int16Array : undefined,
	'%Int32Array%': typeof Int32Array !== 'undefined' ? Int32Array : undefined,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map !== 'undefined' ? Map : undefined,
	'%MapIteratorPrototype%': typeof Map !== 'undefined' && hasSymbols ? getProto(new Map()[Symbol.iterator]()) : undefined,
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise !== 'undefined' ? Promise : undefined,
	'%Proxy%': typeof Proxy !== 'undefined' ? Proxy : undefined,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect !== 'undefined' ? Reflect : undefined,
	'%RegExp%': RegExp,
	'%Set%': typeof Set !== 'undefined' ? Set : undefined,
	'%SetIteratorPrototype%': typeof Set !== 'undefined' && hasSymbols ? getProto(new Set()[Symbol.iterator]()) : undefined,
	'%String%': String,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': $gOPD ? (function () {
		try {
			arguments.callee;
			return ThrowTypeError;
		} catch (calleeThrows) {
			try {
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return ThrowTypeError;
			}
		}
	}()) : ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array !== 'undefined' ? Uint8Array : undefined,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray !== 'undefined' ? Uint8ClampedArray : undefined,
	'%Uint16Array%': typeof Uint16Array !== 'undefined' ? Uint16Array : undefined,
	'%Uint32Array%': typeof Uint32Array !== 'undefined' ? Uint32Array : undefined,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap !== 'undefined' ? WeakMap : undefined,
	'%WeakRef%': typeof WeakRef !== 'undefined' ? WeakRef : undefined,
	'%WeakSet%': typeof WeakSet !== 'undefined' ? WeakSet : undefined,
	'%BigInt%': typeof BigInt !== 'undefined' ? BigInt : undefined,
	'%FinalizationRegistry%': typeof FinalizationRegistry !== 'undefined' ? FinalizationRegistry : undefined,
	'%SharedArrayBuffer%': typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined,
	'%Atomics%': typeof Atomics !== 'undefined' ? Atomics : undefined,
};

/**
 * An object mapping legacy aliases to paths in the `INTRINSICS` object.
 */
const LEGACY_ALIASES = {
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype']
};

// Function bindings for array and string manipulation operations
const $concat = bind.call(Function.call, Array.prototype.concat);
const $spliceApply = bind.call(Function.apply, Array.prototype.splice);
const $replace = bind.call(Function.call, String.prototype.replace);
const $strSlice = bind.call(Function.call, String.prototype.slice);

/**
 * Converts a string representing a property path into an array of path segments.
 * Used for parsing intrinsic names into operable parts.
 */
const stringToPath = (string) => {
	const rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])[^\2]*?\2\])/g;
	const reEscapeChar = /\\(\\)?/g;

	const first = $strSlice(string, 0, 1);
	const last = $strSlice(string, -1);

	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}

	const result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});

	return result;
};

/**
 * Retrieves the foundational intrinsic object, if available, from the list of intrinsics.
 */
const getBaseIntrinsic = (name, allowMissing) => {
	let intrinsicName = name;
	let alias;

	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		const value = INTRINSICS[intrinsicName];

		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError(`intrinsic ${name} exists, but is not available. Please file an issue!`);
		}

		return { alias, name: intrinsicName, value };
	}

	throw new $SyntaxError(`intrinsic ${name} does not exist!`);
};

/**
 * Main function to retrieve intrinsic objects or functions.
 */
module.exports = function GetIntrinsic(name, allowMissing = false) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	const parts = stringToPath(name);
	const intrinsicBaseName = parts.length > 0 ? parts[0] : '';
	let intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	let intrinsicRealName = intrinsic.name;
	let value = intrinsic.value;
	let skipFurtherCaching = false;

	const alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (let i = 1, isOwn = true; i < parts.length; i += 1) {
		const part = parts[i];
		const first = $strSlice(part, 0, 1);
		const last = $strSlice(part, -1);
		if ((first === '"' || first === "'" || last === '"' || last === "'") && first !== last) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}

		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += `.${part}`;
		intrinsicRealName = `%${intrinsicBaseName}%`;

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError(`base intrinsic for ${name} exists, but the property is not available.`);
				}
				return undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				const desc = $gOPD(value, part);
				isOwn = !!desc;

				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}

	return value;
};
