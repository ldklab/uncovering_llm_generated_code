"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.serialize = serialize;

// Regular expressions for validating cookie parts
const cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;

// Utility to create an object without a prototype
const NullObject = /* @__PURE__ */ (() => {
    const C = function() {};
    C.prototype = Object.create(null);
    return C;
})();

// Function to parse a cookie header string into an object
function parse(str, options) {
    const obj = new NullObject();
    if (str.length < 2) return obj;  // Minimum valid cookie size check

    const dec = options?.decode || decode;
    let index = 0;

    do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break; // No '=' found, stop parsing

        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? str.length : colonIdx;

        if (eqIdx > endIdx) {
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }

        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);

        if (obj[key] === undefined) {
            let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            let valEndIdx = endIndex(str, endIdx, valStartIdx);
            const value = dec(str.slice(valStartIdx, valEndIdx));
            obj[key] = value;
        }

        index = endIdx + 1;
    } while (index < str.length);

    return obj;
}

// Determine the start index by skipping spaces
function startIndex(str, index, max) {
    while (index < max) {
        const code = str.charCodeAt(index);
        if (code !== 0x20 && code !== 0x09) return index; // Skip spaces and tabs
        index++;
    }
    return max;
}

// Determine the end index by skipping spaces in reverse
function endIndex(str, index, min) {
    while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 0x20 && code !== 0x09) return index + 1; // Skip spaces and tabs
    }
    return min;
}

// Function to serialize a name-value pair into a cookie string
function serialize(name, val, options) {
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(name)) throw new TypeError(`Invalid cookie name: ${name}`);
    const value = enc(val);
    if (!cookieValueRegExp.test(value)) throw new TypeError(`Invalid cookie value: ${val}`);

    let str = name + "=" + value;
    if (!options) return str;

    if (options.maxAge !== undefined) {
        if (!Number.isInteger(options.maxAge)) throw new TypeError(`Invalid maxAge: ${options.maxAge}`);
        str += "; Max-Age=" + options.maxAge;
    }
    if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) throw new TypeError(`Invalid domain: ${options.domain}`);
        str += "; Domain=" + options.domain;
    }
    if (options.path) {
        if (!pathValueRegExp.test(options.path)) throw new TypeError(`Invalid path: ${options.path}`);
        str += "; Path=" + options.path;
    }
    if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
            throw new TypeError(`Invalid expires: ${options.expires}`);
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
                throw new TypeError(`Invalid priority: ${options.priority}`);
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
                throw new TypeError(`Invalid sameSite: ${options.sameSite}`);
        }
    }
    return str;
}

// Decodes a URL-encoded string
function decode(str) {
    if (str.indexOf("%") === -1) return str;
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

// Checks whether a value is a Date object
function isDate(val) {
    return Object.prototype.toString.call(val) === "[object Date]";
}
