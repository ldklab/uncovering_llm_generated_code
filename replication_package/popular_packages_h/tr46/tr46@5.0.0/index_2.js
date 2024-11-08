"use strict";

const punycode = require("punycode/");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/u.test(str);
}

function findStatus(codePoint, { useSTD3ASCIIRules }) {
  let low = 0;
  let high = mappingTable.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const range = mappingTable[mid];
    const rangeStart = Array.isArray(range[0]) ? range[0][0] : range[0];
    const rangeEnd = Array.isArray(range[0]) ? range[0][1] : range[0];

    if (rangeStart <= codePoint && codePoint <= rangeEnd) {
      if (useSTD3ASCIIRules &&
          (range[1] === STATUS_MAPPING.disallowed_STD3_valid || range[1] === STATUS_MAPPING.disallowed_STD3_mapped)) {
        return [STATUS_MAPPING.disallowed, ...range.slice(2)];
      } else if (range[1] === STATUS_MAPPING.disallowed_STD3_valid) {
        return [STATUS_MAPPING.valid, ...range.slice(2)];
      } else if (range[1] === STATUS_MAPPING.disallowed_STD3_mapped) {
        return [STATUS_MAPPING.mapped, ...range.slice(2)];
      }
      return range.slice(1);
    } else if (codePoint < rangeStart) {
      high = mid - 1;
    } else {
      low = mid + 1;
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
        result += (options.transitionalProcessing && char === "ẞ") ? "ss" : mapping;
        break;
      case STATUS_MAPPING.deviation:
        result += (options.transitionalProcessing) ? mapping : char;
        break;
      case STATUS_MAPPING.valid:
        result += char;
        break;
    }
  }

  return result;
}

function validateLabel(label, options) {
  if (label.length === 0) return true;
  if (label.normalize("NFC") !== label) return false;

  const characters = Array.from(label);

  if (options.checkHyphens) {
    if ((characters[2] === "-" && characters[3] === "-") || (label.startsWith("-") || label.endsWith("-"))) {
      return false;
    }
  }

  if (label.includes(".") || regexes.combiningMarks.test(characters[0])) return false;

  for (const char of characters) {
    const [status] = findStatus(char.codePointAt(0), options);
    if (options.transitionalProcessing) {
      if (status !== STATUS_MAPPING.valid) return false;
    } else if (status !== STATUS_MAPPING.valid && status !== STATUS_MAPPING.deviation) {
      return false;
    }
  }

  if (options.checkJoiners) {
    let lastIndex = 0;
    for (const [i, char] of characters.entries()) {
      if (char === "\u200C" || char === "\u200D") {
        if (i > 0) {
          if (regexes.combiningClassVirama.test(characters[i - 1])) continue;
          if (char === "\u200C") {
            const nextIndex = characters.indexOf("\u200C", i + 1);
            const testSlice = nextIndex < 0 ? characters.slice(lastIndex) : characters.slice(lastIndex, nextIndex);
            if (regexes.validZWNJ.test(testSlice.join(""))) {
              lastIndex = i + 1;
              continue;
            }
          }
        }
        return false;
      }
    }
  }

  if (options.checkBidi && options.isBidi) {
    let isRTL;
    if (regexes.bidiS1LTR.test(characters[0])) {
      isRTL = false;
    } else if (regexes.bidiS1RTL.test(characters[0])) {
      isRTL = true;
    } else {
      return false;
    }

    if (isRTL) {
      if (!regexes.bidiS2.test(label) || !regexes.bidiS3.test(label) || 
        (regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label))) {
        return false;
      }
    } else if (!regexes.bidiS5.test(label) || !regexes.bidiS6.test(label)) {
      return false;
    }
  }

  return true;
}

function isBidiDomain(labels) {
  const domain = labels.map(label => {
    if (label.startsWith("xn--")) {
      try {
        return punycode.decode(label.substring(4));
      } catch {
        return "";
      }
    }
    return label;
  }).join(".");
  return regexes.bidiDomain.test(domain);
}

function processing(domainName, options) {
  let processedString = mapChars(domainName, options);
  processedString = processedString.normalize("NFC");

  const labels = processedString.split(".");
  const isBidi = isBidiDomain(labels);
  let hasError = false;

  for (const [i, originalLabel] of labels.entries()) {
    let label = originalLabel;
    let currentTransitionalProcessing = options.transitionalProcessing;

    if (label.startsWith("xn--")) {
      if (containsNonASCII(label)) {
        hasError = true;
        continue;
      }

      try {
        label = punycode.decode(label.substring(4));
      } catch {
        if (!options.ignoreInvalidPunycode) {
          hasError = true;
          continue;
        }
      }
      labels[i] = label;
      currentTransitionalProcessing = false;
    }

    if (hasError) continue;

    const isValid = validateLabel(label, {
      ...options,
      transitionalProcessing: currentTransitionalProcessing,
      isBidi
    });

    if (!isValid) {
      hasError = true;
    }
  }

  return {
    string: labels.join("."),
    error: hasError
  };
}

function toASCII(domainName, config = {}) {
  const result = processing(domainName, config);
  let labels = result.string.split(".");
  
  labels = labels.map(label => {
    if (containsNonASCII(label)) {
      try {
        return `xn--${punycode.encode(label)}`;
      } catch {
        result.error = true;
      }
    }
    return label;
  });

  if (config.verifyDNSLength) {
    const totalLength = labels.join(".").length;
    if (totalLength > 253 || totalLength === 0 || labels.some(label => label.length > 63 || label.length === 0)) {
      result.error = true;
    }
  }

  return result.error ? null : labels.join(".");
}

function toUnicode(domainName, config = {}) {
  const processingResult = processing(domainName, config);
  return {
    domain: processingResult.string,
    error: processingResult.error
  };
}

module.exports = {
  toASCII,
  toUnicode
};
