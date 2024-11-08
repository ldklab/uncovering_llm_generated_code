"use strict";
class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidTokenError";
  }
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).split('').map(char => {
    let code = char.charCodeAt(0).toString(16).toUpperCase();
    return "%" + (code.length < 2 ? "0" + code : code);
  }).join(''));
}

function base64UrlDecode(str) {
  const output = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - output.length % 4) % 4);
  const base64 = output + padding;
  
  try {
    return b64DecodeUnicode(base64);
  } catch {
    return atob(base64);
  }
}

function jwtDecode(token, options = {}) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }

  const pos = options.header ? 0 : 1;
  const part = token.split(".")[pos];
  
  if (!part) {
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

module.exports = {
  InvalidTokenError,
  jwtDecode
};
