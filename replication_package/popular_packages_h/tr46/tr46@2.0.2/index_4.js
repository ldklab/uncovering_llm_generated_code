"use strict";

const punycode = require("punycode");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

// Check if a string contains any non-ASCII characters
function containsNonASCII(str) {
  return /[^\x00-\x7F]/.test(str);
}

// Find the character status based on the mapping table
function findStatus(val, options) {
  let start = 0, end = mappingTable.length - 1, { useSTD3ASCIIRules } = options;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const target = mappingTable[mid], [min, max] = Array.isArray(target[0]) ? target[0] : [target[0]];
    if (min <= val && max >= val) {
      if (useSTD3ASCIIRules && 
          [STATUS_MAPPING.disallowed_STD3_valid, STATUS_MAPPING.disallowed_STD3_mapped].includes(target[1])) {
        return [STATUS_MAPPING.disallowed, ...target.slice(2)];
      }
      if (target[1] === STATUS_MAPPING.disallowed_STD3_valid) return [STATUS_MAPPING.valid, ...target.slice(2)];
      if (target[1] === STATUS_MAPPING.disallowed_STD3_mapped) return [STATUS_MAPPING.mapped, ...target.slice(2)];
      return target.slice(1);
    }
    val < min ? end = mid - 1 : start = mid + 1;
  }
  return null;
}

// Map characters based on their status
function mapChars(domainName, options) {
  let hasError = false, processed = "";
  for (const ch of domainName) {
    const [status, mapping] = findStatus(ch.codePointAt(0), options);
    if (status === STATUS_MAPPING.disallowed) {
      hasError = true;
      processed += ch;
    } else if (status === STATUS_MAPPING.mapped || (status === STATUS_MAPPING.deviation && options.processingOption === "transitional")) {
      processed += mapping;
    } else if (status === STATUS_MAPPING.valid || status === STATUS_MAPPING.deviation) {
      processed += ch;
    }
  }
  return { string: processed, error: hasError };
}

// Validate the domain label according to specified rules
function validateLabel(label, options) {
  if (label.normalize("NFC") !== label) return false;
  const codePoints = Array.from(label);
  if (options.checkHyphens && ((label.startsWith("-") || label.endsWith("-")) || (codePoints[2] === "-" && codePoints[3] === "-"))) {
    return false;
  }
  if (label.includes(".") || (regexes.combiningMarks.test(codePoints[0]) && codePoints.length)) return false;
  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), options);
    if ((options.processingOption === "transitional" && status !== STATUS_MAPPING.valid) ||
        (options.processingOption === "nontransitional" && ![STATUS_MAPPING.valid, STATUS_MAPPING.deviation].includes(status))) {
      return false;
    }
  }
  if (options.checkJoiners && !checkJoinersValidity(codePoints)) {
    return false;
  }
  return !options.checkBidi || checkBidiValidity(label);
}

// Separate function to handle joiners check (for clarity)
function checkJoinersValidity(codePoints) {
  let last = 0;
  for (const [i, ch] of codePoints.entries()) {
    if (ch === "\u200C" || ch === "\u200D") {
      if (i > 0 && regexes.combiningClassVirama.test(codePoints[i - 1])) continue;
      if (ch === "\u200C") {
        const next = codePoints.indexOf("\u200C", i + 1);
        const test = codePoints.slice(last, next < 0 ? codePoints.length : next);
        if (regexes.validZWNJ.test(test.join(""))) {
          last = i + 1;
          continue;
        }
      }
      return false;
    }
  }
  return true;
}

// Handle checking of Bidi rules
function checkBidiValidity(label) {
  const codePoints = Array.from(label);
  let rtl = regexes.bidiS1RTL.test(codePoints[0]);
  if (!rtl && !regexes.bidiS1LTR.test(codePoints[0])) {
    return false;
  }
  if (rtl) {
    return regexes.bidiS2.test(label) && regexes.bidiS3.test(label) && 
           !(regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label));
  }
  return regexes.bidiS5.test(label) && regexes.bidiS6.test(label);
}

// Check if any domain labels contain bidirectional characters
function isBidiDomain(labels) {
  return regexes.bidiDomain.test(labels.map(label => label.startsWith("xn--") ? punycode.decode(label.substring(4)) : label).join("."));
}

// Process the domain name by mapping, normalizing, and validating
function processing(domainName, options) {
  let { string, error } = mapChars(domainName, options);
  string = string.normalize("NFC");
  const labels = string.split("."),
        isBidi = isBidiDomain(labels);

  for (const [i, origLabel] of labels.entries()) {
    let label = origLabel, curProcessing = options.processingOption;
    if (label.startsWith("xn--")) {
      try {
        label = punycode.decode(label.substring(4));
        labels[i] = label;
      } catch (err) {
        error = true;
        continue;
      }
      curProcessing = "nontransitional";
    }
    if (!error && !validateLabel(label, { ...options, processingOption: curProcessing, checkBidi: options.checkBidi && isBidi })) {
      error = true;
    }
  }
  return { string: labels.join("."), error };
}

// Convert a Unicode domain name to ASCII
function toASCII(domainName, options = {}) {
  const {
    checkHyphens = false, checkBidi = false, checkJoiners = false,
    useSTD3ASCIIRules = false, processingOption = "nontransitional",
    verifyDNSLength = false
  } = options;
  if (!["transitional", "nontransitional"].includes(processingOption)) {
    throw new RangeError("processingOption must be either transitional or nontransitional");
  }

  const result = processing(domainName, { processingOption, checkHyphens, checkBidi, checkJoiners, useSTD3ASCIIRules });
  let labels = result.string.split(".");
  labels = labels.map(l => containsNonASCII(l) ? "xn--" + punycode.encode(l) : l);

  if (verifyDNSLength) {
    const totalLength = labels.join(".").length;
    if (totalLength > 253 || totalLength === 0 || labels.some(l => l.length > 63 || l.length === 0)) {
      result.error = true;
    }
  }

  return result.error ? null : labels.join(".");
}

// Convert an ASCII domain name to Unicode
function toUnicode(domainName, options = {}) {
  const { processingOption = "nontransitional", checkHyphens = false, checkBidi = false, checkJoiners = false, useSTD3ASCIIRules = false } = options;
  const result = processing(domainName, { processingOption, checkHyphens, checkBidi, checkJoiners, useSTD3ASCIIRules });
  return { domain: result.string, error: result.error };
}

module.exports = { toASCII, toUnicode };
