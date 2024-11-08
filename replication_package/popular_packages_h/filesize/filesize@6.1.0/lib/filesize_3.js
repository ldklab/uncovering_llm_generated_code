"use strict";

/**
 * filesize
 * @copyright 2020 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 6.1.0
 */
(function (global) {
  const unitSymbols = {
    iec: {
      bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
      bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    },
    jedec: {
      bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
      bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    }
  };

  const fullFormUnits = {
    iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
    jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
  };

  function filesize(arg, descriptor = {}) {
    if (isNaN(arg)) {
      throw new TypeError("Invalid number");
    }

    const base = descriptor.base || 2;
    const round = descriptor.round ?? (descriptor.unix ? 1 : 2);
    const symbols = descriptor.symbols || {};
    const standard = base === 2 ? (descriptor.standard || "jedec") : "jedec";
    const spacer = descriptor.unix ? "" : (descriptor.spacer !== undefined ? descriptor.spacer : " ");
    const ceil = base > 2 ? 1000 : 1024;
    const neg = arg < 0;
    let num = Math.abs(Number(arg));
    let e = (descriptor.exponent !== undefined) ? descriptor.exponent : Math.floor(Math.log(num) / Math.log(ceil));
    
    if (e < 0) e = 0;
    if (e > 8) e = 8;
    
    if (num === 0) {
      return formatResult([0, descriptor.unix ? "" : unitSymbols[standard][descriptor.bits ? "bits" : "bytes"][e]], descriptor);
    }

    let val = num / Math.pow(base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e), descriptor.bits ? 0 : 1);

    if (descriptor.bits) {
      val *= 8;
      if (val >= ceil && e < 8) {
        val /= ceil;
        e++;
      }
    }

    const result = [
      Number(val.toFixed(e > 0 ? round : 0)),
      e > 0 ? unitSymbols[standard][descriptor.bits ? "bits" : "bytes"][e] : (base === 10 && e === 1 ? (descriptor.bits ? "kb" : "kB") : unitSymbols[standard][descriptor.bits ? "bits" : "bytes"][e])
    ];

    if (result[0] === ceil && e < 8 && descriptor.exponent === undefined) {
      result[0] = 1;
      e++;
    }

    if (neg) result[0] = -result[0];
    result[1] = symbols[result[1]] || result[1];

    return formatResult(result, descriptor);
  }

  function formatResult([value, symbol], descriptor) {
    const { locale, separator, output, full, fullforms } = descriptor;

    if (locale === true) {
      value = value.toLocaleString();
    } else if (locale) {
      value = value.toLocaleString(locale, descriptor.localeOptions || {});
    } else if (separator) {
      value = value.toString().replace(".", separator);
    }

    if (full) {
      const fullForm = fullforms instanceof Array ? fullforms : fullFormUnits[descriptor.standard || "jedec"];
      symbol = `${fullForm[symbol]}${descriptor.bits ? "bit" : "byte"}${value === 1 ? "" : "s"}`;
    }

    if (output === "array") {
      return [value, symbol];
    }

    if (output === "object") {
      return { value, symbol, exponent: descriptor.exponent };
    }

    return `${value}${descriptor.spacer || " "}${symbol}`.trim();
  }

  filesize.partial = function (opt) {
    return function (arg) {
      return filesize(arg, opt);
    };
  };

  if (typeof exports !== "undefined") {
    module.exports = filesize;
  } else if (typeof define === "function" && define.amd) {
    define(() => filesize);
  } else {
    global.filesize = filesize;
  }
})(typeof window !== "undefined" ? window : global);
