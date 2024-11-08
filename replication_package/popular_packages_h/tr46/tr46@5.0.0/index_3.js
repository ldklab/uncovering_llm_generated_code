"use strict";

const punycode = require("punycode/");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/u.test(str);
}

function findStatus(val, { useSTD3ASCIIRules }) {
  let start = 0;
  let end = mappingTable.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const target = mappingTable[mid];
    const [min, max] = Array.isArray(target[0]) ? target[0] : [target[0], target[0]];

    if (min <= val && max >= val) {
      if (useSTD3ASCIIRules) {
        if (target[1] === STATUS_MAPPING.disallowed_STD3_valid || target[1] === STATUS_MAPPING.disallowed_STD3_mapped) {
          return [STATUS_MAPPING.disallowed, ...target.slice(2)];
        }
      }
      if (target[1] === STATUS_MAPPING.disallowed_STD3_valid) {
        return [STATUS_MAPPING.valid, ...target.slice(2)];
      }
      if (target[1] === STATUS_MAPPING.disallowed_STD3_mapped) {
        return [STATUS_MAPPING.mapped, ...target.slice(2)];
      }
      return target.slice(1);
    } else if (min > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

function mapChars(domainName, { useSTD3ASCIIRules, transitionalProcessing }) {
  let processed = "";

  for (const ch of domainName) {
    const [status, mapping] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });

    switch (status) {
      case STATUS_MAPPING.disallowed:
        processed += ch;
        break;
      case STATUS_MAPPING.ignored:
        break;
      case STATUS_MAPPING.mapped:
        processed += (transitionalProcessing && ch === "ẞ") ? "ss" : mapping;
        break;
      case STATUS_MAPPING.deviation:
        processed += transitionalProcessing ? mapping : ch;
        break;
      case STATUS_MAPPING.valid:
        processed += ch;
        break;
    }
  }

  return processed;
}

function validateLabel(label, {
  checkHyphens,
  checkBidi,
  checkJoiners,
  transitionalProcessing,
  useSTD3ASCIIRules,
  isBidi
}) {
  if (label.length === 0) return true;
  if (label.normalize("NFC") !== label) return false;

  const codePoints = Array.from(label);

  if (checkHyphens) {
    if ((codePoints[2] === "-" && codePoints[3] === "-") || label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
  }

  if (label.includes(".")) return false;

  if (regexes.combiningMarks.test(codePoints[0])) return false;

  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });
    if (transitionalProcessing && status !== STATUS_MAPPING.valid) return false;
    if (!transitionalProcessing && status !== STATUS_MAPPING.valid && status !== STATUS_MAPPING.deviation) return false;
  }

  if (checkJoiners) {
    let last = 0;
    for (const [i, ch] of codePoints.entries()) {
      if (ch === "\u200C" || ch === "\u200D") {
        if (i > 0 && regexes.combiningClassVirama.test(codePoints[i - 1])) continue;
        if (ch === "\u200C") {
          const next = codePoints.indexOf("\u200C", i + 1);
          const test = next < 0 ? codePoints.slice(last) : codePoints.slice(last, next);
          if (regexes.validZWNJ.test(test.join(""))) {
            last = i + 1;
            continue;
          }
        }
        return false;
      }
    }
  }

  if (checkBidi && isBidi) {
    let rtl;
    if (regexes.bidiS1LTR.test(codePoints[0])) {
      rtl = false;
    } else if (regexes.bidiS1RTL.test(codePoints[0])) {
      rtl = true;
    } else {
      return false;
    }

    if (rtl) {
      if (!regexes.bidiS2.test(label) ||
          !regexes.bidiS3.test(label) ||
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
  const domain = labels.map(label => label.startsWith("xn--") ?
    (() => { try { return punycode.decode(label.substring(4)); } catch (err) { return ""; } })()
    : label).join(".");
  return regexes.bidiDomain.test(domain);
}

function processing(domainName, options) {
  let string = mapChars(domainName, options);
  string = string.normalize("NFC");
  const labels = string.split(".");
  const isBidi = isBidiDomain(labels);

  let error = false;
  labels.forEach((origLabel, i) => {
    let label = origLabel;
    let transitionalProcessingForThisLabel = options.transitionalProcessing;

    if (label.startsWith("xn--")) {
      if (containsNonASCII(label)) {
        error = true;
        return;
      }
      try {
        label = punycode.decode(label.substring(4));
      } catch {
        if (!options.ignoreInvalidPunycode) {
          error = true;
          return;
        }
      }
      labels[i] = label;
      transitionalProcessingForThisLabel = false;
    }

    if (!error) {
      const isValid = validateLabel(label, {
        ...options,
        transitionalProcessing: transitionalProcessingForThisLabel,
        isBidi
      });
      if (!isValid) error = true;
    }
  });

  return {
    string: labels.join("."),
    error
  };
}

function toASCII(domainName, {
  checkHyphens = false,
  checkBidi = false,
  checkJoiners = false,
  useSTD3ASCIIRules = false,
  verifyDNSLength = false,
  transitionalProcessing = false,
  ignoreInvalidPunycode = false
} = {}) {
  const result = processing(domainName, {
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules,
    transitionalProcessing,
    ignoreInvalidPunycode
  });
  let labels = result.string.split(".");
  labels = labels.map(l => {
    if (containsNonASCII(l)) {
      try {
        return `xn--${punycode.encode(l)}`;
      } catch (e) {
        result.error = true;
      }
    }
    return l;
  });

  if (verifyDNSLength) {
    const total = labels.join(".").length;
    if (total > 253 || total === 0) result.error = true;

    for (let i = 0; i < labels.length; ++i) {
      if (labels[i].length > 63 || labels[i].length === 0) {
        result.error = true;
        break;
      }
    }
  }

  if (result.error) return null;
  return labels.join(".");
}

function toUnicode(domainName, {
  checkHyphens = false,
  checkBidi = false,
  checkJoiners = false,
  useSTD3ASCIIRules = false,
  transitionalProcessing = false,
  ignoreInvalidPunycode = false
} = {}) {
  const result = processing(domainName, {
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules,
    transitionalProcessing,
    ignoreInvalidPunycode
  });

  return {
    domain: result.string,
    error: result.error
  };
}

module.exports = {
  toASCII,
  toUnicode
};
