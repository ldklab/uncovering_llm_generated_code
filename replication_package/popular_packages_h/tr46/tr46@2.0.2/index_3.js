"use strict";

const punycode = require("punycode");
const regexes = require("./lib/regexes.js");
const mappingTable = require("./lib/mappingTable.json");
const { STATUS_MAPPING } = require("./lib/statusMapping.js");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/.test(str);
}

function findStatus(val, { useSTD3ASCIIRules }) {
  let start = 0;
  let end = mappingTable.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const target = mappingTable[mid];
    const min = Array.isArray(target[0]) ? target[0][0] : target[0];
    const max = Array.isArray(target[0]) ? target[0][1] : target[0];

    if (min <= val && max >= val) {
      if (useSTD3ASCIIRules && 
          (target[1] === STATUS_MAPPING.disallowed_STD3_valid || target[1] === STATUS_MAPPING.disallowed_STD3_mapped)) {
        return [STATUS_MAPPING.disallowed, ...target.slice(2)];
      } else if (target[1] === STATUS_MAPPING.disallowed_STD3_valid) {
        return [STATUS_MAPPING.valid, ...target.slice(2)];
      } else if (target[1] === STATUS_MAPPING.disallowed_STD3_mapped) {
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

function mapChars(domainName, { useSTD3ASCIIRules, processingOption }) {
  let hasError = false;
  let processed = "";

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
      case STATUS_MAPPING.valid:
        processed += ch;
        break;
    }
  }

  return {
    string: processed,
    error: hasError
  };
}

function validateLabel(label, options) {
  if (label.normalize("NFC") !== label) return false;
  const codePoints = Array.from(label);

  if (options.checkHyphens) {
    if ((codePoints[2] === "-" && codePoints[3] === "-") ||
        (label.startsWith("-") || label.endsWith("-"))) {
      return false;
    }
  }

  if (label.includes(".") || (codePoints.length > 0 && regexes.combiningMarks.test(codePoints[0]))) {
    return false;
  }

  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules: options.useSTD3ASCIIRules });
    if ((options.processingOption === "transitional" && status !== STATUS_MAPPING.valid) ||
        (options.processingOption === "nontransitional" && status !== STATUS_MAPPING.valid && status !== STATUS_MAPPING.deviation)) {
      return false;
    }
  }

  if (options.checkJoiners) {
    let last = 0;
    for (const [i, ch] of codePoints.entries()) {
      if (ch === "\u200C" || ch === "\u200D") {
        if (i > 0 && (regexes.combiningClassVirama.test(codePoints[i - 1]) || 
                      (ch === "\u200C" && regexes.validZWNJ.test(codePoints.slice(last, codePoints.indexOf("\u200C", i + 1) < 0 ? undefined : codePoints.indexOf("\u200C", i + 1)).join(""))))) {
          last = i + 1;
        } else {
          return false;
        }
      }
    }
  }

  if (options.checkBidi) {
    let rtl;
    if (regexes.bidiS1LTR.test(codePoints[0])) {
      rtl = false;
    } else if (regexes.bidiS1RTL.test(codePoints[0])) {
      rtl = true;
    } else {
      return false;
    }

    if (rtl) {
      if (!regexes.bidiS2.test(label) || !regexes.bidiS3.test(label) || (regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label))) {
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
      } catch (err) {
        return "";
      }
    }
    return label;
  }).join(".");
  return regexes.bidiDomain.test(domain);
}

function processing(domainName, options) {
  const { processingOption } = options;
  let { string, error } = mapChars(domainName, options);
  string = string.normalize("NFC");
  const labels = string.split(".");
  const isBidi = isBidiDomain(labels);

  for (const [i, origLabel] of labels.entries()) {
    let label = origLabel;
    let curProcessing = processingOption;
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

    if (error) continue;
    const validation = validateLabel(label, { ...options, processingOption: curProcessing, checkBidi: options.checkBidi && isBidi });
    if (!validation) {
      error = true;
    }
  }

  return {
    string: labels.join("."),
    error
  };
}

function toASCII(domainName, options = {}) {
  const {
    checkHyphens = false,
    checkBidi = false,
    checkJoiners = false,
    useSTD3ASCIIRules = false,
    processingOption = "nontransitional",
    verifyDNSLength = false
  } = options;

  if (processingOption !== "transitional" && processingOption !== "nontransitional") {
    throw new RangeError("processingOption must be either transitional or nontransitional");
  }

  const result = processing(domainName, { 
    processingOption, 
    checkHyphens, 
    checkBidi, 
    checkJoiners, 
    useSTD3ASCIIRules 
  });

  let labels = result.string.split(".");
  labels = labels.map(l => {
    if (containsNonASCII(l)) {
      try {
        return "xn--" + punycode.encode(l);
      } catch (e) {
        result.error = true;
      }
    }
    return l;
  });

  if (verifyDNSLength) {
    const total = labels.join(".").length;
    if (total > 253 || total === 0) {
      result.error = true;
    }

    for (let i = 0; i < labels.length; ++i) {
      if (labels[i].length > 63 || labels[i].length === 0) {
        result.error = true;
        break;
      }
    }
  }

  return result.error ? null : labels.join(".");
}

function toUnicode(domainName, options = {}) {
  const result = processing(domainName, {
    processingOption: options.processingOption || "nontransitional", 
    checkHyphens: options.checkHyphens || false, 
    checkBidi: options.checkBidi || false, 
    checkJoiners: options.checkJoiners || false, 
    useSTD3ASCIIRules: options.useSTD3ASCIIRules || false
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
