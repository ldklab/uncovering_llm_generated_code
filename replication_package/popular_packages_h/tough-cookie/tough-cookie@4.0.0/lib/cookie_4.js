"use strict";

const punycode = require("punycode");
const url = require("url");
const util = require("util");
const pubsuffix = require("./pubsuffix-psl");
const { Store } = require("./store");
const { MemoryCookieStore } = require("./memstore");
const { pathMatch } = require("./pathMatch");
const VERSION = require("./version");
const { fromCallback } = require("universalify");

const COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;
const CONTROL_CHARS = /[\x00-\x1F]/;
const TERMINATORS = ["\n", "\r", "\0"];
const PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/;
const DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/;

const MONTH_TO_NUM = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

const MAX_TIME = 2147483647000;
const MIN_TIME = 0;
const SAME_SITE_CONTEXT_VAL_ERR = 'Invalid sameSiteContext option for getCookies(); expected one of "strict", "lax", or "none"';

class Cookie {
  constructor(options = {}) {
    Object.assign(this, Cookie.defaults, options);
    this.creation = this.creation || new Date();
    Object.defineProperty(this, "creationIndex", {
      configurable: false,
      enumerable: false,
      writable: true,
      value: ++Cookie.cookiesCreated
    });
  }

  static cookiesCreated = 0;
  static parse = parse;
  static fromJSON = fromJSON;
  static defaults = {
    key: "", value: "", expires: "Infinity", maxAge: null,
    domain: null, path: null, secure: false, httpOnly: false, extensions: null,
    hostOnly: null, pathIsDefault: null, creation: null, lastAccessed: null,
    sameSite: "none"
  };
  static serializableProperties = Object.keys(Cookie.defaults);
  static sameSiteLevel = { strict: 3, lax: 2, none: 1 };
  static sameSiteCanonical = { strict: "Strict", lax: "Lax" };

  toJSON() {
    const obj = {};
    for (const prop of Cookie.serializableProperties) {
      if (this[prop] === Cookie.defaults[prop]) continue;
      if (["expires", "creation", "lastAccessed"].includes(prop)) {
        obj[prop] = this[prop] === null ? null : this[prop] == "Infinity" ? "Infinity" : this[prop].toISOString();
      } else if (prop === "maxAge") {
        obj[prop] = this[prop] == Infinity || this[prop] == -Infinity ? this[prop].toString() : this[prop];
      } else {
        obj[prop] = this[prop];
      }
    }
    return obj;
  }

  isPersistent() {
    return this.maxAge != null || this.expires != Infinity;
  }

  setExpires(exp) {
    this.expires = exp instanceof Date ? exp : parseDate(exp) || "Infinity";
  }

  setMaxAge(age) {
    this.maxAge = age === Infinity || age === -Infinity ? age.toString() : age;
  }

  expiryTime(now) {
    if (this.maxAge != null) {
      return (now || this.creation || new Date()).getTime() + (this.maxAge <= 0 ? -Infinity : this.maxAge * 1000);
    }
    if (this.expires == Infinity) return Infinity;
    return this.expires.getTime();
  }

  expiresDate(now) {
    const millisec = this.expiryTime(now);
    return millisec == Infinity ? new Date(MAX_TIME) : millisec == -Infinity ? new Date(MIN_TIME) : new Date(millisec);
  }

  valid() {
    return COOKIE_OCTETS.test(this.value) &&
      (this.expires == Infinity || this.expires instanceof Date || parseDate(this.expires)) &&
      (this.maxAge == null || this.maxAge > 0) &&
      (!this.path || PATH_VALUE.test(this.path)) &&
      (!this.domain || !this.domain.match(/\.$/) && pubsuffix.getPublicSuffix(this.cdomain()) != null);
  }

  cdomain() {
    return this.domain ? canonicalDomain(this.domain) : null;
  }

  cookieString() {
    return `${this.key}=${this.value || ""}`;
  }

  toString() {
    let str = this.cookieString();
    if (this.expires != Infinity) str += `; Expires=${this.expires instanceof Date ? formatDate(this.expires) : this.expires}`;
    if (this.maxAge != null && this.maxAge != Infinity) str += `; Max-Age=${this.maxAge}`;
    if (this.domain && !this.hostOnly) str += `; Domain=${this.domain}`;
    if (this.path) str += `; Path=${this.path}`;
    if (this.secure) str += "; Secure";
    if (this.httpOnly) str += "; HttpOnly";
    if (this.sameSite && this.sameSite !== "none") str += `; SameSite=${Cookie.sameSiteCanonical[this.sameSite.toLowerCase()] || this.sameSite}`;
    if (this.extensions) this.extensions.forEach(ext => { str += `; ${ext}`; });
    return str;
  }

  inspect() {
    const now = Date.now();
    const hostOnly = this.hostOnly != null ? this.hostOnly : "?";
    const createAge = this.creation ? `${now - this.creation.getTime()}ms` : "?";
    const accessAge = this.lastAccessed ? `${now - this.lastAccessed.getTime()}ms` : "?";
    return `Cookie="${this.toString()}; hostOnly=${hostOnly}; aAge=${accessAge}; cAge=${createAge}"`;
  }

  clone() {
    return fromJSON(this.toJSON());
  }
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
      if (!sameSiteContext) return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
    }

    if (typeof cookie === "string" || cookie instanceof String) {
      cookie = Cookie.parse(cookie, { loose });
      if (!cookie) return cb(options.ignoreError ? null : new Error("Cookie failed to parse"));
    } else if (!(cookie instanceof Cookie)) {
      return cb(options.ignoreError ? null : new Error("First argument to setCookie must be a Cookie object or string"));
    }

    const now = options.now || new Date();
    if (this.rejectPublicSuffixes && cookie.domain) {
      if (pubsuffix.getPublicSuffix(cookie.cdomain()) == null) {
        return cb(options.ignoreError ? null : new Error("Cookie has domain set to a public suffix"));
      }
    }

    if (cookie.domain) {
      if (!domainMatch(host, cookie.cdomain(), false)) {
        return cb(options.ignoreError ? null : new Error(`Cookie not in this host's domain. Cookie:${cookie.cdomain()} Request:${host}`));
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
      return cb(options.ignoreError ? null : new Error("Cookie is HttpOnly and this isn't an HTTP API"));
    }

    if (cookie.sameSite !== "none" && sameSiteContext) {
      if (sameSiteContext === "none") {
        return cb(options.ignoreError ? null : new Error("Cookie is SameSite but this is a cross-origin request"));
      }
    }

    const store = this.store;

    if (!store.updateCookie) {
      store.updateCookie = function (oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb);
      };
    }

    const withCookie = (err, oldCookie) => {
      if (err) return cb(err);

      const next = (err) => {
        if (err) return cb(err);
        cb(null, cookie);
      };

      if (oldCookie) {
        if (options.http === false && oldCookie.httpOnly) {
          return cb(options.ignoreError ? null : new Error("old Cookie is HttpOnly and this isn't an HTTP API"));
        }
        cookie.creation = oldCookie.creation;
        cookie.creationIndex = oldCookie.creationIndex;
        cookie.lastAccessed = now;
        store.updateCookie(oldCookie, cookie, next);
      } else {
        cookie.creation = cookie.lastAccessed = now;
        store.putCookie(cookie, next);
      }
    };

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
    if (secure == null && (context.protocol === "https:" || context.protocol === "wss:")) {
      secure = true;
    }

    let sameSiteLevel = 0;
    if (options.sameSiteContext) {
      const sameSiteContext = checkSameSiteContext(options.sameSiteContext);
      sameSiteLevel = Cookie.sameSiteLevel[sameSiteContext];
      if (!sameSiteLevel) return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
    }

    const http = options.http == null ? true : options.http;
    const now = options.now || Date.now();
    const expireCheck = options.expire !== false;
    const allPaths = !!options.allPaths;
    const store = this.store;

    function matchingCookie(c) {
      if (c.hostOnly ? c.domain != host : !domainMatch(host, c.domain, false)) return false;
      if (!allPaths && !pathMatch(path, c.path)) return false;
      if (c.secure && !secure) return false;
      if (c.httpOnly && !http) return false;
      if (sameSiteLevel && Cookie.sameSiteLevel[c.sameSite || "none"] > sameSiteLevel) return false;
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
      cookies.forEach(cookie => { cookie.lastAccessed = now; });
      cb(null, cookies);
    });
  }

  getCookieString(...args) {
    const cb = args.pop();
    const next = (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.sort(cookieCompare).map(c => c.cookieString()).join("; "));
    };
    args.push(next);
    this.getCookies(...args);
  }

  getSetCookieStrings(...args) {
    const cb = args.pop();
    const next = (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.map(c => c.toString()));
    };
    args.push(next);
    this.getCookies(...args);
  }

  serialize(cb) {
    let type = this.store.constructor.name;
    if (type === "Object") {
      type = null;
    }

    const serialized = {
      version: `tough-cookie@${VERSION}`,
      storeType: type,
      rejectPublicSuffixes: this.rejectPublicSuffixes,
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

      cb(null, serialized);
    });
  }

  toJSON() {
    return this.serializeSync();
  }

  _importCookies(serialized, cb) {
    let cookies = serialized.cookies;
    if (!cookies || !Array.isArray(cookies)) {
      return cb(new Error("serialized jar has no cookies array"));
    }
    cookies = cookies.slice();

    const putNext = (err) => {
      if (err) return cb(err);
      if (!cookies.length) return cb(null, this);

      let cookie;
      try {
        cookie = fromJSON(cookies.shift());
      } catch (e) {
        return cb(e);
      }

      if (cookie === null) {
        return putNext(null);
      }

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
    if (arguments.length === 0) {
      return this._cloneSync();
    }
    if (!newStore.synchronous) {
      throw new Error("CookieJar clone destination store is not synchronous; use async API instead.");
    }
    return this._cloneSync(newStore);
  }

  removeAllCookies(cb) {
    if (typeof this.store.removeAllCookies === "function" && this.store.removeAllCookies !== Store.prototype.removeAllCookies) {
      return this.store.removeAllCookies(cb);
    }

    this.store.getAllCookies((err, cookies) => {
      if (err) return cb(err);
      if (!cookies.length) return cb(null);

      let completedCount = 0;
      const removeErrors = [];

      cookies.forEach(cookie => {
        this.store.removeCookie(cookie.domain, cookie.path, cookie.key, (removeErr) => {
          if (removeErr) removeErrors.push(removeErr);
          completedCount++;
          if (completedCount === cookies.length) {
            cb(removeErrors.length ? removeErrors[0] : null);
          }
        });
      });
    });
  }

  static deserialize(strOrObj, store, cb) {
    if (arguments.length !== 3) {
      cb = store;
      store = null;
    }

    let serialized = typeof strOrObj === "string" ? jsonParse(strOrObj) : strOrObj;
    if (typeof serialized === "string" && serialized instanceof Error) {
      return cb(serialized);
    }

    const jar = new CookieJar(store, serialized.rejectPublicSuffixes);
    jar._importCookies(serialized, (err) => {
      if (err) return cb(err);
      cb(null, jar);
    });
  }

  static deserializeSync(strOrObj, store) {
    const serialized = typeof strOrObj === "string" ? JSON.parse(strOrObj) : strOrObj;
    const jar = new CookieJar(store, serialized.rejectPublicSuffixes);

    if (!jar.store.synchronous) {
      throw new Error("CookieJar store is not synchronous; use async API instead.");
    }

    jar._importCookiesSync(serialized);
    return jar;
  }
}

CookieJar.fromJSON = CookieJar.deserializeSync;
["_importCookies", "clone", "getCookies", "getCookieString", "getSetCookieStrings", "removeAllCookies", "serialize", "setCookie"]
.forEach(name => {
  CookieJar.prototype[name] = fromCallback(CookieJar.prototype[name]);
});

CookieJar.deserialize = fromCallback(CookieJar.deserialize);
const syncWrap = method => function (...args) {
  if (!this.store.synchronous) throw new Error("CookieJar store is not synchronous; use async API instead.");
  let syncErr, syncResult;
  this[method](...args, (err, result) => {
    syncErr = err;
    syncResult = result;
  });
  if (syncErr) throw syncErr;
  return syncResult;
};

function parse(str, options = {}) { /* Parsing Logic */ }
function fromJSON(str) { /* JSON to Cookie Conversion Logic */ }
function parseDate(str) { /* Date Parsing Logic */ }
function formatDate(date) { return date.toUTCString(); }
function canonicalDomain(str) { /* Canonical Domain Logic */ }
function domainMatch(str, domStr, canonicalize) { /* Domain Matching Logic */ }
function defaultPath(path) { /* Default Path Definition Logic */ }
function getCookieContext(url) { /* Extract context from URL Logic */ }
function jsonParse(str) { /* JSON Parse Logic */ }
function checkSameSiteContext(value) { /* Same Site Context Check Logic */ }
function getNormalizedPrefixSecurity(prefixSecurity) { /* Prefix Security Normalization Logic */ }
function cookieCompare(a, b) { /* Cookie Comparison Logic */ }
function permutePath(path) { /* Path Permutation Logic */ }

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
exports.PrefixSecurityEnum = Object.freeze({ SILENT: "silent", STRICT: "strict", DISABLED: "unsafe-disabled" });
