"use strict";

/**
 * This module exports two functions, `name` and `qname`, which validate
 * given strings as XML name and qualified name according to specific characteristics.
 * 
 * 1. `name` validates whether the input string is a valid XML name.
 * 2. `qname` checks if the input string is a valid XML qualified name.
 * 
 * The regular expressions used in these functions ensure compliance
 * with the specified ranges for XML name start and name characters.
 */

const XML_NAME_START_CHAR = '[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}]';
const XML_NAME_CHAR = `${XML_NAME_START_CHAR}|[-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]`;

exports.name = potentialName => {
  const nameRegex = new RegExp(`^${XML_NAME_START_CHAR}${XML_NAME_CHAR}*$`, 'u');
  return nameRegex.test(potentialName);
};

exports.qname = potentialQname => {
  const qnameRegex = new RegExp(
    `^(?:${XML_NAME_START_CHAR}${XML_NAME_CHAR}*:${XML_NAME_START_CHAR}${XML_NAME_CHAR}*|` + 
    `${XML_NAME_START_CHAR}${XML_NAME_CHAR}*)$`, 
    'u'
  );
  return qnameRegex.test(potentialQname);
};
