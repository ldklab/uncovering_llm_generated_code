"use strict";
const punycode = require("punycode");
const urlParse = require("url").parse;
const util = require("util");
const pubsuffix = require("./pubsuffix-psl");
const Store = require("./store").Store;
const MemoryCookieStore = require("./memstore").MemoryCookieStore;
const pathMatch = require("./pathMatch").pathMatch;
const VERSION = require("./version");
const { fromCallback } = require("universalify");

// Constants
const COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;
const CONTROL_CHARS = /[\x00-\x1F]/;
const TERMINATORS = ["\n", "\r", "\0"];
const PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/;
const DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/;
const MONTH_TO_NUM = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const MAX_TIME = 2147483647000;
const MIN_TIME = 0;
const IP_REGEX_LOWERCASE = /(regex_pattern)/; // Abbreviated pattern
const PrefixSecurityEnum = Object.freeze({ SILENT: "silent", STRICT: "strict", DISABLED: "unsafe-disabled" });
const cookieDefaults = {
  key: "", value: "", expires: "Infinity", maxAge: null, domain: null, path: null,
  secure: false, httpOnly: false, extensions: null, hostOnly: null, pathIsDefault: null,
  creation: null, lastAccessed: null, sameSite: "none"
};

// Helper Functions
function checkSameSiteContext(value) {
  const context = String(value).toLowerCase();
  return context === "none" || context === "lax" || context === "strict" ? context : null;
}

function parseDigits(token, minDigits, maxDigits, trailingOK) {
  let count = 0; // More parsing logic
  // ...
  return parseInt(token.substr(0, count), 10);
}

function parseTime(token) {
  const parts = token.split(":");
  const result = [0, 0, 0];
  // Parsing logic...
  return result;
}

function parseMonth(token) {
  token = String(token).substr(0, 3).toLowerCase();
  const num = MONTH_TO_NUM[token];
  return num >= 0 ? num : null;
}

function parseDate(str) {
  // Parsing logic...
  return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
}

function formatDate(date) {
  return date.toUTCString();
}

function canonicalDomain(str) {
  if (str == null) return null;
  str = str.trim().replace(/^\./, "");
  if (punycode && /[^\u0001-\u007f]/.test(str)) str = punycode.toASCII(str);
  return str.toLowerCase();
}

function domainMatch(str, domStr, canonicalize) {
  // Domain matching logic...
  return true;
}

function defaultPath(path) {
  if (!path || path.substr(0, 1) !== "/") return "/";
  const rightSlash = path.lastIndexOf("/");
  if (rightSlash === 0) return "/";
  return path.slice(0, rightSlash);
}

function parseCookiePair(cookiePair, looseMode) {
  cookiePair = trimTerminator(cookiePair);
  let firstEq = cookiePair.indexOf("=");
  // Further pair parsing logic...
  return c;
}

function parse(str, options) {
  if (!options || typeof options !== "object") options = {};
  str = str.trim();
  const firstSemi = str.indexOf(";");
  const cookiePair = firstSemi === -1 ? str : str.substr(0, firstSemi);
  const c = parseCookiePair(cookiePair, !!options.loose);
  if (!c) return;
  if (firstSemi === -1) return c;
  // Parsing unparsed attributes...
  return c;
}

/**
 * Ensure secure prefix conditions are met for a cookie.
 * @param {Cookie} cookie The cookie to validate.
 * @returns {boolean} Whether the conditions are met.
 */
function isSecurePrefixConditionMet(cookie) {
  return !cookie.key.startsWith("__Secure-") || cookie.secure;
}

/**
 * Ensure host prefix conditions are met for a cookie.
 * @param {Cookie} cookie The cookie to validate.
 * @returns {boolean} Whether the conditions are met.
 */
function isHostPrefixConditionMet(cookie) {
  return !cookie.key.startsWith("__Host-") || (cookie.secure && cookie.hostOnly && cookie.path != null && cookie.path === "/");
}

// JSON utilities
function jsonParse(str) {
  let obj;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return e;
  }
  return obj;
}

function fromJSON(str) {
  if (!str) return null;
  let obj = typeof str === "string" ? jsonParse(str) : str;
  if (obj instanceof Error) return null;
  const c = new Cookie();
  for (let prop of Cookie.serializableProperties) {
    if (obj[prop] === undefined || obj[prop] === cookieDefaults[prop]) continue;
    if (prop === "expires" || prop === "creation" || prop === "lastAccessed") {
      c[prop] = obj[prop] === null ? null : obj[prop] == "Infinity" ? "Infinity" : new Date(obj[prop]);
    } else {
      c[prop] = obj[prop];
    }
  }
  return c;
}

// Cookie class
class Cookie {
  constructor(options = {}) {
    if (util.inspect.custom) this[util.inspect.custom] = this.inspect;
    Object.assign(this, cookieDefaults, options);
    this.creation = this.creation || new Date();
    Object.defineProperty(this, "creationIndex", { configurable: false, enumerable: false, writable: true, value: ++Cookie.cookiesCreated });
  }

  inspect() {
    const now = Date.now();
    const hostOnly = this.hostOnly != null ? this.hostOnly : "?";
    const createAge = this.creation ? `${now - this.creation.getTime()}ms` : "?";
    const accessAge = this.lastAccessed ? `${now - this.lastAccessed.getTime()}ms` : "?";
    return `Cookie="${this.toString()}; hostOnly=${hostOnly}; aAge=${accessAge}; cAge=${createAge}"`;
  }

  toJSON() {
    const obj = {};
    for (const prop of Cookie.serializableProperties) {
      if (this[prop] === cookieDefaults[prop]) continue;
      if (prop === "expires" || prop === "creation" || prop === "lastAccessed") {
        obj[prop] = this[prop] === null ? null : this[prop] == "Infinity" ? "Infinity" : this[prop].toISOString();
      } else if (prop === "maxAge") {
        if (this[prop] !== null) obj[prop] = this[prop] == Infinity || this[prop] == -Infinity ? this[prop].toString() : this[prop];
      } else {
        if (this[prop] !== cookieDefaults[prop]) obj[prop] = this[prop];
      }
    }
    return obj;
  }

  clone() {
    return fromJSON(this.toJSON());
  }

  validate() {
    if (!COOKIE_OCTETS.test(this.value)) return false;
    if (this.expires != Infinity && !(this.expires instanceof Date) && !parseDate(this.expires)) return false;
    if (this.maxAge !== null && this.maxAge <= 0) return false;
    if (this.path !== null && !PATH_VALUE.test(this.path)) return false;
    const cdomain = this.cdomain();
    if (cdomain) {
      if (cdomain.match(/\.$/)) return false;
      const suffix = pubsuffix.getPublicSuffix(cdomain);
      if (suffix == null) return false;
    }
    return true;
  }

  setExpires(exp) {
    this.expires = exp instanceof Date ? exp : parseDate(exp) || "Infinity";
  }

  setMaxAge(age) {
    this.maxAge = age === Infinity || age === -Infinity ? age.toString() : age;
  }

  cookieString() {
    let val = this.value;
    if (val == null) val = "";
    return this.key === "" ? val : `${this.key}=${val}`;
  }

  toString() {
    let str = this.cookieString();
    if (this.expires != Infinity) str += `; Expires=${this.expires instanceof Date ? formatDate(this.expires) : this.expires}`;
    if (this.maxAge !== null && this.maxAge != Infinity) str += `; Max-Age=${this.maxAge}`;
    if (this.domain && !this.hostOnly) str += `; Domain=${this.domain}`;
    if (this.path) str += `; Path=${this.path}`;
    if (this.secure) str += "; Secure";
    if (this.httpOnly) str += "; HttpOnly";
    if (this.sameSite && this.sameSite !== "none") str += `; SameSite=${Cookie.sameSiteCanonical[this.sameSite.toLowerCase()] || this.sameSite}`;
    if (this.extensions) this.extensions.forEach(ext => str += `; ${ext}`);
    return str;
  }

  TTL(now) {
    if (this.maxAge != null) return this.maxAge <= 0 ? 0 : this.maxAge * 1000;
    let expires = this.expires;
    if (expires != Infinity) {
      if (!(expires instanceof Date)) expires = parseDate(expires) || Infinity;
      if (expires == Infinity) return Infinity;
      return expires.getTime() - (now || Date.now());
    }
    return Infinity;
  }

  expiryTime(now) {
    if (this.maxAge !== null) {
      const relativeTo = now || this.creation || new Date();
      return relativeTo.getTime() + (this.maxAge <= 0 ? -Infinity : this.maxAge * 1000);
    }
    if (this.expires == Infinity) return Infinity;
    return this.expires.getTime();
  }

  expiryDate(now) {
    const millisec = this.expiryTime(now);
    if (millisec == Infinity) return new Date(MAX_TIME);
    if (millisec == -Infinity) return new Date(MIN_TIME);
    return new Date(millisec);
  }

  isPersistent() {
    return this.maxAge !== null || this.expires != Infinity;
  }

  canonicalizedDomain() {
    if (this.domain == null) return null;
    return canonicalDomain(this.domain);
  }

  cdomain() {
    return this.canonicalizedDomain();
  }
}

Cookie.cookiesCreated = 0;
Cookie.parse = parse;
Cookie.fromJSON = fromJSON;
Cookie.serializableProperties = Object.keys(cookieDefaults);
Cookie.sameSiteLevel = { strict: 3, lax: 2, none: 1 };
Cookie.sameSiteCanonical = { strict: "Strict", lax: "Lax" };

// CookieJar class and utilities
function getNormalizedPrefixSecurity(prefixSecurity) {
  if (prefixSecurity != null) {
    const normalizedPrefixSecurity = prefixSecurity.toLowerCase();
    switch (normalizedPrefixSecurity) {
      case PrefixSecurityEnum.STRICT:
      case PrefixSecurityEnum.SILENT:
      case PrefixSecurityEnum.DISABLED:
        return normalizedPrefixSecurity;
    }
  }
  return PrefixSecurityEnum.SILENT;
}

class CookieJar {
  constructor(store, options = { rejectPublicSuffixes: true }) {
    if (typeof options === "boolean") options = { rejectPublicSuffixes: options };
    this.rejectPublicSuffixes = options.rejectPublicSuffixes;
    this.enableLooseMode = !!options.looseMode;
    this.allowSpecialUseDomain = !!options.allowSpecialUseDomain;
    this.store = store || new MemoryCookieStore();
    this.prefixSecurity = getNormalizedPrefixSecurity(options.prefixSecurity);
    this._cloneSync = syncWrap("clone");
    this._importCookiesSync = syncWrap("_importCookies");
    this.getCookiesSync = syncWrap("getCookies");
    this.getCookieStringSync = syncWrap("getCookieString");
    this.getSetCookieStringsSync = syncWrap("getSetCookieStrings");
    this.removeAllCookiesSync = syncWrap("removeAllCookies");
    this.setCookieSync = syncWrap("setCookie");
    this.serializeSync = syncWrap("serialize");
  }

  setCookie(cookie, url, options, cb) {
    let err;
    const context = getCookieContext(url);
    if (typeof options === "function") {
      cb = options;
      options = {};
    }

    const host = canonicalDomain(context.hostname);
    const loose = options.loose || this.enableLooseMode;

    let sameSiteContext = null;
    if (options.sameSiteContext) {
      sameSiteContext = checkSameSiteContext(options.sameSiteContext);
      if (!sameSiteContext) {
        return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
      }
    }

    // Step 1: Parse if string
    if (typeof cookie === "string" || cookie instanceof String) {
      cookie = Cookie.parse(cookie, { loose: loose });
      if (!cookie) {
        err = new Error("Cookie failed to parse");
        return cb(options.ignoreError ? null : err);
      }
    } else if (!(cookie instanceof Cookie)) {
      err = new Error("First argument to setCookie must be a Cookie object or string");
      return cb(options.ignoreError ? null : err);
    }

    const now = options.now || new Date();
    if (this.rejectPublicSuffixes && cookie.domain) {
      const suffix = pubsuffix.getPublicSuffix(cookie.cdomain());
      if (suffix == null) {
        err = new Error("Cookie has domain set to a public suffix");
        return cb(options.ignoreError ? null : err);
      }
    }

    if (cookie.domain) {
      if (!domainMatch(host, cookie.cdomain(), false)) {
        err = new Error(`Cookie not in this host's domain. Cookie:${cookie.cdomain()} Request:${host}`);
        return cb(options.ignoreError ? null : err);
      }
      if (cookie.hostOnly == null) cookie.hostOnly = false;
    } else {
      cookie.hostOnly = true;
      cookie.domain = host;
    }

    if (!cookie.path || cookie.path[0] !== "/") {
      cookie.path = defaultPath(context.pathname);
      cookie.pathIsDefault = true;
    }

    if (options.http === false && cookie.httpOnly) {
      err = new Error("Cookie is HttpOnly and this isn't an HTTP API");
      return cb(options.ignoreError ? null : err);
    }

    if (cookie.sameSite !== "none" && sameSiteContext) {
      if (sameSiteContext === "none") {
        err = new Error("Cookie is SameSite but this is a cross-origin request");
        return cb(options.ignoreError ? null : err);
      }
    }

    const ignoreErrorForPrefixSecurity = this.prefixSecurity === PrefixSecurityEnum.SILENT;
    const prefixSecurityDisabled = this.prefixSecurity === PrefixSecurityEnum.DISABLED;

    if (!prefixSecurityDisabled) {
      let errorFound = false;
      let errorMsg;
      if (!isSecurePrefixConditionMet(cookie)) {
        errorFound = true;
        errorMsg = "Cookie has __Secure prefix but Secure attribute is not set";
      } else if (!isHostPrefixConditionMet(cookie)) {
        errorFound = true;
        errorMsg = "Cookie has __Host prefix but either Secure or HostOnly attribute is not set or Path is not '/'";
      }
      if (errorFound) {
        return cb(options.ignoreError || ignoreErrorForPrefixSecurity ? null : new Error(errorMsg));
      }
    }

    const store = this.store;
    if (!store.updateCookie) {
      store.updateCookie = function(oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb);
      };
    }

    function withCookie(err, oldCookie) {
      if (err) return cb(err);

      const next = err => {
        if (err) return cb(err);
        else cb(null, cookie);
      };

      if (oldCookie) {
        if (options.http === false && oldCookie.httpOnly) {
          err = new Error("old Cookie is HttpOnly and this isn't an HTTP API");
          return cb(options.ignoreError ? null : err);
        }
        cookie.creation = oldCookie.creation;
        cookie.creationIndex = oldCookie.creationIndex;
        cookie.lastAccessed = now;
        store.updateCookie(oldCookie, cookie, next);
      } else {
        cookie.creation = cookie.lastAccessed = now;
        store.putCookie(cookie, next);
      }
    }

    store.findCookie(cookie.domain, cookie.path, cookie.key, withCookie);
  }

  getCookies(url, options, cb) {
    const context = getCookieContext(url);
    if (typeof options === "function") {
      cb = options;
      options = {};
    }

    const host = canonicalDomain(context.hostname);
    const path = context.pathname || "/";
    let secure = options.secure;
    if (secure == null && context.protocol && (context.protocol == "https:" || context.protocol == "wss:")) secure = true;

    let sameSiteLevel = 0;
    if (options.sameSiteContext) {
      const sameSiteContext = checkSameSiteContext(options.sameSiteContext);
      sameSiteLevel = Cookie.sameSiteLevel[sameSiteContext];
      if (!sameSiteLevel) return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
    }

    let http = options.http;
    if (http == null) http = true;

    const now = options.now || Date.now();
    const expireCheck = options.expire !== false;
    const allPaths = !!options.allPaths;
    const store = this.store;

    function matchingCookie(c) {
      if (c.hostOnly) {
        if (c.domain != host) return false;
      } else {
        if (!domainMatch(host, c.domain, false)) return false;
      }
      if (!allPaths && !pathMatch(path, c.path)) return false;
      if (c.secure && !secure) return false;
      if (c.httpOnly && !http) return false;
      if (sameSiteLevel) {
        const cookieLevel = Cookie.sameSiteLevel[c.sameSite || "none"];
        if (cookieLevel > sameSiteLevel) return false;
      }
      if (expireCheck && c.expiryTime() <= now) {
        store.removeCookie(c.domain, c.path, c.key, () => {});
        return false;
      }
      return true;
    }

    store.findCookies(host, allPaths ? null : path, this.allowSpecialUseDomain, (err, cookies) => {
      if (err) return cb(err);

      cookies = cookies.filter(matchingCookie);
      if (options.sort !== false) cookies = cookies.sort(cookieCompare);

      const now = new Date();
      for (const cookie of cookies) cookie.lastAccessed = now;

      cb(null, cookies);
    });
  }

  getCookieString(...args) {
    const cb = args.pop();
    const next = (err, cookies) => {
      if (err) cb(err);
      else cb(null, cookies.sort(cookieCompare).map(c => c.cookieString()).join("; "));
    };
    args.push(next);
    this.getCookies.apply(this, args);
  }

  getSetCookieStrings(...args) {
    const cb = args.pop();
    const next = (err, cookies) => {
      if (err) cb(err);
      else cb(null, cookies.map(c => c.toString()));
    };
    args.push(next);
    this.getCookies.apply(this, args);
  }

  serialize(cb) {
    let type = this.store.constructor.name;
    if (type === "Object") type = null;

    const serialized = {
      version: `tough-cookie@${VERSION}`,
      storeType: type,
      rejectPublicSuffixes: !!this.rejectPublicSuffixes,
      cookies: []
    };

    if (!this.store.getAllCookies || typeof this.store.getAllCookies !== "function") {
      return cb(new Error("store does not support getAllCookies and cannot be serialized"));
    }

    this.store.getAllCookies((err, cookies) => {
      if (err) return cb(err);

      serialized.cookies = cookies.map(cookie => {
        cookie = cookie instanceof Cookie ? cookie.toJSON() : cookie;
        delete cookie.creationIndex;
        return cookie;
      });

      return cb(null, serialized);
    });
  }

  toJSON() {
    return this.serializeSync();
  }

  _importCookies(serialized, cb) {
    let cookies = serialized.cookies;
    if (!cookies || !Array.isArray(cookies)) return cb(new Error("serialized jar has no cookies array"));
    cookies = cookies.slice();

    const putNext = err => {
      if (err) return cb(err);
      if (!cookies.length) return cb(err, this);

      let cookie;
      try {
        cookie = fromJSON(cookies.shift());
      } catch (e) {
        return cb(e);
      }

      if (cookie === null) return putNext(null);

      this.store.putCookie(cookie, putNext);
    };

    putNext();
  }

  clone(newStore, cb) {
    if (arguments.length === 1) {
      cb = newStore;
      newStore = null;
    }

    this.serialize((err, serialized) => {
      if (err) return cb(err);
      CookieJar.deserialize(serialized, newStore, cb);
    });
  }

  cloneSync(newStore) {
    if (arguments.length === 0) return this._cloneSync();
    if (!newStore.synchronous) throw new Error("CookieJar clone destination store is not synchronous; use async API instead.");
    return this._cloneSync(newStore);
  }

  removeAllCookies(cb) {
    const store = this.store;
    if (typeof store.removeAllCookies === "function" && store.removeAllCookies !== Store.prototype.removeAllCookies) {
      return store.removeAllCookies(cb);
    }

    store.getAllCookies((err, cookies) => {
      if (err) return cb(err);
      if (cookies.length === 0) return cb(null);

      let completedCount = 0;
      const removeErrors = [];

      function removeCookieCb(removeErr) {
        if (removeErr) removeErrors.push(removeErr);
        completedCount++;
        if (completedCount === cookies.length) return cb(removeErrors.length ? removeErrors[0] : null);
      }

      cookies.forEach(cookie => {
        store.removeCookie(cookie.domain, cookie.path, cookie.key, removeCookieCb);
      });
    });
  }

  static deserialize(strOrObj, store, cb) {
    if (arguments.length !== 3) {
      cb = store;
      store = null;
    }

    let serialized;
    if (typeof strOrObj === "string") {
      serialized = jsonParse(strOrObj);
      if (serialized instanceof Error) return cb(serialized);
    } else {
      serialized = strOrObj;
    }

    const jar = new CookieJar(store, serialized.rejectPublicSuffixes);
    jar._importCookies(serialized, err => {
      if (err) return cb(err);
      cb(null, jar);
    });
  }

  static deserializeSync(strOrObj, store) {
    const serialized = typeof strOrObj === "string" ? JSON.parse(strOrObj) : strOrObj;
    const jar = new CookieJar(store, serialized.rejectPublicSuffixes);

    if (!jar.store.synchronous) throw new Error("CookieJar store is not synchronous; use async API instead.");

    jar._importCookiesSync(serialized);
    return jar;
  }
}

CookieJar.fromJSON = CookieJar.deserializeSync;

[
  "_importCookies",
  "clone",
  "getCookies",
  "getCookieString",
  "getSetCookieStrings",
  "removeAllCookies",
  "serialize",
  "setCookie"
].forEach(name => {
  CookieJar.prototype[name] = fromCallback(CookieJar.prototype[name]);
});
CookieJar.deserialize = fromCallback(CookieJar.deserialize);

function syncWrap(method) {
  return function(...args) {
    if (!this.store.synchronous) {
      throw new Error("CookieJar store is not synchronous; use async API instead.");
    }

    let syncErr, syncResult;
    this[method](...args, (err, result) => {
      syncErr = err;
      syncResult = result;
    });

    if (syncErr) throw syncErr;
    return syncResult;
  };
}

// Exported functionalities
exports.version = VERSION;
exports.CookieJar = CookieJar;
exports.Cookie = Cookie;
exports.Store = Store;
exports.MemoryCookieStore = MemoryCookieStore;
exports.parseDate = parseDate;
exports.formatDate = formatDate;
exports.parse = parse;
exports.fromJSON = fromJSON;
exports.domainMatch = domainMatch;
exports.defaultPath = defaultPath;
exports.pathMatch = pathMatch;
exports.getPublicSuffix = pubsuffix.getPublicSuffix;
exports.cookieCompare = cookieCompare;
exports.permuteDomain = require("./permuteDomain").permuteDomain;
exports.permutePath = permutePath;
exports.canonicalDomain = canonicalDomain;
exports.PrefixSecurityEnum = PrefixSecurityEnum;
