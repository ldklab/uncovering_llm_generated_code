(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.URI = global.URI || {})));
}(this, function(exports) {
    'use strict';

    // Utility functions
    function merge(...sets) {
        if (sets.length > 1) {
            sets[0] = sets[0].slice(0, -1);
            let xl = sets.length - 1;
            for (let x = 1; x < xl; ++x) {
                sets[x] = sets[x].slice(1, -1);
            }
            sets[xl] = sets[xl].slice(1);
            return sets.join('');
        } else {
            return sets[0];
        }
    }

    function subexp(str) {
        return `(?:${str})`;
    }

    function typeOf(o) {
        return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(' ').pop().split(']').shift().toLowerCase();
    }

    function toUpperCase(str) {
        return str.toUpperCase();
    }

    function toArray(obj) {
        return obj !== undefined && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
    }

    function assign(target, source) {
        let obj = target;
        if (source) {
            for (let key in source) {
                obj[key] = source[key];
            }
        }
        return obj;
    }

    // URI Regular Expressions and helper functions
    function buildExps(isIRI) {
        // Grammar definitions
        const ALPHA = "[A-Za-z]",
              DIGIT = "[0-9]",
              HEXDIG = merge(DIGIT, "[A-Fa-f]"),
              PCT_ENCODED = subexp(subexp("%[EFef]" + HEXDIG + "%" + HEXDIG + HEXDIG + "%" + HEXDIG + HEXDIG) + "|" +
                                   subexp("%[89A-Fa-f]" + HEXDIG + "%" + HEXDIG + HEXDIG) + "|" +
                                   subexp("%" + HEXDIG + HEXDIG)),
              UNRESERVED = merge(ALPHA, DIGIT, "[\\-\\.\\_\\~]", isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "");

        // Host and Path components
        const IPV4ADDRESS = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT) + "|" + subexp("1" + DIGIT + DIGIT) + "|" + subexp("[1-9]" + DIGIT) + "|" + DIGIT)
                           + "\\." + subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT) + "|" + subexp("1" + DIGIT + DIGIT) + "|" + subexp("0?[1-9]" + DIGIT) + "|0?0?" + DIGIT)
                           + "(?:\\." + subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT) + "|" + subexp("1" + DIGIT + DIGIT) + "|" + subexp("[1-9]" + DIGIT) + "|" + DIGIT)
                           + "{2})?",
              SCHEME = subexp(ALPHA + merge(ALPHA, DIGIT, "[\\+\\-\\.]") + "*");

        return {
            NOT_SCHEME: new RegExp(merge("[^]", ALPHA, DIGIT, "[\\+\\-\\.]"), "g"),
            PCT_ENCODED: new RegExp(PCT_ENCODED, "g"),
            UNRESERVED: new RegExp(UNRESERVED, "g"),
            IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS + ")$"),
        };
    }

    const URI_PROTOCOL = buildExps(false);

    // URI Components processing
    function parse(uriString, options = {}) {
        const components = {};
        const protocol = options.iri !== false ? URI_PROTOCOL : URI_PROTOCOL;

        // Regular expression match for URI components
        const URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
        const matches = uriString.match(URI_PARSE);

        if (matches) {
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];

            if (isNaN(components.port)) {
                components.port = matches[5];
            }

            // Normalize host component for IPv4 and IPv6
            if (components.host) {
                components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
            }

            // Determine URI reference type
            components.reference = (components.scheme === undefined && components.userinfo === undefined && components.host === undefined && components.port === undefined && !components.path && components.query === undefined) ?
                                   "same-document" :
                                   (components.scheme === undefined ? "relative" : (components.fragment === undefined ? "absolute" : "uri"));

            // Error handling for mismatched reference type
            if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
                components.error = components.error || `URI is not a ${options.reference} reference.`;
            }

            // Scheme-specific parsing and internationalization
            const schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
            if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
                if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                    try {
                        components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                    } catch (e) {
                        components.error = components.error || `Host's domain name cannot be converted to ASCII via punycode: ${e}`;
                    }
                }
                _normalizeComponentEncoding(components, URI_PROTOCOL);
            } else {
                _normalizeComponentEncoding(components, protocol);
            }

            if (schemeHandler && schemeHandler.parse) {
                schemeHandler.parse(components, options);
            }
        } else {
            components.error = components.error || "URI cannot be parsed.";
        }

        return components;
    }

    function _normalizeIPv4(host, protocol) {
        const matches = host.match(protocol.IPV4ADDRESS) || [];
        const address = matches[1];

        return address ? address.split(".").map(_stripLeadingZeros).join(".") : host;
    }

    function _stripLeadingZeros(str) {
        return str.replace(/^0*(.*)/, "$1") || "0";
    }

    function _normalizeComponentEncoding(components, protocol) {
        function decodeUnreserved(str) {
            const decStr = pctDecChars(str);
            return !decStr.match(protocol.UNRESERVED) ? str : decStr;
        }

        if (components.scheme) {
            components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_SCHEME, "");
        }

        // Further processing of URI components...

        return components;
    }

    // Define public API
    exports.parse = parse;
    exports.buildExps = buildExps;
    Object.defineProperty(exports, '__esModule', { value: true });
}));
