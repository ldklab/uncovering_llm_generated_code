// xml-name-validator/index.js

"use strict";

function isNameStartChar(c) {
  return (
    (c >= 'A' && c <= 'Z') ||
    (c >= 'a' && c <= 'z') ||
    c === '_' ||
    (c >= '\u00C0' && c <= '\u00D6') ||
    (c >= '\u00D8' && c <= '\u00F6') ||
    (c >= '\u00F8' && c <= '\u02FF') ||
    (c >= '\u0370' && c <= '\u037D') ||
    (c >= '\u037F' && c <= '\u1FFF') ||
    (c >= '\u200C' && c <= '\u200D') ||
    (c >= '\u2070' && c <= '\u218F') ||
    (c >= '\u2C00' && c <= '\u2FEF') ||
    (c >= '\u3001' && c <= '\uD7FF') ||
    (c >= '\uF900' && c <= '\uFDCF') ||
    (c >= '\uFDF0' && c <= '\uFFFD') ||
    (c >= '\u10000' && c <= '\uEFFFF')
  );
}

function isNameChar(c) {
  return (
    isNameStartChar(c) ||
    (c >= '0' && c <= '9') ||
    c === '-' ||
    c === '.' ||
    c === '\u00B7' ||
    (c >= '\u0300' && c <= '\u036F') ||
    (c >= '\u203F' && c <= '\u2040')
  );
}

function name(str) {
  if (!str || !isNameStartChar(str.charAt(0))) {
    return false;
  }
  for (let i = 1; i < str.length; i++) {
    if (!isNameChar(str.charAt(i))) {
      return false;
    }
  }
  return true;
}

function qname(str) {
  const parts = str.split(':');
  if (parts.length > 2) {
    return false;
  }
  return parts.every((part) => name(part) && part !== '');
}

module.exports = {
  name,
  qname
};
