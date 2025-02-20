(function(root) {
	const freeExports = typeof exports == 'object' && exports;
	const freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
	const freeGlobal = typeof global == 'object' && global;

	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	const regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	const regexAsciiWhitelist = /[\x01-\x7F]/g;
	const regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
	const regexEncodeNonAscii = /<\u20D2|=\u20E5|...\uD835\uDD6B]/g; // Truncated for brevity

	const encodeMap = {'\xAD': 'shy', '\u200C': 'zwnj', ...}; // Truncated for brevity
	const regexEscape = /["&'<>`]/g;
	const escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		'>': '&gt;',
		'`': '&#x60;'
	};

	const regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	const regexInvalidRawCodePoint = /[\0-\x08\x0B...)[\uDC00-\uDFFF]/; // Truncated
	const regexDecode = /&(CounterClockwiseContourIntegral|...)/g; // Truncated for brevity
	const decodeMap = {'aacute':'\xE1', 'Aacute':'\xC1', ...}; // Truncated
	const decodeMapLegacy = {'aacute':'\xE1', 'Aacute':'\xC1', ...}; // Truncated
	const decodeMapNumeric = {'0':'\uFFFD', '128':'\u20AC', ...}; // Truncated
	const invalidReferenceCodePoints = [1, 2, 3, ...]; // Truncated

	const stringFromCharCode = String.fromCharCode;

	const object = {};
	const hasOwnProperty = object.hasOwnProperty;
	const has = (object, propertyName) => hasOwnProperty.call(object, propertyName);

	const contains = (array, value) => {
		let index = -1;
		const length = array.length;
		while (++index < length) {
			if (array[index] == value) return true;
		}
		return false;
	};

	const merge = (options, defaults) => {
		if (!options) return defaults;
		const result = {};
		for (const key in defaults) {
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	const codePointToSymbol = (codePoint, strict) => {
		let output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			if (strict) parseError('character reference outside the permissible Unicode range');
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) parseError('disallowed character reference');
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	const hexEscape = codePoint => '&#x' + codePoint.toString(16).toUpperCase() + ';';
	const decEscape = codePoint => '&#' + codePoint + ';';
	const parseError = message => { throw Error('Parse error: ' + message); };

	const encode = (string, options) => {
		options = merge(options, encode.options);
		const strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) parseError('forbidden code point');
		const encodeEverything = options.encodeEverything;
		const useNamedReferences = options.useNamedReferences;
		const allowUnsafeSymbols = options.allowUnsafeSymbols;
		const escapeCodePoint = options.decimal ? decEscape : hexEscape;

		const escapeBmpSymbol = symbol => escapeCodePoint(symbol.charCodeAt(0));

		if (encodeEverything) {
			string = string.replace(regexAsciiWhitelist, symbol => {
				if (useNamedReferences && has(encodeMap, symbol)) return '&' + encodeMap[symbol] + ';';
				return escapeBmpSymbol(symbol);
			});
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			if (useNamedReferences) {
				string = string.replace(regexEncodeNonAscii, str => '&' + encodeMap[str] + ';');
			}
		} else if (useNamedReferences) {
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, str => '&' + encodeMap[str] + ';');
			}
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;')
				.replace(regexEncodeNonAscii, str => '&' + encodeMap[str] + ';');
		} else if (!allowUnsafeSymbols) {
			string = string.replace(regexEscape, escapeBmpSymbol);
		}
		
		return string
			.replace(regexAstralSymbols, $0 => {
				const high = $0.charCodeAt(0);
				const low = $0.charCodeAt(1);
				const codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return escapeCodePoint(codePoint);
			})
			.replace(regexBmpWhitelist, escapeBmpSymbol);
	};

	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	const decode = (html, options) => {
		options = merge(options, decode.options);
		const strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) parseError('malformed character reference');
		
		return html.replace(regexDecode, ($0, $1, $2, $3, $4, $5, $6) => {
			let codePoint;
			if ($1) {
				return decodeMap[$1];
			} else if ($2) {
				let next = $3;
				if (next && options.isAttributeValue) {
					if (strict && next === '=') parseError('`&` did not start a character reference');
					return $0;
				} else {
					if (strict) parseError('named character reference was not terminated by a semicolon');
					return decodeMapLegacy[$2] + (next || '');
				}
			} else if ($3) {
				if (strict && !$4) parseError('character reference was not terminated by a semicolon');
				codePoint = parseInt($3, 10);
				return codePointToSymbol(codePoint, strict);
			} else if ($5) {
				if (strict && !$6) parseError('character reference was not terminated by a semicolon');
				codePoint = parseInt($5, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if (strict) parseError('named character reference was not terminated by a semicolon');
			return $0;
		});
	};

	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	const escape = string => string.replace(regexEscape, $0 => escapeMap[$0]);

	const he = {
		'version': '1.2.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(() => he);
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { 
			freeModule.exports = he;
		} else { 
			for (const key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { 
		root.he = he;
	}

}(this));
