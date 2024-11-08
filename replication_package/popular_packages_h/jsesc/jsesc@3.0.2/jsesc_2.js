'use strict';

const forOwn = (object, callback) => {
	for (const key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			callback(key, object[key]);
		}
	}
};

const extend = (destination, source) => {
	if (!source) return destination;
	forOwn(source, (key, value) => {
		destination[key] = value;
	});
	return destination;
};

const forEach = (array, callback) => {
	array.forEach(callback);
};

const fourHexEscape = (hex) => '\\u' + ('0000' + hex).slice(-4);

const hexadecimal = (code, lowercase) => {
	const hex = code.toString(16);
	return lowercase ? hex : hex.toUpperCase();
};

const isArray = Array.isArray;
const isBuffer = Buffer.isBuffer;
const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
const isString = (value) => typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
const isNumber = (value) => typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
const isFunction = (value) => typeof value === 'function';
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
	const json = options.json;

	if (json && argument && isFunction(argument.toJSON)) {
		argument = argument.toJSON();
	}

	const quote = options.quotes === 'double' ? '"' : (options.quotes === 'backtick' ? '`' : '\'');
	const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;

	let indent = options.indent.repeat(options.indentLevel);
	let oldIndent = '';
	let result;

	if (!isString(argument)) {
		if (isMap(argument) || isSet(argument) || isBuffer(argument)) {
			const type = isMap(argument) ? 'Map' : (isSet(argument) ? 'Set' : 'Buffer.from');
			const size = (isMap(argument) || isSet(argument)) ? argument.size : argument.length;
			if (size === 0) return `new ${type}()`;
			return `new ${type}(${jsesc(Array.from(argument), options)})`;
		}

		if (isArray(argument)) {
			result = [];
			options.wrap = true;
			const inline1 = options.__inline1__;
			if (inline1) {
				options.__inline1__ = false;
				options.__inline2__ = true;
			}
			if (!options.__inline2__) {
				oldIndent = indent;
				++options.indentLevel;
				indent = options.indent.repeat(options.indentLevel);
			}
			forEach(argument, (value) => {
				result.push(
					(options.compact || options.__inline2__ ? '' : indent) +
					jsesc(value, options)
				);
			});
			return options.__inline2__ ? `[${result.join(', ')}]` : `[${result.join(',' + '\n' + indent)}\n${indent.slice(0, -options.indent.length)}]`;
		}

		if (isNumber(argument)) {
			if (json) return JSON.stringify(argument);
			if (options.numbers === 'decimal') return String(argument);
			const hex = argument.toString(options.numbers === 'hexadecimal' ? 16 : (options.numbers === 'binary' ? 2 : 8));
			return options.numbers === 'hexadecimal' ? `0x${hex.toUpperCase()}` : (options.numbers === 'binary' ? `0b${hex}` : `0o${hex}`);
		}

		if (!isObject(argument)) {
			return JSON.stringify(argument) || 'null';
		}

		result = [];
		options.wrap = true;
		oldIndent = indent;
		++options.indentLevel;
		indent = options.indent.repeat(options.indentLevel);
		forOwn(argument, (key, value) => {
			result.push(
				(options.compact ? '' : indent) +
				jsesc(key, options) + ':' +
				(options.compact ? '' : ' ') +
				jsesc(value, options)
			);
		});
		return `{${result.join(',' + '\n' + indent)}}`;
	}

	result = argument.replace(regex, (char, surrogatePair, loneSurrogate, quoteChar, index, string) => {
		if (surrogatePair) {
			if (options.minimal) return surrogatePair;
			const first = surrogatePair.charCodeAt(0);
			const second = surrogatePair.charCodeAt(1);
			if (options.es6) {
				const codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				return `\\u{${hexadecimal(codePoint, options.lowercaseHex)}}`;
			}
			return `${fourHexEscape(hexadecimal(first, options.lowercaseHex))}${fourHexEscape(hexadecimal(second, options.lowercaseHex))}`;
		}

		if (loneSurrogate) {
			return fourHexEscape(hexadecimal(loneSurrogate.charCodeAt(0), options.lowercaseHex));
		}

		if (char === '\0' && !json && !regexDigit.test(string.charAt(index + 1))) {
			return '\\0';
		}

		if (quoteChar) {
			return quoteChar === quote || options.escapeEverything ? `\\${quoteChar}` : quoteChar;
		}

		if (regexSingleEscape.test(char)) {
			return singleEscapes[char];
		}

		if (options.minimal && !regexWhitespace.test(char)) {
			return char;
		}

		const hex = hexadecimal(char.charCodeAt(0), options.lowercaseHex);
		if (json || hex.length > 2) {
			return fourHexEscape(hex);
		}

		return `\\x${('00' + hex).slice(-2)}`;
	});

	if (quote === '`') {
		result = result.replace(/\$\{/g, '\\${');
	}

	if (options.isScriptContext) {
		result = result.replace(/<\/(script|style)/gi, '<\\/$1').replace(/<!--/g, json ? '\\u003C!--' : '\\x3C!--');
	}
	
	if (options.wrap) {
		result = quote + result + quote;
	}

	return result;
};

jsesc.version = '3.0.2';

module.exports = jsesc;
