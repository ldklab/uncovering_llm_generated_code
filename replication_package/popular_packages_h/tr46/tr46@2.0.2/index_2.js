"use strict";

const punycode = require("punycode");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/.test(str);
}

function findStatus(val, { useSTD3ASCIIRules }) {
  let start = 0, end = mappingTable.length - 1;
  
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const target = mappingTable[mid];
    const min = Array.isArray(target[0]) ? target[0][0] : target[0];
    const max = Array.isArray(target[0]) ? target[0][1] : target[0];

    if (min <= val && max >= val) {
      switch (target[1]) {
        case STATUS_MAPPING.disallowed_STD3_valid:
          return [useSTD3ASCIIRules ? STATUS_MAPPING.disallowed : STATUS_MAPPING.valid, ...target.slice(2)];
        case STATUS_MAPPING.disallowed_STD3_mapped:
          return [useSTD3ASCIIRules ? STATUS_MAPPING.disallowed : STATUS_MAPPING.mapped, ...target.slice(2)];
        default:
          return target.slice(1);
      }
    } else if (min > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

function mapChars(domainName, { useSTD3ASCIIRules, processingOption }) {
  let hasError = false, processed = "";

  for (const ch of domainName) {
    const [status, mapping] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });
    switch (status) {
      case STATUS_MAPPING.disallowed:
        hasError = true;
        processed += ch;
        break;
      case STATUS_MAPPING.ignored:
        break;
      case STATUS_MAPPING.mapped:
        processed += mapping;
        break;
      case STATUS_MAPPING.deviation:
        processed += processingOption === "transitional" ? mapping : ch;
        break;
      default:
        processed += ch;
        break;
    }
  }

  return { string: processed, error: hasError };
}

function validateLabel(label, options) {
  if (label.normalize("NFC") !== label) return false;
  
  const { checkHyphens, checkBidi, checkJoiners, processingOption, useSTD3ASCIIRules } = options;
  const codePoints = Array.from(label);

  if (checkHyphens && ((codePoints[2] === "-" && codePoints[3] === "-") || label.startsWith("-") || label.endsWith("-"))) {
    return false;
  }

  if (label.includes(".") || (codePoints.length > 0 && regexes.combiningMarks.test(codePoints[0]))) {
    return false;
  }

  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });
    if ((processingOption === "transitional" && status !== STATUS_MAPPING.valid) ||
        (processingOption === "nontransitional" && ![STATUS_MAPPING.valid, STATUS_MAPPING.deviation].includes(status))) {
      return false;
    }
  }

  if (checkJoiners) {
    let last = 0;
    for (const [i, ch] of codePoints.entries()) {
      if (ch === "\u200C" || ch === "\u200D") {
        if (i > 0 && regexes.combiningClassVirama.test(codePoints[i - 1])) continue;
        if (ch === "\u200C" && codePoints.slice(last).filter((c, j) => c === '\u200C' && codePoints.indexOf(c, j + 1) - j > 1).some(test => regexes.validZWNJ.test(test.join("")))) {
          last = i + 1;
          continue;
        }
        return false;
      }
    }
  }

  if (checkBidi) {
    const rtl = regexes.bidiS1RTL.test(codePoints[0]);

    if (!regexes.bidiS1LTR.test(codePoints[0]) && (!rtl || !regexes.bidiS2.test(label) || !regexes.bidiS3.test(label) || (regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label))) && (!rtl && (!regexes.bidiS5.test(label) || !regexes.bidiS6.test(label)))) {
      return false;
    }
  }

  return true;
}

function isBidiDomain(labels) {
  const domain = labels.map(label => label.startsWith("xn--") ? punycode.decode(label.substring(4)) : label).join(".");
  return regexes.bidiDomain.test(domain);
}

function processing(domainName, options) {
  const { processingOption } = options;
  const { string, error: mapError } = mapChars(domainName, options);
  const labels = string.normalize("NFC").split(".");
  const isBidi = isBidiDomain(labels);

  let hasError = mapError;

  for (const [i, origLabel] of labels.entries()) {
    if (hasError) continue;

    let label = origLabel;
    let curProcessing = processingOption;

    if (label.startsWith("xn--")) {
      try {
        label = punycode.decode(label.substring(4));
        labels[i] = label;
      } catch {
        hasError = true;
        continue;
      }
      curProcessing = "nontransitional";
    }

    if (!validateLabel(label, { ...options, processingOption: curProcessing, checkBidi: options.checkBidi && isBidi })) {
      hasError = true;
    }
  }

  return { string: labels.join("."), error: hasError };
}

function toASCII(domainName, options = {}) {
  const result = processing(domainName, options);
  let labels = result.string.split(".");
  result.string = labels.map(l => containsNonASCII(l) ? `xn--${punycode.encode(l)}` : l).join(".");

  if (options.verifyDNSLength) {
    const totalLength = result.string.length;
    if (totalLength > 253 || totalLength === 0 || labels.some(l => l.length > 63 || l.length === 0)) {
      result.error = true;
    }
  }

  return result.error ? null : result.string;
}

function toUnicode(domainName, options = {}) {
  const { string, error } = processing(domainName, options);
  return { domain: string, error };
}

module.exports = { toASCII, toUnicode };
