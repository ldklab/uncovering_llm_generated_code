"use strict";

// This module exports two functions: `name` and `qname`.
// Both functions are used to validate strings based on specific Unicode ranges that are typical of XML names and XML qualified names.

const nameStartChar = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}";
const nameChar = nameStartChar + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";

// Regular expression to check if a string is a valid XML name
const nameRegex = new RegExp(`^[:${nameStartChar}][:${nameChar}]*$`, 'u');

// Regular expression to check if a string is a valid XML qualified name
const qnameRegex = new RegExp(
  `(?:^[${nameStartChar}][${nameChar}]*:[${nameStartChar}][${nameChar}]*)|(?:^[${nameStartChar}][${nameChar}]*)$`, 
  'u'
);

// Function to check if a given string can be a valid XML name
exports.name = function(potentialName) {
  return nameRegex.test(potentialName);
};

// Function to check if a given string can be a valid XML qualified name
exports.qname = function(potentialQname) {
  return qnameRegex.test(potentialQname);
};
