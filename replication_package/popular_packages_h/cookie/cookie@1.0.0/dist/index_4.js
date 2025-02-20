"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.serialize = serialize;

// Regular expressions for validation
const cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;

// Utility constants
const __toString = Object.prototype.toString;
const NullObject = (() => {
    const C = function () { };
    C.prototype = Object.create(null);
    return C;
})();

// Parse cookie header into an object
function parse(str, options) {
    const obj = new NullObject();
    const len = str.length;

    if (len < 2) return obj;
    
    const dec = options?.decode || decode;
    let index = 0;

    do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;

        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }

        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);

        if (obj[key] === undefined) {
            const valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            const valEndIdx = endIndex(str, endIdx, valStartIdx);
            const value = dec(str.slice(valStartIdx, valEndIdx));
            obj[key] = value;
        }

        index = endIdx + 1;
    } while (index < len);

    return obj;
}

// Helper functions for indexes
function startIndex(str, index, max) {
    do {
        const code = str.charCodeAt(index);
        if (code !== 0x20 && code !== 0x09) return index;
    } while (++index < max);
    return max;
}

function endIndex(str, index, min) {
    while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 0x20 && code !== 0x09) return index + 1;
    }
    return min;
}

// Serialize into cookie header format
function serialize(name, val, options) {
    const enc = options?.encode || encodeURIComponent;

    if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
    }

    const value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
    }

    let str = name + "=" + value;
    if (!options) return str;

    if (options.maxAge !== undefined) {
        if (!Number.isInteger(options.maxAge)) {
            throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
    }

    if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
            throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
    }

    if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
            throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
    }

    if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
            throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
    }

    if (options.httpOnly) str += "; HttpOnly";
    if (options.secure) str += "; Secure";
    if (options.partitioned) str += "; Partitioned";

    if (options.priority) {
        switch (options.priority) {
            case "low":
                str += "; Priority=Low";
                break;
            case "medium":
                str += "; Priority=Medium";
                break;
            case "high":
                str += "; Priority=High";
                break;
            default:
                throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
    }

    if (options.sameSite) {
        switch (options.sameSite) {
            case true:
            case "strict":
                str += "; SameSite=Strict";
                break;
            case "lax":
                str += "; SameSite=Lax";
                break;
            case "none":
                str += "; SameSite=None";
                break;
            default:
                throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
    }

    return str;
}

// URL-decode value with error handling
function decode(str) {
    if (str.indexOf("%") === -1) return str;

    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

// Check if value is a Date object
function isDate(val) {
    return __toString.call(val) === "[object Date]";
}
