"use strict";

const punycode = require("punycode");
const { parse: urlParse } = require("url");
const { inspect } = require("util");
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
const MONTH_TO_NUM = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const MAX_TIME = 2147483647000;
const MIN_TIME = 0;
const SAME_SITE_CONTEXT_VAL_ERR = 'Invalid sameSiteContext option for getCookies(); expected one of "strict", "lax", or "none"';
const IP_REGEX_LOWERCASE = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-f\d]{1,4}:){7}(?:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,2}|:)|(?:[a-f\d]{1,4}:){4}(?:(?::[a-f\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,3}|:)|(?:[a-f\d]{1,4}:){3}(?:(?::[a-f\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,4}|:)|(?:[a-f\d]{1,4}:){2}(?:(?::[a-f\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,5}|:)|(?:[a-f\d]{1,4}:){1}(?:(?::[a-f\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,6}|:)|(?::(?:(?::[a-f\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,7}|:)))$/;

function checkSameSiteContext(value) {
  const context = String(value).toLowerCase();
  if (context === "none" || context === "lax" || context === "strict") {
    return context;
  }
  return null;
}

const PrefixSecurityEnum = Object.freeze({
  SILENT: "silent",
  STRICT: "strict",
  DISABLED: "unsafe-disabled"
});

function parseDigits(token, minDigits, maxDigits, trailingOK) {
  let count = 0;
  while (count < token.length) {
    const c = token.charCodeAt(count);
    if (c <= 0x2f || c >= 0x3a) break;
    count++;
  }
  if (count < minDigits || count > maxDigits || (!trailingOK && count != token.length)) {
    return null;
  }
  return parseInt(token.substr(0, count), 10);
}

function parseTime(token) {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const result = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const num = parseDigits(parts[i], 1, 2, i === 2);
    if (num === null) return null;
    result[i] = num;
  }
  return result;
}

function parseMonth(token) {
  token = String(token).substr(0, 3).toLowerCase();
  const num = MONTH_TO_NUM[token];
  return num >= 0 ? num : null;
}

function parseDate(str) {
  if (!str) return;
  const tokens = str.split(DATE_DELIM);
  if (!tokens) return;
  
  let hour, minute, second, dayOfMonth, month, year;
  tokens.forEach(token => {
    token = token.trim();
    if (!token.length) return;

    if (second === null) {
      const result = parseTime(token);
      if (result) {
        [hour, minute, second] = result;
        return;
      }
    }
    if (dayOfMonth === null) {
      const result = parseDigits(token, 1, 2, true);
      if (result !== null) {
        dayOfMonth = result;
        return;
      }
    }
    if (month === null) {
      const result = parseMonth(token);
      if (result !== null) {
        month = result;
        return;
      }
    }
    if (year === null) {
      const result = parseDigits(token, 2, 4, true);
      if (result !== null) {
        year = result;
        if (year >= 70 && year <= 99) year += 1900;
        else if (year >= 0 && year <= 69) year += 2000;
      }
    }
  });

  if (dayOfMonth === null || month === null || year === null || second === null
      || dayOfMonth < 1 || dayOfMonth > 31 || year < 1601 || hour > 23 || minute > 59 || second > 59) {
    return;
  }

  return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
}

function formatDate(date) {
  return date.toUTCString();
}

function canonicalDomain(str) {
  if (str == null) return null;
  str = str.trim().replace(/^\./, "");
  if (punycode && /[^\u0001-\u007f]/.test(str)) {
    str = punycode.toASCII(str);
  }
  return str.toLowerCase();
}

function domainMatch(str, domStr, canonicalize) {
  if (str == null || domStr == null) return null;
  if (canonicalize !== false) {
    str = canonicalDomain(str);
    domStr = canonicalDomain(domStr);
  }
  
  if (str === domStr) return true;
  
  const idx = str.indexOf(domStr);
  if (idx <= 0 || str.length !== domStr.length + idx || str.substr(idx - 1, 1) !== '.' || IP_REGEX_LOWERCASE.test(str)) {
    return false;
  }
  return true;
}

function defaultPath(path) {
  if (!path || path.substr(0, 1) !== "/") {
    return "/";
  }
  if (path === "/") {
    return path;
  }
  const rightSlash = path.lastIndexOf("/");
  if (rightSlash === 0) {
    return "/";
  }
  return path.slice(0, rightSlash);
}

function trimTerminator(str) {
  TERMINATORS.forEach(t => {
    const idx = str.indexOf(t);
    if (idx !== -1) str = str.substr(0, idx);
  });
  return str;
}

function parseCookiePair(cookiePair, looseMode) {
  cookiePair = trimTerminator(cookiePair);
  let firstEq = cookiePair.indexOf("=");
  if (looseMode && firstEq === 0) {
    cookiePair = cookiePair.substr(1);
    firstEq = cookiePair.indexOf("=");
  } else if (firstEq <= 0) {
    return;
  }

  const [cookieName, cookieValue] = firstEq <= 0
    ? ["", cookiePair.trim()]
    : [cookiePair.substr(0, firstEq).trim(), cookiePair.substr(firstEq + 1).trim()];
  
  if (CONTROL_CHARS.test(cookieName) || CONTROL_CHARS.test(cookieValue)) {
    return;
  }

  const c = new Cookie();
  c.key = cookieName;
  c.value = cookieValue;
  return c;
}

function parse(str, options = {}) {
  str = str.trim();
  const firstSemi = str.indexOf(";");
  const cookiePair = firstSemi === -1 ? str : str.substr(0, firstSemi);
  const c = parseCookiePair(cookiePair, !!options.loose);
  if (!c) {
    return;
  }

  if (firstSemi === -1) {
    return c;
  }

  const unparsed = str.slice(firstSemi + 1).trim();
  if (unparsed.length === 0) {
    return c;
  }

  const cookie_avs = unparsed.split(";");
  while (cookie_avs.length) {
    const av = cookie_avs.shift().trim();
    if (av.length === 0) {
      continue;
    }
    const av_sep = av.indexOf("=");
    const av_key = av_sep === -1 ? av : av.substr(0, av_sep).trim().toLowerCase();
    const av_value = av_sep === -1 ? null : av.substr(av_sep + 1).trim();

    switch (av_key) {
      case "expires":
        if (av_value) {
          const exp = parseDate(av_value);
          if (exp) c.expires = exp;
        }
        break;
      case "max-age":
        if (av_value && /^-?[0-9]+$/.test(av_value)) {
          c.setMaxAge(parseInt(av_value, 10));
        }
        break;
      case "domain":
        if (av_value) {
          const domain = av_value.trim().replace(/^\./, "");
          if (domain) {
            c.domain = domain.toLowerCase();
          }
        }
        break;
      case "path":
        c.path = av_value && av_value[0] === "/" ? av_value : null;
        break;
      case "secure":
        c.secure = true;
        break;
      case "httponly":
        c.httpOnly = true;
        break;
      case "samesite":
        const enforcement = av_value ? av_value.toLowerCase() : "";
        c.sameSite = enforcement === "strict" || enforcement === "lax" ? enforcement : "none";
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
  return (
    !cookie.key.startsWith("__Host-") ||
    (cookie.secure &&
      cookie.hostOnly &&
      cookie.path != null &&
      cookie.path === "/")
  );
}

function jsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return e;
  }
}

function fromJSON(str) {
  if (!str) {
    return null;
  }

  const obj = typeof str === "string" ? jsonParse(str) : str;
  if (obj instanceof Error) {
    return null;
  }

  const c = new Cookie();
  for (const prop of Cookie.serializableProperties) {
    if (obj[prop] !== undefined && obj[prop] !== cookieDefaults[prop]) {
      c[prop] = obj[prop];
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
  if (cmp !== 0) return cmp;

  cmp = a.creationIndex - b.creationIndex;
  return cmp;
}

function permutePath(path) {
  if (path === "/") return ["/"];
  const permutations = [path];
  while (path.length > 1) {
    const lindex = path.lastIndexOf("/");
    if (lindex === 0) break;
    path = path.substr(0, lindex);
    permutations.push(path);
  }
  permutations.push("/");
  return permutations;
}

function getCookieContext(url) {
  if (url instanceof Object) return url;
  try {
    url = decodeURI(url);
  } catch {}
  return urlParse(url);
}

const cookieDefaults = {
  key: "",
  value: "",
  expires: "Infinity",
  maxAge: null,
  domain: null,
  path: null,
  secure: false,
  httpOnly: false,
  extensions: null,
  hostOnly: null,
  pathIsDefault: null,
  creation: null,
  lastAccessed: null,
  sameSite: "none"
};

class Cookie {
  constructor(options = {}) {
    if (inspect.custom) {
      this[inspect.custom] = this.inspect;
    }
    Object.assign(this, cookieDefaults, options);
    this.creation = this.creation || new Date();
    Object.defineProperty(this, "creationIndex", {
      configurable: false,
      enumerable: false,
      writable: true,
      value: ++Cookie.cookiesCreated
    });
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
      if (this[prop] === cookieDefaults[prop]) {
        continue;
      }
      if (prop === "expires" || prop === "creation" || prop === "lastAccessed") {
        obj[prop] = this[prop] === null ? null : (this[prop] == "Infinity" ? "Infinity" : this[prop].toISOString());
      } else if (prop === "maxAge") {
        if (this[prop] !== null) {
          obj[prop] = this[prop] == Infinity || this[prop] == -Infinity ? this[prop].toString() : this[prop];
        }
      } else {
        obj[prop] = this[prop];
      }
    }
    return obj;
  }

  clone() {
    return fromJSON(this.toJSON());
  }

  validate() {
    if (!COOKIE_OCTETS.test(this.value)) {
      return false;
    }
    if (
      this.expires != Infinity &&
      !(this.expires instanceof Date) &&
      !parseDate(this.expires)
    ) {
      return false;
    }
    if (this.maxAge != null && this.maxAge <= 0) {
      return false;
    }
    if (this.path != null && !PATH_VALUE.test(this.path)) {
      return false;
    }
    const cdomain = this.cdomain();
    if (cdomain) {
      if (cdomain.match(/\.$/)) {
        return false;
      }
      const suffix = pubsuffix.getPublicSuffix(cdomain);
      if (suffix == null) {
        return false;
      }
    }
    return true;
  }

  setExpires(exp) {
    if (exp instanceof Date) {
      this.expires = exp;
    } else {
      this.expires = parseDate(exp) || "Infinity";
    }
  }

  setMaxAge(age) {
    this.maxAge = age === Infinity || age === -Infinity ? age.toString() : age;
  }

  cookieString() {
    let val = this.value;
    if (val == null) {
      val = "";
    }
    return this.key === "" ? val : `${this.key}=${val}`;
  }

  toString() {
    let str = this.cookieString();
    if (this.expires !== Infinity) {
      str += `; Expires=${formatDate(this.expires instanceof Date ? this.expires : this.expires)}`;
    }
    if (this.maxAge != null && this.maxAge !== Infinity) {
      str += `; Max-Age=${this.maxAge}`;
    }
    if (this.domain && !this.hostOnly) {
      str += `; Domain=${this.domain}`;
    }
    if (this.path) {
      str += `; Path=${this.path}`;
    }
    if (this.secure) {
      str += "; Secure";
    }
    if (this.httpOnly) {
      str += "; HttpOnly";
    }
    if (this.sameSite && this.sameSite !== "none") {
      const ssCanon = Cookie.sameSiteCanonical[this.sameSite.toLowerCase()];
      str += `; SameSite=${ssCanon || this.sameSite}`;
    }
    if (this.extensions) {
      this.extensions.forEach(ext => {
        str += `; ${ext}`;
      });
    }
    return str;
  }

  TTL(now) {
    if (this.maxAge != null) {
      return this.maxAge <= 0 ? 0 : this.maxAge * 1000;
    }
    let expires = this.expires;
    if (expires != Infinity) {
      if (!(expires instanceof Date)) {
        expires = parseDate(expires) || Infinity;
      }
      if (expires == Infinity) {
        return Infinity;
      }
      return expires.getTime() - (now || Date.now());
    }
    return Infinity;
  }

  expiryTime(now) {
    if (this.maxAge != null) {
      const relativeTo = now || this.creation || new Date();
      const age = this.maxAge <= 0 ? -Infinity : this.maxAge * 1000;
      return relativeTo.getTime() + age;
    }
    if (this.expires == Infinity) {
      return Infinity;
    }
    return this.expires.getTime();
  }

  expiryDate(now) {
    const millisec = this.expiryTime(now);
    return millisec == Infinity ? new Date(MAX_TIME) : (millisec == -Infinity ? new Date(MIN_TIME) : new Date(millisec));
  }

  isPersistent() {
    return this.maxAge != null || this.expires != Infinity;
  }

  canonicalizedDomain() {
    return this.domain == null ? null : canonicalDomain(this.domain);
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
    if (typeof options === "boolean") {
      options = { rejectPublicSuffixes: options };
    }
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
      if (!sameSiteContext) {
        return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
      }
    }
    if (typeof cookie === "string" || cookie instanceof String) {
      cookie = Cookie.parse(cookie, { loose: loose });
      if (!cookie) {
        const err = new Error("Cookie failed to parse");
        return cb(options.ignoreError ? null : err);
      }
    } else if (!(cookie instanceof Cookie)) {
      const err = new Error("First argument to setCookie must be a Cookie object or string");
      return cb(options.ignoreError ? null : err);
    }

    const now = options.now || new Date();
    if (this.rejectPublicSuffixes && cookie.domain) {
      const suffix = pubsuffix.getPublicSuffix(cookie.cdomain());
      if (suffix == null) {
        const err = new Error("Cookie has domain set to a public suffix");
        return cb(options.ignoreError ? null : err);
      }
    }
    if (cookie.domain) {
      if (!domainMatch(host, cookie.cdomain(), false)) {
        const err = new Error(
          `Cookie not in this host's domain. Cookie:${cookie.cdomain()} Request:${host}`
        );
        return cb(options.ignoreError ? null : err);
      }

      if (cookie.hostOnly == null) {
        cookie.hostOnly = false;
      }
    } else {
      cookie.hostOnly = true;
      cookie.domain = host;
    }
    if (!cookie.path || cookie.path[0] !== "/") {
      cookie.path = defaultPath(context.pathname);
      cookie.pathIsDefault = true;
    }
    if (options.http === false && cookie.httpOnly) {
      const err = new Error("Cookie is HttpOnly and this isn't an HTTP API");
      return cb(options.ignoreError ? null : err);
    }
    if (cookie.sameSite !== "none" && sameSiteContext) {
      if (sameSiteContext === "none") {
        const err = new Error("Cookie is SameSite but this is a cross-origin request");
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
      if (err) {
        return cb(err);
      }

      const next = err => err ? cb(err) : cb(null, cookie);

      if (oldCookie) {
        if (options.http === false && oldCookie.httpOnly) {
          const err = new Error("old Cookie is HttpOnly and this isn't an HTTP API");
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
    const secure = options.secure || (context.protocol && /^(https|wss):$/.test(context.protocol));
    const sameSiteContext = options.sameSiteContext ? checkSameSiteContext(options.sameSiteContext) : null;
    const sameSiteLevel = Cookie.sameSiteLevel[sameSiteContext] || 0;
    const http = options.http !== false;
    const now = options.now || Date.now();
    const expireCheck = options.expire !== false;
    const allPaths = !!options.allPaths;
    const store = this.store;

    function matchingCookie(c) {
      if (c.hostOnly ? c.domain != host : !domainMatch(host, c.domain, false)) {
        return false;
      }
      if (!allPaths && !pathMatch(path, c.path)) {
        return false;
      }
      if (c.secure && !secure) {
        return false;
      }
      if (c.httpOnly && !http) {
        return false;
      }
      if (sameSiteLevel && Cookie.sameSiteLevel[c.sameSite || "none"] > sameSiteLevel) {
        return false;
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
      if (options.sort !== false) {
        cookies.sort(cookieCompare);
      }

      const now = new Date();
      cookies.forEach(cookie => { cookie.lastAccessed = now; });
      
      cb(null, cookies);
    });
  }

  getCookieString(...args) {
    const cb = args.pop();
    this.getCookies(...args, (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.sort(cookieCompare).map(c => c.cookieString()).join("; "));
    });
  }

  getSetCookieStrings(...args) {
    const cb = args.pop();
    this.getCookies(...args, (err, cookies) => {
      if (err) return cb(err);
      cb(null, cookies.map(c => c.toString()));
    });
  }

  serialize(cb) {
    const type = (this.store.constructor.name === "Object") ? null : this.store.constructor.name;
    const serialized = {
      version: `tough-cookie@${VERSION}`,
      storeType: type,
      rejectPublicSuffixes: !!this.rejectPublicSuffixes,
      cookies: []
    };

    if (!(this.store.getAllCookies && typeof this.store.getAllCookies === "function")) {
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

    const putNext = err => {
      if (err) return cb(err);
      if (!cookies.length) return cb(err, this);

      let cookie;
      try {
        cookie = fromJSON(cookies.shift());
      } catch (e) {
        return cb(e);
      }

      if (cookie === null) {
        putNext(null);
      } else {
        this.store.putCookie(cookie, putNext);
      }
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
    return arguments.length === 0 ? this._cloneSync() : this._cloneSync(newStore);
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
        if (completedCount === cookies.length) {
          cb(removeErrors.length ? removeErrors[0] : null);
        }
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

    const serialized = typeof strOrObj === "string" ? jsonParse(strOrObj) : strOrObj;
    if (serialized instanceof Error) return cb(serialized);

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

const syncMethods = [
  "_importCookies",
  "clone",
  "getCookies",
  "getCookieString",
  "getSetCookieStrings",
  "removeAllCookies",
  "serialize",
  "setCookie"
];
syncMethods.forEach(name => {
  CookieJar.prototype[name] = fromCallback(CookieJar.prototype[name]);
});
CookieJar.deserialize = fromCallback(CookieJar.deserialize);

function syncWrap(method) {
  return function(...args) {
    if (!this.store.synchronous) throw new Error("CookieJar store is not synchronous; use async API instead.");
    let syncErr, syncResult;
    this[method](...args, (err, result) => {
      syncErr = err;
      syncResult = result;
    });
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
