(function(root) {
	// Define and determine free variables for module or exports recognition
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;

	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|...|\uD835[\u...]/g;
	var encodeMap = {'\xAD':'shy', '...': '...'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {'"': '&quot;', '&': '&amp;', "'": '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;'};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F...]/;
	var regexDecode = /&(CounterClockwiseContourIntegral|...|ii);|&(Aacute|...|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
	var decodeMap = {'aacute':'\xE1', '...': '...'};

	var stringFromCharCode = String.fromCharCode;
	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	
	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		var result = {};
		for (var key in defaults) {
			result[key] = options[key] ? options[key] : defaults[key];
		}
		return result;
	};

	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			if (strict) parseError('character reference outside permissible range');
			return '\uFFFD';
		}
		if (hasOwnProperty.call(decodeMap, codePoint)) return decodeMap[codePoint];
		if (strict && contains(invalidReferenceCodePoints, codePoint)) parseError('disallowed character reference');
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(codePoint) {
		return '&#x' + codePoint.toString(16).toUpperCase() + ';';
	};

	var decEscape = function(codePoint) {
		return '&#' + codePoint + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) parseError('forbidden code point');
		var escapeCodePoint = options.decimal ? decEscape : hexEscape;

		string = string.replace(regexAsciiWhitelist, function(symbol) {
			return hasOwnProperty.call(encodeMap, symbol) ? '&' + encodeMap[symbol] + ';' : escapeCodePoint(symbol.charCodeAt(0));
		});

		string = string.replace(regexAstralSymbols, function($0) {
			// Surrogate pair handling for Unicode
			var high = $0.charCodeAt(0);
			var low = $0.charCodeAt(1);
			var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
			return escapeCodePoint(codePoint);
		});

		return string.replace(regexBmpWhitelist, escapeCodePoint);
	};

	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) parseError('malformed character reference');
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
			var codePoint, reference, next, semicolon, decDigits, hexDigits;
			if ($1) return decodeMap[$1];
			if ($2) {
				reference = $2; next = $3;
				if (next && options.isAttributeValue && strict && next == '=') parseError('`&` did not start a character reference');
				return decodeMap[reference] + (next || '');
			}
			if ($4) {
				decDigits = $4; semicolon = $5;
				if (strict && !semicolon) parseError('character reference was not terminated by a semicolon');
				codePoint = parseInt(decDigits, 10);
				return codePointToSymbol(codePoint, strict);
			}
			if ($6) {
				hexDigits = $6; semicolon = $7;
				if (strict && !semicolon) parseError('character reference was not terminated by a semicolon');
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			return $0;
		});
	};

	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			return escapeMap[$0];
		});
	};

	// Main he object to be published globally or exported
	var he = {
		'version': '1.2.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Exporting based on environment (AMD, Node.js, Browser)
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function() { return he; });
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { freeModule.exports = he; } else {
			for (var key in he) hasOwnProperty.call(he, key) && (freeExports[key] = he[key]);
		}
	} else {
		root.he = he;
	}
}(this));
