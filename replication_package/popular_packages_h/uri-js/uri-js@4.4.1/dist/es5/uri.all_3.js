(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    factory((global.URI = global.URI || {}));
}(this, (function (exports) {
    'use strict';

    const maxInt = 2147483647;
    const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-';
    const regexPunycode = /^xn--/, regexNonASCII = /[^\0-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    const errors = {
        'overflow': 'Overflow: input needs wider integers to process',
        'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
        'invalid-input': 'Invalid input'
    };
    const baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode;
    
    function error(type) {
        throw new RangeError(errors[type]);
    }
    function map(array, fn) {
        let result = [], length = array.length;
        while (length--) result[length] = fn(array[length]);
        return result;
    }
    function mapDomain(string, fn) {
        const parts = string.split('@');
        let result = '';
        if (parts.length > 1) {
            result = parts[0] + '@';
            string = parts[1];
        }
        string = string.replace(regexSeparators, '\x2E');
        const labels = string.split('.');
        const encoded = map(labels, fn).join('.');
        return result + encoded;
    }
    function ucs2decode(string) {
        let output = [], counter = 0, length = string.length;
        while (counter < length) {
            let value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                const extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                    output.push(value);
                    counter--;
                }
            } else {
                output.push(value);
            }
        }
        return output;
    }
    const ucs2encode = (array) => {
        return String.fromCodePoint(...toConsumableArray(array));
    };
    const basicToDigit = (codePoint) => {
        if (codePoint - 0x30 < 0x0A) return codePoint - 0x16;
        if (codePoint - 0x41 < 0x1A) return codePoint - 0x41;
        if (codePoint - 0x61 < 0x1A) return codePoint - 0x61;
        return base;
    };
    const digitToBasic = (digit, flag) => {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    const adapt = (delta, numPoints, firstTime) => {
        let k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
            delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    const decode = (input) => {
        let output = [], inputLength = input.length, i = 0, n = initialN, bias = initialBias;
        let basic = input.lastIndexOf(delimiter);
        if (basic < 0) basic = 0;
        for (let j = 0; j < basic; ++j) {
            if (input.charCodeAt(j) >= 0x80) error('not-basic');
            output.push(input.charCodeAt(j));
        }
        for (let index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
            let oldi = i;
            for (let w = 1, k = base;; k += base) {
                if (index >= inputLength) error('invalid-input');
                const digit = basicToDigit(input.charCodeAt(index++));
                if (digit >= base || digit > floor((maxInt - i) / w)) error('overflow');
                i += digit * w;
                const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                if (digit < t) break;
                const baseMinusT = base - t;
                if (w > floor(maxInt / baseMinusT)) error('overflow');
                w *= baseMinusT;
            }
            const out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);
            if (floor(i / out) > maxInt - n) error('overflow');
            n += floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
        }
        return String.fromCodePoint(...output);
    };
    const encode = (input) => {
        let output = [];
        input = ucs2decode(input);
        const inputLength = input.length;
        let n = initialN, delta = 0, bias = initialBias;
        for (const currentValue of input) {
            if (currentValue < 0x80) output.push(stringFromCharCode(currentValue));
        }
        const basicLength = output.length;
        const handledCPCount = basicLength;
        if (basicLength) output.push(delimiter);
        while (handledCPCount < inputLength) {
            let m = maxInt;
            for (const currentValue of input) {
                if (currentValue >= n && currentValue < m) m = currentValue;
            }
            const handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) error('overflow');
            delta += (m - n) * handledCPCountPlusOne;
            n = m;
            for (const currentValue of input) {
                if (currentValue < n && ++delta > maxInt) error('overflow');
                if (currentValue == n) {
                    let q = delta;
                    for (let k = base;; k += base) {
                        const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                        if (q < t) break;
                        const qMinusT = q - t;
                        const baseMinusT = base - t;
                        output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                        q = floor(qMinusT / baseMinusT);
                    }
                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                    delta = 0;
                    ++handledCPCount;
                }
            }
            ++delta;
            ++n;
        }
        return output.join('');
    };
    const toUnicode = (input) => {
        return mapDomain(input, string => regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string);
    };
    const toASCII = (input) => {
        return mapDomain(input, string => regexNonASCII.test(string) ? 'xn--' + encode(string) : string);
    };
    const punycode = {
        'version': '2.1.0',
        'ucs2': {
            'decode': ucs2decode,
            'encode': ucs2encode
        },
        'decode': decode,
        'encode': encode,
        'toASCII': toASCII,
        'toUnicode': toUnicode
    };

    const SCHEMES = {};
    function buildExps(isIRI) {
        const ALPHA = "[A-Za-z]",
              DIGIT = "[0-9]",
              HEXDIG = merge(DIGIT, "[A-Fa-f]"),
              PCT_ENCODED = subexp(subexp("%[EFef]" + HEXDIG + "%" + HEXDIG + HEXDIG + "%" + HEXDIG + HEXDIG) + "|" + subexp("%[89A-Fa-f]" + HEXDIG + "%" + HEXDIG + HEXDIG”) + "|" + subexp("%" + HEXDIG + HEXDIG));
        const NOT_SCHEME = new RegExp(merge("[^]", ALPHA, DIGIT, "[\\+\\-\\.]"), "g"),
              ESCAPE = new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g");
        return {
            NOT_SCHEME: NOT_SCHEME,
            NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
            NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
            NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
            NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
            NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
            NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
            ESCAPE: ESCAPE,
            UNRESERVED: new RegExp(UNRESERVED$$, "g"),
            OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
            PCT_ENCODED: PCT_ENCODED,
            IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
            IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$") 
        };
    }
    const URI_PROTOCOL = buildExps(false);
    const IRI_PROTOCOL = buildExps(true);

    function buildSchemeHandler(scheme, domainHost, parse, serialize) {
        return { scheme, domainHost, parse, serialize };
    }

    SCHEMES.http = buildSchemeHandler(
        "http",
        true,
        function(components, options) {
            if (!components.host) {
                components.error = components.error || "HTTP URIs must have a host.";
            }
            return components;
        },
        function(components, options) {
            const secure = String(components.scheme).toLowerCase() === "https";
            if (components.port == (secure ? 443 : 80) || components.port == "") {
                components.port = undefined;
            }
            if (!components.path) {
                components.path = "/";
            }
            return components;
        }
    );

    SCHEMES.https = buildSchemeHandler(
        "https",
        SCHEMES.http.domainHost,
        SCHEMES.http.parse,
        SCHEMES.http.serialize
    );

    function pctEncChar(chr) {
        const c = chr.charCodeAt(0);
        if (c < 16) return "%0" + c.toString(16).toUpperCase();
        if (c < 128) return "%" + c.toString(16).toUpperCase();
        if (c < 2048) return "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        return "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
    }

    function parse(uriString, options = {}) {
        const components = {};
        const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        const matches = uriString.match(URI_PARSE);
        if (matches) {
            components.scheme = matches[1] || undefined;
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || '';
            components.query = matches[7];
            components.fragment = matches[8];
            if (isNaN(components.port)) {
                components.port = undefined;
            }
            if (components.host) {
                components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
            }
            const schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
            if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
                components.error = components.error || "URI is not a " + options.reference + " reference.";
            }
            if (schemeHandler && schemeHandler.parse) {
                schemeHandler.parse(components, options);
            }
        } else {
            components.error = components.error || "URI can not be parsed.";
        }
        return components;
    }

    function serialize(components, options = {}) {
        const protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
        const uriTokens = [];
        const schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
        if (components.host) {
            if (!protocol.IPV4ADDRESS.test(components.host) && !options.iri) {
                components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
            }
        }
        _normalizeComponentEncoding(components, protocol);
        if (options.reference !== "suffix" && components.scheme) {
            uriTokens.push(components.scheme);
            uriTokens.push(":");
        }
        const authority = _recomposeAuthority(components, options);
        if (authority !== undefined) {
            if (options.reference !== "suffix") {
                uriTokens.push("//");
            }
            uriTokens.push(authority);
            if (components.path && components.path.charAt(0) !== "/") {
                uriTokens.push("/");
            }
        }
        if (components.path !== undefined) {
            let s = components.path;
            if (!options.absolutePath) {
                s = removeDotSegments(s);
            }
            if (authority === undefined) {
                s = s.replace(/^\/\//, "/%2F");
            }
            uriTokens.push(s);
        }
        if (components.query !== undefined) {
            uriTokens.push("?");
            uriTokens.push(components.query);
        }
        if (components.fragment !== undefined) {
            uriTokens.push("#");
            uriTokens.push(components.fragment);
        }
        return uriTokens.join("");
    }

    exports.SCHEMES = SCHEMES;
    exports.pctEncChar = pctEncChar;
    exports.pctDecChars = pctDecChars;
    exports.parse = parse;
    exports.removeDotSegments = removeDotSegments;
    exports.serialize = serialize;
    exports.resolveComponents = resolveComponents;
    exports.resolve = resolve;
    exports.normalize = normalize;
    exports.equal = equal;
    exports.escapeComponent = escapeComponent;
    exports.unescapeComponent = unescapeComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
