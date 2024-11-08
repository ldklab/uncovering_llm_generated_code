"use strict";

const { namedReferences, bodyRegExps } = require("./named-references");
const { numericUnicodeMap } = require("./numeric-unicode-map");
const { getCodePoint, fromCodePoint } = require("./surrogate-pairs");

const allNamedReferences = {
  ...namedReferences,
  all: namedReferences.html5
};

function replaceUsingRegExp(macroText, macroRegExp, macroReplacer) {
  macroRegExp.lastIndex = 0;
  let replaceResult = "";
  let replaceLastIndex = 0;
  let replaceMatch;
  
  while ((replaceMatch = macroRegExp.exec(macroText))) {
    if (replaceLastIndex !== replaceMatch.index) {
      replaceResult += macroText.substring(replaceLastIndex, replaceMatch.index);
    }
    const replaceInput = replaceMatch[0];
    replaceResult += macroReplacer(replaceInput);
    replaceLastIndex = replaceMatch.index + replaceInput.length;
  }

  if (replaceLastIndex !== macroText.length) {
    replaceResult += macroText.substring(replaceLastIndex);
  }

  return replaceResult;
}

const encodeRegExps = {
  specialChars: /[<>'"&]/g,
  nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
  nonAsciiPrintable: /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
  nonAsciiPrintableOnly: /[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
  extensive: /[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
};

const defaultEncodeOptions = {
  mode: "specialChars",
  level: "all",
  numeric: "decimal"
};

function encode(text, options = defaultEncodeOptions) {
  const { mode = "specialChars", numeric = "decimal", level = "all" } = options;
  if (!text) return "";
  
  const encodeRegExp = encodeRegExps[mode];
  const references = allNamedReferences[level].characters;
  const isHex = numeric === "hexadecimal";

  return replaceUsingRegExp(text, encodeRegExp, (input) => {
    let result = references[input];
    if (!result) {
      const code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
      result = (isHex ? `&#x${code.toString(16)}` : `&#${code}`) + ";";
    }
    return result;
  });
}

exports.encode = encode;

const defaultDecodeOptions = {
  scope: "body",
  level: "all"
};

const strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
const attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;

const baseDecodeRegExps = {
  xml: { strict, attribute, body: bodyRegExps.xml },
  html4: { strict, attribute, body: bodyRegExps.html4 },
  html5: { strict, attribute, body: bodyRegExps.html5 }
};

const decodeRegExps = { ...baseDecodeRegExps, all: baseDecodeRegExps.html5 };

function getDecodedEntity(entity, references, isAttribute, isStrict) {
  let decodeResult = entity;
  const lastChar = entity[entity.length - 1];

  if (isAttribute && lastChar === "=") {
    decodeResult = entity;
  } else if (isStrict && lastChar !== ";") {
    decodeResult = entity;
  } else {
    const byReference = references[entity];
    if (byReference) {
      decodeResult = byReference;
    } else if (entity.startsWith("&#")) {
      const isHex = entity[2].toLowerCase() === "x";
      const code = parseInt(isHex ? entity.slice(3) : entity.slice(2), isHex ? 16 : 10);
      
      decodeResult = code >= 0x10FFFF ? String.fromCharCode(65533) : 
                     code > 0xFFFF ? fromCodePoint(code) : 
                     String.fromCharCode(numericUnicodeMap[code] || code);
    }
  }
  return decodeResult;
}

function decodeEntity(entity, options = { level: "all" }) {
  const { level = "all" } = options;
  if (!entity) return "";
  return getDecodedEntity(entity, allNamedReferences[level].entities, false, false);
}

exports.decodeEntity = decodeEntity;

function decode(text, options = defaultDecodeOptions) {
  const { level = "all", scope = level === "xml" ? "strict" : "body" } = options;
  if (!text) return "";

  const decodeRegExp = decodeRegExps[level][scope];
  const references = allNamedReferences[level].entities;
  const isAttribute = scope === "attribute";
  const isStrict = scope === "strict";

  return replaceUsingRegExp(text, decodeRegExp, (entity) => 
    getDecodedEntity(entity, references, isAttribute, isStrict)
  );
}

exports.decode = decode;
