'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const forOwn = (obj, callback) => {
	for (const key in obj) {
		if (hasOwnProperty.call(obj, key)) {
			callback(key, obj[key]);
		}
	}
};

const extend = (destination, source) => {
	forOwn(source, (key, value) => destination[key] = value);
	return destination;
};

const forEach = (array, callback) => {
	for (let i = 0; i < array.length; i++) {
		callback(array[i]);
	}
};

const fourHexEscape = (hex) => '\\u' + ('0000' + hex).slice(-4);

const hexadecimal = (code, lowercase) => {
	const hex = code.toString(16);
	return lowercase ? hex : hex.toUpperCase();
};

const isFunction = (value) => typeof value === 'function';
const isArray = Array.isArray;
const isBuffer = (value) => typeof Buffer === 'function' && Buffer.isBuffer(value);
const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
const isString = (value) => typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
const isNumber = (value) => typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
const isMap = (value) => Object.prototype.toString.call(value) === '[object Map]';
const isSet = (value) => Object.prototype.toString.call(value) === '[object Set]';

const singleEscapes = {
	'\\': '\\\\',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\r': '\\r',
	'\t': '\\t'
};
const regexSingleEscape = /[\\\b\f\n\r\t]/;
const regexDigit = /[0-9]/;
const regexWhitespace = /[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
const escapeEverythingRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^]/g;
const escapeNonAsciiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^ !#-&\(-\[\]-_a-~]/g;

const jsesc = (argument, options) => {
	const increaseIndentation = () => {
		oldIndent = indent;
		options.indentLevel++;
		indent = options.indent.repeat(options.indentLevel);
	};
	
	const defaults = {
		escapeEverything: false,
		minimal: false,
		isScriptContext: false,
		quotes: 'single',
		wrap: false,
		es6: false,
		json: false,
		compact: true,
		lowercaseHex: false,
		numbers: 'decimal',
		indent: '\t',
		indentLevel: 0,
		__inline1__: false,
		__inline2__: false
	};

	options = extend(defaults, options);

	if (options.quotes !== 'single' && options.quotes !== 'double' && options.quotes !== 'backtick') {
		options.quotes = 'single';
	}

	const quote = options.quotes === 'double' ? '"' : (options.quotes === 'backtick' ? '`' : '\'');
	const compact = options.compact;
	const lowercaseHex = options.lowercaseHex;
	let indent = options.indent.repeat(options.indentLevel);
	let oldIndent = '';
	const inline1 = options.__inline1__;
	const inline2 = options.__inline2__;
	const newLine = compact ? '' : '\n';
	let result;
	let isEmpty = true;
	const useBinNumbers = options.numbers === 'binary';
	const useOctNumbers = options.numbers === 'octal';
	const useDecNumbers = options.numbers === 'decimal';
	const useHexNumbers = options.numbers === 'hexadecimal';

	if (options.json && argument && isFunction(argument.toJSON)) {
		argument = argument.toJSON();
	}

	if (!isString(argument)) {
		if (isMap(argument)) {
			if (argument.size === 0) return 'new Map()';
			if (!compact) {
				options.__inline1__ = true;
				options.__inline2__ = false;
			}
			return 'new Map(' + jsesc(Array.from(argument), options) + ')';
		}
		if (isSet(argument)) {
			if (argument.size === 0) return 'new Set()';
			return 'new Set(' + jsesc(Array.from(argument), options) + ')';
		}
		if (isBuffer(argument)) {
			if (argument.length === 0) return 'Buffer.from([])';
			return 'Buffer.from(' + jsesc(Array.from(argument), options) + ')';
		}
		if (isArray(argument)) {
			result = [];
			options.wrap = true;
			if (inline1) {
				options.__inline1__ = false;
				options.__inline2__ = true;
			}
			if (!inline2) increaseIndentation();
			forEach(argument, (value) => {
				isEmpty = false;
				if (inline2) options.__inline2__ = false;
				result.push((compact || inline2 ? '' : indent) + jsesc(value, options));
			});
			if (isEmpty) return '[]';
			if (inline2) return '[' + result.join(', ') + ']';
			return '[' + newLine + result.join(',' + newLine) + newLine + (compact ? '' : oldIndent) + ']';
		}
		if (isNumber(argument)) {
			if (options.json) return JSON.stringify(argument);
			if (useDecNumbers) return String(argument);
			if (useHexNumbers) return '0x' + hexadecimal(argument, lowercaseHex);
			if (useBinNumbers) return '0b' + argument.toString(2);
			if (useOctNumbers) return '0o' + argument.toString(8);
		}
		if (!isObject(argument)) {
			if (options.json) return JSON.stringify(argument) || 'null';
			return String(argument);
		}
		result = [];
		options.wrap = true;
		increaseIndentation();
		forOwn(argument, (key, value) => {
			isEmpty = false;
			result.push((compact ? '' : indent) + jsesc(key, options) + ':' + (compact ? '' : ' ') + jsesc(value, options));
		});
		if (isEmpty) return '{}';
		return '{' + newLine + result.join(',' + newLine) + newLine + (compact ? '' : oldIndent) + '}';
	}

	const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;
	result = argument.replace(regex, (char, pair, lone, quoteChar, index, string) => {
		if (pair) {
			if (options.minimal) return pair;
			const first = pair.charCodeAt(0);
			const second = pair.charCodeAt(1);
			if (options.es6) {
				const codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				const hex = hexadecimal(codePoint, lowercaseHex);
				return '\\u{' + hex + '}';
			}
			return fourHexEscape(hexadecimal(first, lowercaseHex)) + fourHexEscape(hexadecimal(second, lowercaseHex));
		}

		if (lone) {
			return fourHexEscape(hexadecimal(lone.charCodeAt(0), lowercaseHex));
		}

		if (char === '\0' && !options.json && !regexDigit.test(string.charAt(index + 1))) {
			return '\\0';
		}

		if (quoteChar) {
			if (quoteChar === quote || options.escapeEverything) return '\\' + quoteChar;
			return quoteChar;
		}

		if (regexSingleEscape.test(char)) {
			return singleEscapes[char];
		}

		if (options.minimal && !regexWhitespace.test(char)) {
			return char;
		}

		const hex = hexadecimal(char.charCodeAt(0), lowercaseHex);
		if (options.json || hex.length > 2) {
			return fourHexEscape(hex);
		}

		return '\\x' + ('00' + hex).slice(-2);
	});

	if (quote === '`') {
		result = result.replace(/\$\{/g, '\\${');
	}
	if (options.isScriptContext) {
		result = result.replace(/<\/(script|style)/gi, '<\\/$1').replace(/<!--/g, options.json ? '\\u003C!--' : '\\x3C!--');
	}
	if (options.wrap) {
		result = quote + result + quote;
	}
	return result;
};

jsesc.version = '3.0.2';

module.exports = jsesc;
