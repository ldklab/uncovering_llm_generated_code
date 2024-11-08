"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecode = exports.InvalidTokenError = void 0;

class InvalidTokenError extends Error {}
exports.InvalidTokenError = InvalidTokenError;
InvalidTokenError.prototype.name = "InvalidTokenError";

const decodeBase64Unicode = (str) => {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        return "%" + (code.length === 1 ? "0" + code : code);
    }));
};

const base64UrlDecode = (str) => {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0: break;
        case 2: output += "=="; break;
        case 3: output += "="; break;
        default: throw new Error("base64 string is not of the correct length");
    }
    try {
        return decodeBase64Unicode(output);
    } catch {
        return atob(output);
    }
};

const jwtDecode = (token, options = {}) => {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    const pos = options.header === true ? 0 : 1;
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
};

exports.jwtDecode = jwtDecode;
