"use strict";

const punycode = require("punycode/");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/u.test(str);
}

function findStatus(val, options) {
  let low = 0, high = mappingTable.length - 1;
  const useSTD3ASCIIRules = options.useSTD3ASCIIRules;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const [range, status, ...rest] = mappingTable[mid];
    const [min, max] = Array.isArray(range) ? range : [range, range];

    if (val < min) {
      high = mid - 1;
    } else if (val > max) {
      low = mid + 1;
    } else {
      if (useSTD3ASCIIRules && (status === STATUS_MAPPING.disallowed_STD3_valid || 
          status === STATUS_MAPPING.disallowed_STD3_mapped)) {
        return [STATUS_MAPPING.disallowed, ...rest];
      } else if (status === STATUS_MAPPING.disallowed_STD3_valid) {
        return [STATUS_MAPPING.valid, ...rest];
      } else if (status === STATUS_MAPPING.disallowed_STD3_mapped) {
        return [STATUS_MAPPING.mapped, ...rest];
      }
      return [status, ...rest];
    }
  }
  return null;
}

function mapChars(domainName, options) {
  let result = "";

  for (const char of domainName) {
    const [status, mapping] = findStatus(char.codePointAt(0), options);
    switch (status) {
      case STATUS_MAPPING.disallowed:
        result += char;
        break;
      case STATUS_MAPPING.ignored:
        break;
      case STATUS_MAPPING.mapped:
        result += options.transitionalProcessing && char === "ẞ" ? "ss" : mapping;
        break;
      case STATUS_MAPPING.deviation:
        result += options.transitionalProcessing ? mapping : char;
        break;
      case STATUS_MAPPING.valid:
        result += char;
        break;
    }
  }

  return result;
}

function validateLabel(label, options) {
  const { checkHyphens, checkBidi, checkJoiners, transitionalProcessing, useSTD3ASCIIRules, isBidi } = options;

  if (label.length === 0 || label.normalize("NFC") !== label) {
    return false;
  }

  const codePoints = Array.from(label);

  if (checkHyphens && ((codePoints[2] === "-" && codePoints[3] === "-") || label.startsWith("-") || label.endsWith("-"))) {
    return false;
  }

  if (label.includes(".") || regexes.combiningMarks.test(codePoints[0])) {
    return false;
  }

  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), options);
    if (transitionalProcessing && status !== STATUS_MAPPING.valid) {
      return false;
    } else if (!transitionalProcessing && status !== STATUS_MAPPING.valid && status !== STATUS_MAPPING.deviation) {
      return false;
    }
  }

  if (checkJoiners) {
    let last = 0;
    for (const [i, ch] of codePoints.entries()) {
      if (ch === "\u200C" || ch === "\u200D") {
        const prevChar = codePoints[i - 1];
        if ((i > 0 && regexes.combiningClassVirama.test(prevChar)) ||
            (ch === "\u200C" && regexes.validZWNJ.test(codePoints.slice(last, codePoints.indexOf("\u200C", i + 1) || codePoints.length).join("")))) {
          last = i + 1;
          continue;
        }
        return false;
      }
    }
  }

  if (checkBidi && isBidi) {
    const rtlCheck = first => (regexes.bidiS1LTR.test(first) ? false : regexes.bidiS1RTL.test(first) ? true : null);
    const rtl = rtlCheck(codePoints[0]);
    if (rtl === null) return false;

    if (rtl) {
      if (!(regexes.bidiS2.test(label) && regexes.bidiS3.test(label) && !(regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label)))) {
        return false;
      }
    } else if (!(regexes.bidiS5.test(label) && regexes.bidiS6.test(label))) {
      return false;
    }
  }

  return true;
}

function isBidiDomain(labels) {
  return regexes.bidiDomain.test(labels.map(l => l.startsWith("xn--") ? punycode.decode(l.slice(4)) : l).join("."));
}

function processing(domainName, options) {
  let processedString = mapChars(domainName, options).normalize("NFC");
  const labels = processedString.split(".");
  const isBidi = isBidiDomain(labels);

  for (const [i, originalLabel] of labels.entries()) {
    let label = originalLabel;
    let transitional = options.transitionalProcessing;

    if (label.startsWith("xn--")) {
      if (containsNonASCII(label)) return { string: processedString, error: true };
      try {
        label = punycode.decode(label.slice(4));
      } catch {
        if (!options.ignoreInvalidPunycode) return { string: processedString, error: true };
      }
      labels[i] = label;
      transitional = false;
    }

    if (!validateLabel(label, { ...options, transitionalProcessing: transitional, isBidi })) {
      return { string: processedString, error: true };
    }
  }

  return { string: labels.join("."), error: false };
}

function toASCII(domainName, options = {}) {
  const result = processing(domainName, options);
  let labels = result.string.split(".");

  labels = labels.map(label => containsNonASCII(label) ? `xn--${punycode.encode(label)}` : label);
  if (options.verifyDNSLength) {
    const dnsLength = labels.join(".").length;
    if (dnsLength > 253 || dnsLength === 0 || labels.some(l => l.length > 63 || l.length === 0)) {
      return null;
    }
  }

  return result.error ? null : labels.join(".");
}

function toUnicode(domainName, options = {}) {
  const result = processing(domainName, options);
  return { domain: result.string, error: result.error };
}

module.exports = {
  toASCII,
  toUnicode
};
