"use strict";

const punycode = require("punycode");
const { parse: urlParse } = require("url");
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

function checkSameSiteContext(value) {
  const context = String(value).toLowerCase();
  return (context === "none" || context === "lax" || context === "strict") ? context : null;
}

const PrefixSecurityEnum = Object.freeze({
  SILENT: "silent",
  STRICT: "strict",
  DISABLED: "unsafe-disabled"
});

const IP_REGEX_LOWERCASE =/(^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|^(?:(?:[a-f\d]{1,4}:){7}[a-f\d]{1,4}|(?:[a-f\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|15\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-f\d]{1,4}|:))/;

function parseDigits(token, minDigits, maxDigits, trailingOK) {
  let count = 0;
  while (count < token.length) {
    const c = token.charCodeAt(count);
    if (c <= 0x2f || c >= 0x3a) break;
    count++;
  }
  if (count < minDigits || count > maxDigits) return null;
  if (!trailingOK && count !== token.length) return null;
  return parseInt(token.slice(0, count), 10);
}

function parseTime(token) {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const result = parts.map((part, index) => parseDigits(part, 1, 2, index === 2));
  return result.includes(null) ? null : result;
}

function parseMonth(token) {
  token = token.slice(0, 3).toLowerCase();
  return MONTH_TO_NUM.hasOwnProperty(token) ? MONTH_TO_NUM[token] : null;
}

function parseDate(str) {
  if (!str) return;
  const tokens = str.split(DATE_DELIM).filter(Boolean);
  let [hour, minute, second] = [null, null, null];
  let [dayOfMonth, month, year] = [null, null, null];

  for (const token of tokens) {
    if (!second) {
      const result = parseTime(token);
      if (result) [hour, minute, second] = result;
      if (result) continue;
    }
    if (!dayOfMonth) {
      const result = parseDigits(token, 1, 2, true);
      if (result !== null) dayOfMonth = result;
      if (result !== null) continue;
    }
    if (!month) {
      const result = parseMonth(token);
      if (result !== null) month = result;
      if (result !== null) continue;
    }
    if (!year) {
      const result = parseDigits(token, 2, 4, true);
      if (result !== null) {
        year = result;
        year += (year >= 70 && year <= 99) ? 1900 : (year >= 0 && year <= 69) ? 2000 : 0;
      }
    }
  }

  if ([dayOfMonth, month, year, second].includes(null) ||
    dayOfMonth < 1 || dayOfMonth > 31 || year < 1601 ||
    hour > 23 || minute > 59 || second > 59) return;
  return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
}

function formatDate(date) {
  return date.toUTCString();
}

function canonicalDomain(str) {
  if (!str) return null;
  str = str.trim().replace(/^\./, "");
  return punycode && /[^\u0001-\u007f]/.test(str) ? punycode.toASCII(str) : str.toLowerCase();
}

function domainMatch(str, domStr, canonicalize = true) {
  if (!str || !domStr) return null;
  if (canonicalize) {
    str = canonicalDomain(str);
    domStr = canonicalDomain(domStr);
  }
  if (str === domStr) return true;

  const idx = str.indexOf(domStr);
  if (idx <= 0 || str.length !== domStr.length + idx || str[idx - 1] !== '.' || IP_REGEX_LOWERCASE.test(str)) {
    return false;
  }
  return true;
}

function defaultPath(path) {
  return (!path || path[0] !== "/") ? "/" : path.length === 1 ? "/" : path.slice(0, path.lastIndexOf("/"));
}

function trimTerminator(str) {
  for (const terminator of TERMINATORS) {
    const terminatorIdx = str.indexOf(terminator);
    if (terminatorIdx !== -1) {
      str = str.substring(0, terminatorIdx);
    }
  }
  return str;
}

function parseCookiePair(cookiePair, looseMode) {
  cookiePair = trimTerminator(cookiePair);
  let firstEq = cookiePair.indexOf("=");
  if (looseMode && firstEq === 0) {
    cookiePair = cookiePair.slice(1);
    firstEq = cookiePair.indexOf("=");
  }
  if (!looseMode && firstEq <= 0) return;

  const [cookieName, cookieValue] = firstEq <= 0 ?
    ["", cookiePair.trim()] :
    [cookiePair.slice(0, firstEq).trim(), cookiePair.slice(firstEq + 1).trim()];

  if (CONTROL_CHARS.test(cookieName) || CONTROL_CHARS.test(cookieValue)) return;

  const c = new Cookie();
  c.key = cookieName;
  c.value = cookieValue;
  return c;
}

function parse(str, options = {}) {
  str = str.trim();
  const firstSemi = str.indexOf(";");
  const cookiePair = firstSemi === -1 ? str : str.substr(0, firstSemi).trim();
  const c = parseCookiePair(cookiePair, !!options.loose);
  if (!c) return;

  if (firstSemi === -1) return c;

  const unparsed = str.slice(firstSemi + 1).trim();
  if (unparsed.length === 0) return c;

  const cookie_avs = unparsed.split(";");
  while (cookie_avs.length) {
    const av = cookie_avs.shift().trim();
    if (!av) continue;

    const [av_key, av_value] = av.includes("=") ? av.split("=") : [av, null];
    const avKeyLower = av_key.trim().toLowerCase();
    const trimmedValue = av_value ? av_value.trim() : null;

    switch (avKeyLower) {
      case "expires":
        if (trimmedValue) {
          const exp = parseDate(trimmedValue);
          if (exp) {
            c.expires = exp;
          }
        }
        break;
      case "max-age":
        if (trimmedValue && /^-?[0-9]+$/.test(trimmedValue)) {
          const delta = parseInt(trimmedValue, 10);
          c.setMaxAge(delta);
        }
        break;
      case "domain":
        if (trimmedValue) {
          const domain = trimmedValue.replace(/^\./, "");
          if (domain) {
            c.domain = domain.toLowerCase();
          }
        }
        break;
      case "path":
        c.path = trimmedValue && trimmedValue[0] === "/" ? trimmedValue : null;
        break;
      case "secure":
        c.secure = true;
        break;
      case "httponly":
        c.httpOnly = true;
        break;
      case "samesite":
        const enforcement = trimmedValue ? trimmedValue.toLowerCase() : "";
        if (enforcement === "strict") {
          c.sameSite = "strict";
        } else if (enforcement === "lax") {
          c.sameSite = "lax";
        }
        break;
      default:
        c.extensions = c.extensions || [];
        c.extensions.push(av);
        break;
    }
  }

  return c;
}

function isSecurePrefixConditionMet(cookie) {
  return !cookie.key.startsWith("__Secure-") || cookie.secure;
}

function isHostPrefixConditionMet(cookie) {
  return (!cookie.key.startsWith("__Host-")) || 
    (cookie.secure && cookie.hostOnly && cookie.path === "/");
}

function jsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return e;
  }
}

function fromJSON(str) {
  if (!str) return null;

  const obj = typeof str === "string" ? jsonParse(str) : str;
  if (obj instanceof Error) return null;

  const c = new Cookie();
  for (const prop of Cookie.serializableProperties) {
    if (obj[prop] !== undefined && obj[prop] !== cookieDefaults[prop]) {
      c[prop] = obj[prop] instanceof Date || ["expires", "creation", "lastAccessed"].includes(prop) ?
        new Date(obj[prop]) : obj[prop];
    }
  }

  return c;
}

function cookieCompare(a, b) {
  const aPathLen = a.path ? a.path.length : 0;
  const bPathLen = b.path ? b.path.length : 0;
  let cmp = bPathLen - aPathLen;

  if (cmp !== 0) return cmp;

  const aTime = a.creation ? a.creation.getTime() : MAX_TIME;
  const bTime = b.creation ? b.creation.getTime() : MAX_TIME;
  cmp = aTime - bTime;

  return cmp !== 0 ? cmp : a.creationIndex - b.creationIndex;
}

function permutePath(path) {
  if (path === "/") return ["/"];
  const permutations = [];
  while (path.length > 1) {
    const lindex = path.lastIndexOf("/");
    if (lindex === 0) break;
    path = path.slice(0, lindex);
    permutations.push(path);
  }
  permutations.push("/");
  return permutations;
}

function getCookieContext(url) {
  if (url instanceof Object) return url;
  try {
    url = decodeURI(url);
  } catch (err) {}
  return urlParse(url);
}

const cookieDefaults = {
  key: "", value: "", expires: "Infinity", maxAge: null, domain: null, path: null, 
  secure: false, httpOnly: false, extensions: null, hostOnly: null, pathIsDefault: null, 
  creation: null, lastAccessed: null, sameSite: "none"
};

class Cookie {
  constructor(options = {}) {
    if (util.inspect.custom) this[util.inspect.custom] = this.inspect;
    Object.assign(this, cookieDefaults, options);
    this.creation = this.creation || new Date();
    Object.defineProperty(this, "creationIndex", { configurable: false, enumerable: false, writable: true, value: ++Cookie.cookiesCreated });
  }

  inspect() {
    const now = Date.now();
    const createAge = this.creation ? `${now - this.creation.getTime()}ms` : "?";
    const accessAge = this.lastAccessed ? `${now - this.lastAccessed.getTime()}ms` : "?";
    return `Cookie="${this.toString()}; hostOnly=${this.hostOnly || "?"}; aAge=${accessAge}; cAge=${createAge}"`;
  }

  toJSON() {
    const obj = {};
    for (const prop of Cookie.serializableProperties) {
      if (this[prop] !== cookieDefaults[prop]) {
        obj[prop] = this[prop] instanceof Date ? 
          this[prop].toISOString() : this[prop];
      }
    }
    delete obj.creationIndex;
    return obj;
  }

  clone() {
    return fromJSON(this.toJSON());
  }

  validate() {
    if (!COOKIE_OCTETS.test(this.value)) return false;
    if (this.expires !== "Infinity" && !(this.expires instanceof Date) && !parseDate(this.expires)) return false;
    if (this.maxAge !== null && this.maxAge <= 0) return false;
    if (this.path !== null && !PATH_VALUE.test(this.path)) return false;

    const cdomain = this.cdomain();
    if (cdomain && (cdomain.endsWith(".") || !pubsuffix.getPublicSuffix(cdomain))) return false;
    return true;
  }

  setExpires(exp) {
    this.expires = exp instanceof Date ? exp : parseDate(exp) || "Infinity";
  }

  setMaxAge(age) {
    this.maxAge = age === Infinity || age === -Infinity ? age.toString() : age;
  }

  cookieString() {
    return `${this.key}=${this.value || ""}`;
  }

  toString() {
    let str = this.cookieString();
    if (this.expires !== "Infinity") str += `; Expires=${formatDate(this.expires)}`;
    if (this.maxAge !== null && this.maxAge !== Infinity) str += `; Max-Age=${this.maxAge}`;
    if (this.domain && !this.hostOnly) str += `; Domain=${this.domain}`;
    if (this.path) str += `; Path=${this.path}`;
    if (this.secure) str += "; Secure";
    if (this.httpOnly) str += "; HttpOnly";
    if (this.sameSite && this.sameSite !== "none") {
      const ssCanon = Cookie.sameSiteCanonical[this.sameSite.toLowerCase()];
      str += `; SameSite=${ssCanon ? ssCanon : this.sameSite}`;
    }
    if (this.extensions) this.extensions.forEach(ext => str += `; ${ext}`);
    return str;
  }

  TTL(now) {
    if (this.maxAge !== null) return this.maxAge <= 0 ? 0 : this.maxAge * 1000;
    if (this.expires !== "Infinity") {
      const expires = this.expires instanceof Date ? this.expires : parseDate(this.expires) || Infinity;
      return expires === Infinity ? Infinity : expires.getTime() - (now || Date.now());
    }
    return Infinity;
  }

  expiryTime(now) {
    return this.maxAge !== null ? 
      (this.maxAge <= 0 ? -Infinity : (now || this.creation || new Date()).getTime() + this.maxAge * 1000) : 
      (this.expires === "Infinity" ? Infinity : this.expires.getTime());
  }

  expiryDate(now) {
    const millisec = this.expiryTime(now);
    return millisec === Infinity ? new Date(MAX_TIME) : millisec === -Infinity ? new Date(MIN_TIME) : new Date(millisec);
  }

  isPersistent() {
    return this.maxAge !== null || this.expires !== "Infinity";
  }

  canonicalizedDomain() {
    return this.domain === null ? null : canonicalDomain(this.domain);
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

function getNormalizedPrefixSecurity(prefixSecurity) {
  const normalized = prefixSecurity ? prefixSecurity.toLowerCase() : null;
  return [PrefixSecurityEnum.STRICT, PrefixSecurityEnum.SILENT, PrefixSecurityEnum.DISABLED].includes(normalized) 
    ? normalized 
    : PrefixSecurityEnum.SILENT;
}

class CookieJar {
  constructor(store, options = { rejectPublicSuffixes: true }) {
    options = typeof options === "boolean" ? { rejectPublicSuffixes: options } : options;
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

    let sameSiteContext = checkSameSiteContext(options.sameSiteContext);
    if (!sameSiteContext && options.sameSiteContext) {
      return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
    }

    if (typeof cookie === "string" || cookie instanceof String) {
      cookie = Cookie.parse(cookie, { loose });
      if (!cookie) return cb(options.ignoreError ? null : new Error("Cookie failed to parse"));
    } else if (!(cookie instanceof Cookie)) {
      return cb(options.ignoreError ? null : new Error("First argument to setCookie must be a Cookie object or string"));
    }

    const now = options.now || new Date();

    if (this.rejectPublicSuffixes && cookie.domain && pubsuffix.getPublicSuffix(cookie.cdomain()) === null) {
      return cb(options.ignoreError ? null : new Error("Cookie has domain set to a public suffix"));
    }

    if (cookie.domain) {
      if (!domainMatch(host, cookie.cdomain(), false)) {
        return cb(options.ignoreError ? null : new Error(`Cookie not in this host's domain. Cookie:${cookie.cdomain()} Request:${host}`));
      }
      cookie.hostOnly = cookie.hostOnly !== null ? cookie.hostOnly : false;
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

    if (cookie.sameSite !== "none" && sameSiteContext && sameSiteContext === "none") {
      return cb(options.ignoreError ? null : new Error("Cookie is SameSite but this is a cross-origin request"));
    }

    const ignoreErrorForPrefixSecurity = this.prefixSecurity === PrefixSecurityEnum.SILENT;
    const prefixSecurityDisabled = this.prefixSecurity === PrefixSecurityEnum.DISABLED;

    if (!prefixSecurityDisabled) {
      const securePrefixError = !isSecurePrefixConditionMet(cookie) && "Cookie has __Secure prefix but Secure attribute is not set";
      const hostPrefixError = !isHostPrefixConditionMet(cookie) && "Cookie has __Host prefix but either Secure or HostOnly attribute is not set or Path is not '/'";
      if (securePrefixError || hostPrefixError) {
        return cb(options.ignoreError || ignoreErrorForPrefixSecurity ? null : new Error(securePrefixError || hostPrefixError));
      }
    }

    const store = this.store;

    store.updateCookie = store.updateCookie || ((oldCookie, newCookie, cb) => store.putCookie(newCookie, cb));

    store.findCookie(cookie.domain, cookie.path, cookie.key, (err, oldCookie) => {
      if (err) return cb(err);
      const next = err => (err ? cb(err) : cb(null, cookie));
      if (oldCookie) {
        if (options.http === false && oldCookie.httpOnly) {
          return cb(options.ignoreError ? null : new Error("old Cookie is HttpOnly and this isn't an HTTP API"));
        }
        Object.assign(cookie, { creation: oldCookie.creation, creationIndex: oldCookie.creationIndex, lastAccessed: now });
        store.updateCookie(oldCookie, cookie, next);
      } else {
        Object.assign(cookie, { creation: now, lastAccessed: now });
        store.putCookie(cookie, next);
      }
    });
  }

  getCookies(url, options, cb) {
    const context = getCookieContext(url);
    if (typeof options === "function") {
      cb = options;
      options = {};
    }

    const host = canonicalDomain(context.hostname);
    const path = context.pathname || "/";
    const secure = options.secure === undefined ? (context.protocol === "https:" || context.protocol === "wss:") : options.secure;
    const sameSiteContext = options.sameSiteContext && checkSameSiteContext(options.sameSiteContext);

    if (!sameSiteContext && options.sameSiteContext) {
      return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
    }

    const sameSiteLevel = Cookie.sameSiteLevel[sameSiteContext] || 0;
    const http = options.http !== false;
    const now = options.now || Date.now();
    const expireCheck = options.expire !== false;
    const allPaths = !!options.allPaths;
    const store = this.store;

    store.findCookies(host, allPaths ? null : path, this.allowSpecialUseDomain, (err, cookies) => {
      if (err) return cb(err);

      cookies = cookies.filter(c => {
        if (c.hostOnly) {
          if (c.domain !== host) return false;
        } else {
          if (!domainMatch(host, c.domain, false)) return false;
        }
        if (!allPaths && !pathMatch(path, c.path)) return false;
        if (c.secure && !secure) return false;
        if (c.httpOnly && !http) return false;
        if (sameSiteLevel && (Cookie.sameSiteLevel[c.sameSite || "none"] > sameSiteLevel)) return false;
        if (expireCheck && c.expiryTime() <= now) {
          store.removeCookie(c.domain, c.path, c.key, () => {});
          return false;
        }
        return true;
      });

      if (options.sort !== false) cookies.sort(cookieCompare);

      const now = new Date();
      cookies.forEach(cookie => cookie.lastAccessed = now);

      cb(null, cookies);
    });
  }

  getCookieString(url, options, cb) {
    this.getCookies(url, options, (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.sort(cookieCompare).map(c => c.cookieString()).join("; "));
    });
  }

  getSetCookieStrings(url, options, cb) {
    this.getCookies(url, options, (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.map(c => c.toString()));
    });
  }

  serialize(cb) {
    const type = this.store.constructor.name || null;
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
        const obj = cookie instanceof Cookie ? cookie.toJSON() : cookie;
        delete obj.creationIndex;
        return obj;
      });

      cb(null, serialized);
    });
  }

  toJSON() {
    return this.serializeSync();
  }

  _importCookies(serialized, cb) {
    const cookies = serialized.cookies;
    if (!cookies || !Array.isArray(cookies)) {
      return cb(new Error("serialized jar has no cookies array"));
    }
    const store = this.store;

    const putNext = err => {
      if (err) return cb(err);
      if (!cookies.length) return cb(null, this);

      const cookie = fromJSON(cookies.shift());
      if (!cookie) return putNext(null);

      store.putCookie(cookie, putNext);
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
    if (!newStore.synchronous) {
      throw new Error("CookieJar clone destination store is not synchronous; use async API instead.");
    }
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

      const removeCookieCb = removeErr => {
        if (removeErr) removeErrors.push(removeErr);
        completedCount++;
        if (completedCount === cookies.length) {
          return cb(removeErrors.length ? removeErrors[0] : null);
        }
      };

      cookies.forEach(c => store.removeCookie(c.domain, c.path, c.key, removeCookieCb));
    });
  }

  static deserialize(strOrObj, store, cb) {
    if (arguments.length !== 3) {
      cb = store;
      store = null;
    }
    const serialized = typeof strOrObj === "string" ? jsonParse(strOrObj) : strOrObj;
    if (serialized instanceof Error) return cb(serialized);

    const jar = new CookieJar(store, serialized.rejectPublicSuffixes);
    jar._importCookies(serialized, err => (err ? cb(err) : cb(null, jar)));
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

["_importCookies", "clone", "getCookies", "getCookieString", "getSetCookieStrings", "removeAllCookies", "serialize", "setCookie"].forEach(name => {
  CookieJar.prototype[name] = fromCallback(CookieJar.prototype[name]);
});
CookieJar.deserialize = fromCallback(CookieJar.deserialize);

function syncWrap(method) {
  return function(...args) {
    if (!this.store.synchronous) {
      throw new Error("CookieJar store is not synchronous; use async API instead.");
    }
    let syncErr, syncResult;
    this[method](...args, (err, result) => { syncErr = err; syncResult = result; });
    if (syncErr) throw syncErr;
    return syncResult;
  };
}

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
