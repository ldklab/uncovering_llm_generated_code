(function(root) {
    // Detect different environments
    var freeExports = typeof exports === 'object' && exports;
    var freeModule = typeof module === 'object' && module && module.exports === freeExports && module;
    var freeGlobal = typeof global === 'object' && global;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
    }

    var stringFromCharCode = String.fromCharCode;

    // Regex patterns
    var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var regexAsciiWhitelist = /[\x01-\x7F]/g;
    var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
    var regexEscape = /["&'<>`]/g;
    var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
    var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ts&#56;ime|tvvv....);/g;
    
    // Encoding/Decoding maps
    var encodeMap = {'\xAD': 'shy', '\u200C': 'zwnj', /* ... */ '<': 'lt', // etc...
    };
    var decodeMap = {'aacute': '\xE1', 'Aacute': '\xC1', /* ... */ 'amp': '&'}; // truncated for brevity
    
    // Utility functions
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var has = function(obj, key) { return hasOwnProperty.call(obj, key); };
    var contains = function(arr, val) { return arr.indexOf(val) !== -1; };
    var merge = function(options, defaults) {
        if (!options) return defaults;
        var result = {};
        for (var key in defaults) {
            result[key] = has(options, key) ? options[key] : defaults[key];
        }
        return result;
    };
    var codePointToSymbol = function(cp, strict) { /* ... */}; // Logic for converting code points
    var hexEscape = function(cp) { return '&#x' + cp.toString(16).toUpperCase() + ';'; };
    var decEscape = function(cp) { return '&#' + cp + ';'; };
    var parseError = function(msg) { throw new Error('Parse error: ' + msg); };

    // Encoding and decoding functions
    var encode = function(string, options) {
        options = merge(options, encode.options);
        var {strict, encodeEverything, useNamedReferences, allowUnsafeSymbols, decimal} = options;
        var escapeCodePoint = decimal ? decEscape : hexEscape;

        var escapeBmpSymbol = function(symbol) {
            return escapeCodePoint(symbol.charCodeAt(0));
        };

        if (encodeEverything) {
            string = string.replace(regexAsciiWhitelist, function(symbol) {
                if (useNamedReferences && has(encodeMap, symbol)) {
                    return '&' + encodeMap[symbol] + ';';
                }
                return escapeBmpSymbol(symbol);
            }).replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;');

            if (useNamedReferences) {
                string = string.replace(regexEncodeNonAscii, function(str) {
                    return '&' + encodeMap[str] + ';';
                });
            }
        } else if (useNamedReferences) {
            if (!allowUnsafeSymbols) {
                string = string.replace(regexEscape, function(str) {
                    return '&' + encodeMap[str] + ';';
                });
            }
            string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;');
            string = string.replace(regexEncodeNonAscii, function(str) {
                return '&' + encodeMap[str] + ';';
            });
        } else if (!allowUnsafeSymbols) {
            string = string.replace(regexEscape, escapeBmpSymbol);
        }
        return string.replace(regexAstralSymbols, function($0) {
                var high = $0.charCodeAt(0);
                var low = $0.charCodeAt(1);
                var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
                return escapeCodePoint(codePoint);
            })
            .replace(regexBmpWhitelist, escapeBmpSymbol);
    };
    encode.options = {
        'allowUnsafeSymbols': false,
        'encodeEverything': false,
        'strict': false,
        'useNamedReferences': false,
        'decimal': false
    };

    var decode = function(html, options) {
        options = merge(options, decode.options);
        var strict = options.strict;
        return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
            var codePoint, semicolon, decDigits, hexDigits, reference, next;

            if ($1) {
                reference = $1;
                return decodeMap[reference];
            }

            if ($2) {
                reference = $2;
                next = $3;
                if (next && options.isAttributeValue) {
                    if (strict && next == '=') {
                        parseError('`&` did not start a character reference');
                    }
                    return $0;
                } else {
                    if (strict) {
                        parseError('named character reference was not terminated by a semicolon');
                    }
                    return decodeMapLegacy[reference] + (next || '');
                }
            }

            if ($4) {
                decDigits = $4;
                semicolon = $5;
                if (strict && !semicolon) {
                    parseError('character reference was not terminated by a semicolon');
                }
                codePoint = parseInt(decDigits, 10);
                return codePointToSymbol(codePoint, strict);
            }

            if ($6) {
                hexDigits = $6;
                semicolon = $7;
                if (strict && !semicolon) {
                    parseError('character reference was not terminated by a semicolon');
                }
                codePoint = parseInt(hexDigits, 16);
                return codePointToSymbol(codePoint, strict);
            }

            if (strict) {
                parseError('named character reference was not terminated by a semicolon');
            }
            return $0;
        });
    };
    decode.options = {
        'isAttributeValue': false,
        'strict': false
    };

    var escapeFn = function(string) {
        return string.replace(regexEscape, function($0) {
            return escapeMap[$0];
        });
    };

    var he = {
        'version': '1.2.0',
        'encode': encode,
        'decode': decode,
        'escape': escapeFn,
        'unescape': decode
    };

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(function() {
            return he;
        });
    } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
            freeModule.exports = he;
        } else {
            for (var key in he) {
                has(he, key) && (freeExports[key] = he[key]);
            }
        }
    } else {
        root.he = he;
    }
}(this));
