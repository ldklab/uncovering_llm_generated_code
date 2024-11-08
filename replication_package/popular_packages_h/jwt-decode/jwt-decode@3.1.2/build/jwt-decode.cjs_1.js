"use strict";

// Error class for base64 decoding issues
class InvalidCharacterError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidCharacterError";
    }
}

// Create a base64 decoding function
const base64Decode = (typeof window !== "undefined" && window.atob && window.atob.bind(window)) || function(base64String) {
    const sanitized = String(base64String).replace(/=+$/, "");
    if (sanitized.length % 4 === 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    
    let decoded = "";
    let buffer;
    for (let i = 0, accumulator = 0; buffer = sanitized.charAt(i++); 
         ~buffer && (accumulator = i % 4 ? 64 * accumulator + buffer : buffer, i % 4) ? 
         decoded += String.fromCharCode(255 & accumulator >> (6 * (1.5 - i % 4))) : 0) {
        buffer = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(buffer);
    }
    
    return decoded;
};

// Function to decode base64url to a string
function decodeBase64Url(base64UrlString) {
    let base64String = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");
    switch (base64String.length % 4) {
        case 0: break;
        case 2: base64String += "=="; break;
        case 3: base64String += "="; break;
        default: throw new Error("Illegal base64url string!");
    }

    try {
        return decodeURIComponent(base64Decode(base64String).replace(/(.)/g, function(match, char) {
            const hex = char.charCodeAt(0).toString(16).toUpperCase();
            return "%" + (hex.length < 2 ? "0" : "") + hex;
        }));
    } catch (err) {
        return base64Decode(base64String);
    }
}

// Error class for invalid token issues
class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidTokenError";
    }
}

// Main function to decode JWT
function decodeToken(token, options) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified");
    }

    const decodeHeader = (options = options || {}).header === true ? 0 : 1;
    try {
        return JSON.parse(decodeBase64Url(token.split(".")[decodeHeader]));
    } catch (error) {
        throw new InvalidTokenError("Invalid token specified: " + error.message);
    }
}

module.exports = decodeToken;
module.exports.default = decodeToken;
module.exports.InvalidTokenError = InvalidTokenError;
