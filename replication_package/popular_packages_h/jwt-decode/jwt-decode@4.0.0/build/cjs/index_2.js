"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecode = exports.InvalidTokenError = void 0;

class InvalidTokenError extends Error {}
InvalidTokenError.prototype.name = "InvalidTokenError";
exports.InvalidTokenError = InvalidTokenError;

function decodeBase64Unicode(str) {
    return decodeURIComponent(
        atob(str).split("").map(char => {
            let hex = char.charCodeAt(0).toString(16).toUpperCase();
            return "%" + (hex.length < 2 ? "0" + hex : hex);
        }).join("")
    );
}

function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0: break;
        case 2: output += "=="; break;
        case 3: output += "="; break;
        default: throw new Error("Invalid base64 length");
    }
    try {
        return decodeBase64Unicode(output);
    } catch {
        return atob(output);
    }
}

function jwtDecode(token, options = {}) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Token must be a string");
    }
    const partIndex = options.header ? 0 : 1;
    const jwtParts = token.split(".");
    
    if (typeof jwtParts[partIndex] !== "string") {
        throw new InvalidTokenError(`Missing JWT part #${partIndex + 1}`);
    }
    
    try {
        const decoded = base64UrlDecode(jwtParts[partIndex]);
        return JSON.parse(decoded);
    } catch (error) {
        throw new InvalidTokenError(`Invalid JWT part #${partIndex + 1}: ${error.message}`);
    }
}

exports.jwtDecode = jwtDecode;
