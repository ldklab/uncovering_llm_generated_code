"use strict";

function isNameStartChar(c) {
  const ranges = [
    ['A', 'Z'], ['a', 'z'], ['\u00C0', '\u00D6'], ['\u00D8', '\u00F6'], ['\u00F8', '\u02FF'],
    ['\u0370', '\u037D'], ['\u037F', '\u1FFF'], ['\u200C', '\u200D'], ['\u2070', '\u218F'],
    ['\u2C00', '\u2FEF'], ['\u3001', '\uD7FF'], ['\uF900', '\uFDCF'], ['\uFDF0', '\uFFFD'],
    ['\u10000', '\uEFFFF']
  ];
  return ranges.some(([start, end]) => c >= start && c <= end) || c === '_';
}

function isNameChar(c) {
  const specialChars = ['-', '.', '\u00B7'];
  const ranges = [
    ['0', '9'], ['\u0300', '\u036F'], ['\u203F', '\u2040']
  ];
  return isNameStartChar(c) || specialChars.includes(c) ||
    ranges.some(([start, end]) => c >= start && c <= end);
}

function name(str) {
  if (!str || !isNameStartChar(str.charAt(0))) return false;
  return Array.from(str).every((char, index) => index === 0 || isNameChar(char));
}

function qname(str) {
  const parts = str.split(':');
  if (parts.length > 2) return false;
  return parts.every(part => name(part) && part !== '');
}

module.exports = {
  name,
  qname
};
