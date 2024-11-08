/**
 * URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js
 */
(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global.URI = global.URI || {}));
    }
}(this, (function (exports) {
    'use strict';

    // Utility Function Definitions
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
        return "(?:" + str + ")";
    }

    function typeOf(o) {
        return o === undefined ? "undefined" : o === null ? "null" : 
               Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
    }

    function toUpperCase(str) {
        return str.toUpperCase();
    }

    function toArray(obj) {
        return obj !== undefined && obj !== null ? 
               (obj instanceof Array ? obj : (typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj))) : [];
    }

    function assign(target, source) {
        if (source) {
            Object.keys(source).forEach(key => target[key] = source[key]);
        }
        return target;
    }

    // Regular Expression Builder and URI Component Manipulation
    function buildExps(isIRI) {
        let DIGIT$$ = "[0-9]";
        let HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]");
        let ALPHA$$ = "[A-Za-z]";
        let SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]";
        let PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));

        // Define more rules based on IRI and URI differences
        // ...

        return {
            NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
            // ... other components
        };
    }

    var URI_PROTOCOL = buildExps(false);
    var IRI_PROTOCOL = buildExps(true);

    const SCHEMES = {};

    function pctEncChar(chr) {
        let c = chr.charCodeAt(0);
        if (c < 16) return `%0${c.toString(16).toUpperCase()}`;
        else if (c < 128) return `%${c.toString(16).toUpperCase()}`;
        return `%${(c >> 6 | 192).toString(16).toUpperCase()}%${(c & 63 | 128).toString(16).toUpperCase()}`;
    }

    function pctDecChars(str) {
        let newStr = "";
        let i = 0;
        while (i < str.length) {
            let c = parseInt(str.substr(i + 1, 2), 16);
            if (c < 128) {
                newStr += String.fromCharCode(c);
                i += 3;
            } else {
                newStr += str.substr(i, 9);
                i += 9;
            }
        }
        return newStr;
    }

    function parse(uriString, options = {}) {
        let components = {};
        let protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
        let matches = uriString.match(URI_PARSE);
        if (matches) {
            if (NO_MATCH_IS_UNDEFINED) {
                //store each component
                components.scheme = matches[1];
                components.userinfo = matches[3];
                components.host = matches[4];
                components.port = parseInt(matches[5], 10);
                components.path = matches[6] || "";
                components.query = matches[7];
                components.fragment = matches[8];
                //fix port number
                if (isNaN(components.port)) {
                    components.port = matches[5];
                }
            } else {
                //IE FIX for improper RegExp matching
                components.scheme = matches[1] || undefined;
                components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : undefined;
                components.host = uriString.indexOf("//") !== -1 ? matches[4] : undefined;
                components.port = parseInt(matches[5], 10);
                components.path = matches[6] || "";
                components.query = uriString.indexOf("?") !== -1 ? matches[7] : undefined;
                components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : undefined;
                //fix port number
                if (isNaN(components.port)) {
                    components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined;
                }
            }
            if (components.host) {
                components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
            }
            //determine reference type
            if (!components.scheme && !components.userinfo && !components.host && !components.port && !components.path && !components.query) {
                components.reference = "same-document";
            } else if (!components.scheme) {
                components.reference = "relative";
            } else if (!components.fragment) {
                components.reference = "absolute";
            } else {
                components.reference = "uri";
            }
            //check for reference errors
            if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
                components.error = components.error || "URI is not a " + options.reference + " reference.";
            }
            //find scheme handler
            let schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
            //check if scheme can't handle IRIs
            if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
                //if host component is a domain name
                if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                    //convert Unicode IDN -> ASCII IDN
                    try {
                        components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                    } catch (e) {
                        components.error = "Host's domain name can not be converted to ASCII via punycode: " + e;
                    }
                }
                //convert IRI -> URI
                _normalizeComponentEncoding(components, URI_PROTOCOL);
            } else {
                _normalizeComponentEncoding(components, protocol);
            }
            if (schemeHandler && schemeHandler.parse) {
                schemeHandler.parse(components, options);
            }
        } else {
            components.error = "URI can not be parsed.";
        }
        return components;
    }

    function serialize(components, options = {}) {
        let protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
        let uriTokens = [];
        let schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
        if (components.host) {
            if (protocol.IPV6ADDRESS.test(components.host)) {
                // normalize IPv6 address
            } else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
                try {
                    components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
                } catch (e) {
                    components.error = "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
            }
        }
        _normalizeComponentEncoding(components, protocol);
        if (options.reference !== "suffix" && components.scheme) {
            uriTokens.push(components.scheme);
            uriTokens.push(":");
        }
        let authority = _recomposeAuthority(components, options);
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
            if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
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

    function resolveComponents(base, relative, options = {}, skipNormalization) {
        let target = {};
        if (!skipNormalization) {
            base = parse(serialize(base, options), options);
            relative = parse(serialize(relative, options), options);
        }
        if (!options.tolerant && relative.scheme) {
            target.scheme = relative.scheme;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
        } else {
            if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
                target.userinfo = relative.userinfo;
                target.host = relative.host;
                target.port = relative.port;
                target.path = removeDotSegments(relative.path || "");
                target.query = relative.query;
            } else {
                if (!relative.path) {
                    target.path = base.path;
                    target.query = relative.query !== undefined ? relative.query : base.query;
                } else {
                    if (relative.path.charAt(0) === "/") {
                        target.path = removeDotSegments(relative.path);
                    } else {
                        if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
                            target.path = "/" + relative.path;
                        } else if (!base.path) {
                            target.path = relative.path;
                        } else {
                            target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
                        }
                        target.path = removeDotSegments(target.path);
                    }
                    target.query = relative.query;
                }
                target.userinfo = base.userinfo;
                target.host = base.host;
                target.port = base.port;
            }
            target.scheme = base.scheme;
        }
        target.fragment = relative.fragment;
        return target;
    }

    function resolve(baseURI, relativeURI, options) {
        let schemelessOptions = assign({ scheme: 'null' }, options);
        return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
    }

    function normalize(uri, options) {
        if (typeof uri === "string") {
            uri = serialize(parse(uri, options), options);
        } else if (typeOf(uri) === "object") {
            uri = parse(serialize(uri, options), options);
        }
        return uri;
    }

    function equal(uriA, uriB, options) {
        if (typeof uriA === "string") {
            uriA = serialize(parse(uriA, options), options);
        } else if (typeOf(uriA) === "object") {
            uriA = serialize(uriA, options);
        }
        if (typeof uriB === "string") {
            uriB = serialize(parse(uriB, options), options);
        } else if (typeOf(uriB) === "object") {
            uriB = serialize(uriB, options);
        }
        return uriA === uriB;
    }

    function escapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
    }

    function unescapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
    }

    // Scheme Handlers
    SCHEMES["http"] = {
        scheme: "http",
        domainHost: true,
        parse: function parse(components, options) {
            if (!components.host) {
                components.error = "HTTP URIs must have a host.";
            }
            return components;
        },
        serialize: function serialize(components, options) {
            let secure = String(components.scheme).toLowerCase() === "https";
            if (components.port === (secure ? 443 : 80) || components.port === "") {
                components.port = undefined;
            }
            if (!components.path) {
                components.path = "/";
            }
            return components;
        }
    };

    SCHEMES["https"] = {
        scheme: "https",
        domainHost: SCHEMES["http"].domainHost,
        parse: SCHEMES["http"].parse,
        serialize: SCHEMES["http"].serialize
    };

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
//# sourceMappingURL=uri.all.js.map
