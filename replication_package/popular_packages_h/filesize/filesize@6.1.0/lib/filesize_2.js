"use strict";

(function (global) {
  const SIZE_UNITS = {
    iec: {
      bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
      bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    },
    jedec: {
      bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
      bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    }
  };

  const FULLFORM_OPTIONS = {
    iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
    jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
  };

  function filesize(arg, descriptor = {}) {
    if (isNaN(arg)) throw new TypeError("Invalid number");

    const base = descriptor.base || 2;
    const standard = base === 2 ? descriptor.standard || "jedec" : "jedec";
    const bits = descriptor.bits === true;
    const round = descriptor.round !== undefined ? descriptor.round : 2;
    const unix = descriptor.unix === true;
    const output = descriptor.output || "string";
    const full = descriptor.fullform === true;
    const separator = descriptor.separator || "";
    const spacer = unix ? "" : descriptor.spacer || " ";
    const symbols = descriptor.symbols || {};
    const fullforms = Array.isArray(descriptor.fullforms) ? descriptor.fullforms : [];
    const locale = descriptor.locale || "";
    const localeOptions = descriptor.localeOptions || {};
    
    let num = Number(arg);
    const neg = num < 0;
    if (neg) num = -num;

    const ceil = base === 10 ? 1000 : 1024;
    let e = descriptor.exponent !== undefined ? descriptor.exponent : Math.floor(Math.log(num) / Math.log(ceil));
    e = Math.min(e, 8);

    if (output === "exponent") return e;

    let result = [], value;
    if (num === 0) {
      result = [0, unix ? "" : SIZE_UNITS[standard][bits ? "bits" : "bytes"][e]];
    } else {
      value = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));
      if (bits) value *= 8;

      result = [Number(value.toFixed(e > 0 ? round : 0))];
      result[1] = SIZE_UNITS[standard][bits ? "bits" : "bytes"][e];

      if (unix) {
        result[1] = result[1].replace(/B$/, "");
        if (/^(b|B)$/.test(result[1])) result[0] = Math.floor(result[0]);
      }
    }

    if (neg) result[0] = -result[0];
    result[1] = symbols[result[1]] || result[1];

    if (locale) {
      result[0] = result[0].toLocaleString(locale, localeOptions);
    } else if (separator) {
      result[0] = result[0].toString().replace(".", separator);
    }

    if (output === "array") return result;
    if (full) {
      result[1] = fullforms[e] || FULLFORM_OPTIONS[standard][e] + (bits ? "bit" : "byte") + (result[0] !== 1 ? "s" : "");
    }

    if (output === "object") {
      return { value: result[0], symbol: result[1], exponent: e };
    }

    return result.join(spacer);
  }

  filesize.partial = function (opt) {
    return function (arg) {
      return filesize(arg, opt);
    };
  };

  if (typeof exports !== "undefined") {
    module.exports = filesize;
  } else if (typeof define === "function" && define.amd !== undefined) {
    define(function () {
      return filesize;
    });
  } else {
    global.filesize = filesize;
  }
})(typeof window !== "undefined" ? window : global);
