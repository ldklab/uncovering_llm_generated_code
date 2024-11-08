(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.URI = global.URI || {})));
}(this, (function (exports) { 'use strict';
    
    // Utility Functions
    const assign = (target, source) => {
        if (source) {
            for (const key in source) {
                target[key] = source[key];
            }
        }
        return target;
    };

    const ucs2decode = (string) => {
        const output = [];
        for (let i = 0; i < string.length; i++) {
            const value = string.charCodeAt(i);
            if (value >= 0xD800 && value <= 0xDBFF && i + 1 < string.length) {
                const extra = string.charCodeAt(i + 1);
                if ((extra & 0xFC00) === 0xDC00) {
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                    i++;
                    continue;
                }
            }
            output.push(value);
        }
        return output;
    };

    const ucs2encode = (array) => {
        return String.fromCodePoint(...array);
    };

    const punycode = {
        ucs2: { decode: ucs2decode, encode: ucs2encode },
        decode(input) {
            // Decode a Punycode string of ASCII-only symbols to a string of Unicode symbols
            const output = [];
            input = input.toLowerCase();
            const basic = input.lastIndexOf('-');
            const i = 0, n = 128, bias = 72;

            for (let j = 0; j < basic; ++j) {
                output.push(input.charCodeAt(j));
            }

            for (let index = basic > 0 ? basic + 1 : 0; index < input.length;) {
                let oldi = i, w = 1;
                for (let k = 36;; k += 36) {
                    const digit = input.charCodeAt(index++) - 48 < 10 ? input.charCodeAt(index - 1) - 22 : input.charCodeAt(index - 1) - 59;
                    i += digit * w;
                    if (digit < (k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias)) break;
                    w *= (36 - (k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias));
                }

                bias = (oldi - i) / (++output.length) >> 1;
                i %= output.length;
                output.splice(i++, 0, n + (oldi - i));
            }

            return String.fromCharCode(...output);
        },
        encode(input) {
            // Encode a string of Unicode symbols to a Punycode string of ASCII-only symbols
            input = ucs2decode(input);
            let output = input.filter(code => code < 0x80).map(String.fromCharCode).join('');
            let handledCPCount = output.length, basicLength = output.length;

            if (basicLength) output += '-';
            let n = 128, bias = 72, delta = 0;

            while (handledCPCount < input.length) {
                let m = Math.min(...input.filter(code => code >= n));

                delta += (m - n) * (handledCPCount + 1);
                n = m;
                input.forEach(code => {
                    if (code < n) delta++;
                    if (code === n) {
                        let q = delta;
                        for (let k = 36;; k += 36) {
                            const t = k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias;
                            if (q < t) break;
                            output += String.fromCharCode(t + (q - t) % (36 - t));
                            q = (q - t) / (36 - t);
                        }
                        output += String.fromCharCode(t + q);
                        bias = (delta / (++handledCPCount)) >> 1;
                        delta = 0;
                    }
                });

                delta++, n++;
            }

            return output;
        },
        toUnicode: input => {
            return input.split('@').map((part, i) => {
                if (i) {
                    return punycode.decode(part);
                }
                return part;
            }).join('@').replace(/[^\0-\x7E]/g, match => `xn--${punycode.encode(match)}`);
        },
        toASCII: input => {
            return input.split('@').map((part, i) => {
                if (!i) {
                    return part;
                }
                return punycode.encode(part);
            }).join('@').replace(/[^\0-\x7E]/g, match => `xn--${punycode.encode(match)}`);
        }
    };

    const parse = (uriString, options = {}) => {
        const matches = uriString.match(/^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\]]+\]|[^\/?#:]*)(?::(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/);
        const components = {
            scheme: matches[1],
            userinfo: matches[3],
            host: matches[4],
            port: parseInt(matches[5], 10),
            path: matches[6] || "",
            query: matches[7],
            fragment: matches[8]
        };
        if (isNaN(components.port)) {
            components.port = matches[5];
        }
        return components;
    };

    const serialize = components => {
        const authority = components.host ? `${components.userinfo ? `${components.userinfo}@` : ''}${components.host}${typeof components.port === 'number' || typeof components.port === 'string' ? `:${components.port}` : ''}` : '';
        return `${components.scheme || ''}${authority && '//'}${authority}${components.path || ''}${components.query ? `?${components.query}` : ''}${components.fragment ? `#${components.fragment}` : ''}`;
    };

    const resolve = (baseURI, relativeURI) => {
        const base = parse(baseURI);
        const relative = parse(relativeURI);
        let target = {};
        
        if (relative.scheme) {
            target = relative;
        } else {
            target = base;
            if (relative.authority) {
                target.authority = relative.authority;
                target.path = relative.path;
                target.query = relative.query;
            } else {
                if (!relative.path) {
                    target.path = base.path;
                    if (relative.query !== undefined) {
                        target.query = relative.query;
                    }
                } else {
                    if (relative.path.charAt(0) === "/") {
                        target.path = relative.path;
                    } else {
                        target.path = `${base.path.substring(0, base.path.lastIndexOf("/") + 1)}${relative.path}`;
                    }
                }
            }
        }
        return serialize(target);
    };

    const normalize = (uri) => {
        if (typeof uri === 'string') {
            return serialize(parse(uri));
        } else {
            return serialize(uri);
        }
    };

    exports.parse = parse;
    exports.serialize = serialize;
    exports.resolve = resolve;
    exports.normalize = normalize;
    exports.toUnicode = punycode.toUnicode;
    exports.toASCII = punycode.toASCII;

})));
