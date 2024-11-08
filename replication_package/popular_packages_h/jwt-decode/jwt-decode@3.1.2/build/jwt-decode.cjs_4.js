"use strict";

class InvalidCharacterError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCharacterError";
  }
}

const base64Decode = typeof window !== "undefined" && window.atob
  ? window.atob.bind(window)
  : function(base64) {
      const str = String(base64).replace(/=+$/, "");
      if (str.length % 4 === 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      let output = "";
      for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(buffer);
      }
      return output;
    };

function base64urlDecode(input) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  switch (base64.length % 4) {
    case 0: break;
    case 2: base64 += "=="; break;
    case 3: base64 += "="; break;
    default: throw new Error("Illegal base64url string!");
  }
  try {
    return decodeURIComponent(base64Decode(base64).replace(/(.)/g, function(m, p) {
      const code = p.charCodeAt(0).toString(16).toUpperCase();
      return "%" + (code.length < 2 ? "0" + code : code);
    }));
  } catch (err) {
    return base64Decode(base64);
  }
}

class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidTokenError";
  }
}

function decodeJWT(token, options = {}) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified");
  }

  const base = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64urlDecode(token.split(".")[base]));
  } catch (err) {
    throw new InvalidTokenError("Invalid token specified: " + err.message);
  }
}

decodeJWT.InvalidTokenError = InvalidTokenError;
module.exports = decodeJWT;
