"use strict";

(function (global) {
  const b = /^(b|B)$/;
  const symbol = {
    iec: {
      bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
      bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    },
    jedec: {
      bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
      bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    }
  };
  
  const fullform = {
    iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
    jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
  };

  function filesize(arg, descriptor = {}) {
    const result = [];
    let val = 0;
    let e;
    let num = Number(arg);

    if (isNaN(num)) {
      throw new TypeError("Invalid number");
    }

    const neg = num < 0;
    if (neg) num = -num;

    const bits = descriptor.bits === true;
    const unix = descriptor.unix === true;
    const base = descriptor.base || 2;
    const round = descriptor.round !== void 0 ? descriptor.round : unix ? 1 : 2;
    const locale = descriptor.locale !== void 0 ? descriptor.locale : "";
    const localeOptions = descriptor.localeOptions || {};
    const separator = descriptor.separator !== void 0 ? descriptor.separator : "";
    const spacer = descriptor.spacer !== void 0 ? descriptor.spacer : unix ? "" : " ";
    const symbols = descriptor.symbols || {};
    const standard = base === 2 ? descriptor.standard || "jedec" : "jedec";
    const output = descriptor.output || "string";
    const full = descriptor.fullform === true;
    const fullforms = Array.isArray(descriptor.fullforms) ? descriptor.fullforms : [];
    e = descriptor.exponent !== void 0 ? descriptor.exponent : -1;

    const ceil = base > 2 ? 1000 : 1024;
    if (e === -1 || isNaN(e)) {
      e = Math.floor(Math.log(num) / Math.log(ceil));
      if (e < 0) e = 0;
    }

    if (e > 8) e = 8;
    if (output === "exponent") return e;

    if (num === 0) {
      result[0] = 0;
      result[1] = unix ? "" : symbol[standard][bits ? "bits" : "bytes"][e];
    } else {
      val = num / Math.pow(base === 2 ? 1024 : 1000, e);
      if (bits) {
        val *= 8;
        if (val >= ceil && e < 8) {
          val /= ceil;
          e++;
        }
      }
      
      result[0] = Number(val.toFixed(e > 0 ? round : 0));
      if (result[0] === ceil && e < 8 && descriptor.exponent === void 0) {
        result[0] = 1;
        e++;
      }
      result[1] = symbol[standard][bits ? "bits" : "bytes"][e];

      if (unix) {
        result[1] = standard === "jedec" ? result[1].charAt(0) : e > 0 ? result[1].replace(/B$/, "") : result[1];
        if (b.test(result[1])) {
          result[0] = Math.floor(result[0]);
          result[1] = "";
        }
      }
    }

    if (neg) result[0] = -result[0];
    result[1] = symbols[result[1]] || result[1];

    if (locale === true) {
      result[0] = result[0].toLocaleString();
    } else if (locale.length > 0) {
      result[0] = result[0].toLocaleString(locale, localeOptions);
    } else if (separator.length > 0) {
      result[0] = result[0].toString().replace(".", separator);
    }

    if (output === "array") {
      return result;
    }

    if (full) {
      result[1] = fullforms[e] ? fullforms[e] : fullform[standard][e] + (bits ? "bit" : "byte") + (result[0] === 1 ? "" : "s");
    }

    if (output === "object") {
      return {
        value: result[0],
        symbol: result[1],
        exponent: e
      };
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
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return filesize;
    });
  } else {
    global.filesize = filesize;
  }
})(typeof window !== "undefined" ? window : global);
