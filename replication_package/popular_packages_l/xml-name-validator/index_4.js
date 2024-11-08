// xml-name-validator/index.js

"use strict";

function isNameStartChar(c) {
  const ranges = [
    ['A', 'Z'], ['a', 'z'], ['\u00C0', '\u00D6'], ['\u00D8', '\u00F6'], ['\u00F8', '\u02FF'],
    ['\u0370', '\u037D'], ['\u037F', '\u1FFF'], ['\u200C', '\u200D'], ['\u2070', '\u218F'], 
    ['\u2C00', '\u2FEF'], ['\u3001', '\uD7FF'], ['\uF900', '\uFDCF'], ['\uFDF0', '\uFFFD'],
    ['\u10000', '\uEFFFF']
  ];
  return c === '_' || ranges.some(([start, end]) => c >= start && c <= end);
}

function isNameChar(c) {
  const additionalChars = ['-', '.', '\u00B7'];
  const additionalRanges = [['\u0300', '\u036F'], ['\u203F', '\u2040']];
  return isNameStartChar(c) || 
         additionalChars.includes(c) || 
         (c >= '0' && c <= '9') ||
         additionalRanges.some(([start, end]) => c >= start && c <= end);
}

function name(str) {
  if (!str || !isNameStartChar(str.charAt(0))) return false;
  for (let i = 1; i < str.length; i++) {
    if (!isNameChar(str.charAt(i))) return false;
  }
  return true;
}

function qname(str) {
  const parts = str.split(':');
  return parts.length <= 2 && parts.every((part) => name(part) && part !== '');
}

module.exports = {
  name,
  qname
};
