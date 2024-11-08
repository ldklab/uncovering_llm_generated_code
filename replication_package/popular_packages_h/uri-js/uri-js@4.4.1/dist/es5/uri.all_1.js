/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.URI = global.URI || {})));
}(this, (function(exports) {
    'use strict';

    // Utility functions for handling URIs
    function merge(...sets) {
        if (sets.length > 1) {
            sets[0] = sets[0].slice(0, -1);
            const xl = sets.length - 1;
            for (let x = 1; x < xl; ++x) {
                sets[x] = sets[x].slice(1, -1);
            }
            sets[xl] = sets[xl].slice(1);
            return sets.join('');
        } else {
            return sets[0];
        }
    }

    function typeOf(o) {
        return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
    }

    function assign(target, source) {
        const obj = target;
        if (source) {
            for (const key in source) {
                obj[key] = source[key];
            }
        }
        return obj;
    }

    // Parsing and building regular expressions for URI components
    function buildExps(isIRI) {
        const ALPHA = "[A-Za-z]";
        const DIGIT = "[0-9]";
        const HEXDIG = merge(DIGIT, "[A-Fa-f]");
        const SUB_DELIMS = "[!$&'()*+,;=]";
        const UNRESERVED = merge(ALPHA, DIGIT, "[-._~]");
        const SCHEME = ALPHA + merge(ALPHA, DIGIT, "[+-.]") + "*";
        const PCT_ENCODED = "%[0-9A-Fa-f]{2}";

        return {
            URN_PARSE: new RegExp(`^(${SCHEME}):([^:]+):(.*)`),
            IPV4ADDRESS: new RegExp(`^(${DIGIT}+\\.${DIGIT}+\\.${DIGIT}+\\.${DIGIT}+)`),
            IPV6ADDRESS: new RegExp(`^(.*?)(%[0-9A-Za-z]{1,})?$`),
            PCT_ENCODED: new RegExp(PCT_ENCODED, "g"),
            UNRESERVED: new RegExp(UNRESERVED, "g"),
        };
    }

    const URI_PROTOCOL = buildExps(false);
    const IRI_PROTOCOL = buildExps(true);

    // Punycode conversion utilities
    const punycode = (() => {
        const ERROR_OVERFLOW = 'Overflow: input needs wider integers to process';
        const maxInt = 2147483647;
        const base = 36;
        const tMin = 1;
        const tMax = 26;
        const skew = 38;
        const damp = 700;
        const initialBias = 72;
        const initialN = 128;
        const delimiter = '-';
        const regexPunycode = /^xn--/;
        const regexNonASCII = /[^\0-\x7E]/;
        
        function decode(input) {
            // Implementation of Punycode decoding algorithm
            // (Omitted for brevity)
            return input;
        }

        function encode(input) {
            // Implementation of Punycode encoding algorithm
            // (Omitted for brevity)
            return input;
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
            const encoded = labels.map(fn).join('.');
            return result + encoded;
        }

        function toUnicode(input) {
            return mapDomain(input, function(string) {
                return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
            });
        }

        function toASCII(input) {
            return mapDomain(input, function(string) {
                return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
            });
        }

        return {
            version: '2.1.0',
            decode,
            encode,
            toASCII,
            toUnicode
        };
    })();

    // URI parsing and serializing
    function parse(uriString, options = {}) {
        const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        const components = {};
        const matches = uriString.match(protocol.URN_PARSE);

        if (matches) {
            components.scheme = matches[1];
            components.nid = matches[2].toLowerCase();
            components.nss = matches[3];
        } else {
            components.error = "URN can not be parsed.";
        }
        return components;
    }

    function serialize(components, options = {}) {
        const uriTokens = [];
        if (components.scheme) {
            uriTokens.push(components.scheme);
            uriTokens.push(":");
        }
        uriTokens.push(components.nid);
        uriTokens.push(":");
        uriTokens.push(components.nss);
        return uriTokens.join("");
    }

    // Registry of URI schemes
    const SCHEMES = {};

    SCHEMES["urn"] = {
        scheme: "urn",
        parse,
        serialize,
    };

    // Exported functions
    exports.parse = parse;
    exports.serialize = serialize;
    exports.SCHEMES = SCHEMES;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=uri.all.js.map
