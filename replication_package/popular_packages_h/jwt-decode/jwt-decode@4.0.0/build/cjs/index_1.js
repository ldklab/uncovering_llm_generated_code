"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecode = exports.InvalidTokenError = void 0;

class InvalidTokenError extends Error {}
exports.InvalidTokenError = InvalidTokenError;
InvalidTokenError.prototype.name = "InvalidTokenError";

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
        return `%${code}`;
    }));
}

function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    output += "=".repeat((4 - (output.length % 4)) % 4);
    try {
        return b64DecodeUnicode(output);
    } catch (err) {
        return atob(output);
    }
}

function jwtDecode(token, options = {}) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }

    const pos = options.header ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }

    let decoded;
    try {
        decoded = base64UrlDecode(part);
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }

    try {
        return JSON.parse(decoded);
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
}

exports.jwtDecode = jwtDecode;
