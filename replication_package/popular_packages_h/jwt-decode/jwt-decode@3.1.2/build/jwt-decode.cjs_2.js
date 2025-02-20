"use strict";

// Custom error for invalid characters in base64 decoding
function InvalidCharacterError(message) {
    this.message = message;
}
InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = "InvalidCharacterError";

// Base64 decoding function, using built-in atob if available
const base64Decode = typeof window !== "undefined" && window.atob ? window.atob.bind(window) : function(input) {
    const str = String(input).replace(/=+$/, '');
    if (str.length % 4 === 1) throw new InvalidCharacterError("The input is not correctly encoded.");
    let output = '';
    let buffer, charIndex, i = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    while (charIndex = str.charAt(i++)) {
        if (~(charIndex = chars.indexOf(charIndex))) {
            buffer = i % 4 ? 64 * buffer + charIndex : charIndex;
            if (i % 4) output += String.fromCharCode(255 & buffer >> (-2 * i & 6));
        }
    }
    return output;
};

// Function to handle base64url decoding
function base64UrlDecode(base64url) {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    switch (base64.length % 4) {
        case 0: break;
        case 2: base64 += "=="; break;
        case 3: base64 += "="; break;
        default: throw new Error("Illegal base64url string!");
    }
    try {
        return decodeURIComponent(base64Decode(base64).replace(/(.)/g, function(m, p) {
            const code = p.charCodeAt(0).toString(16).toUpperCase();
            return "%" + (code.length < 2 ? "0" : "") + code;
        }));
    } catch (e) {
        return base64Decode(base64);
    }
}

// Custom error for invalid tokens
function InvalidTokenError(message) {
    this.message = message;
}
InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = "InvalidTokenError";

// Function to decode a JWT
function decodeJWT(token, options) {
    if (typeof token !== 'string') throw new InvalidTokenError("Invalid token specified");
    const index = options && options.header === true ? 0 : 1;
    try {
        const segment = token.split(".")[index];
        return JSON.parse(base64UrlDecode(segment));
    } catch (e) {
        throw new InvalidTokenError("Invalid token specified: " + e.message);
    }
}

// Exporting the decode function and the error
module.exports = {
    decode: decodeJWT,
    InvalidTokenError: InvalidTokenError
};
