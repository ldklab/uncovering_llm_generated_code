"use strict";

// Import and re-export statements
const { MemoryCookieStore } = require("../memstore");
exports.MemoryCookieStore = MemoryCookieStore;

const { pathMatch } = require("../pathMatch");
exports.pathMatch = pathMatch;

const { permuteDomain } = require("../permuteDomain");
exports.permuteDomain = permuteDomain;

const { getPublicSuffix } = require("../getPublicSuffix");
exports.getPublicSuffix = getPublicSuffix;

const { Store } = require("../store");
exports.Store = Store;

const { ParameterError } = require("../validators");
exports.ParameterError = ParameterError;

const { version } = require("../version");
exports.version = version;

const { canonicalDomain } = require("./canonicalDomain");
exports.canonicalDomain = canonicalDomain;

const { PrefixSecurityEnum } = require("./constants");
exports.PrefixSecurityEnum = PrefixSecurityEnum;

const { Cookie } = require("./cookie");
exports.Cookie = Cookie;

const { cookieCompare } = require("./cookieCompare");
exports.cookieCompare = cookieCompare;

const { CookieJar } = require("./cookieJar");
exports.CookieJar = CookieJar;

const { defaultPath } = require("./defaultPath");
exports.defaultPath = defaultPath;

const { domainMatch } = require("./domainMatch");
exports.domainMatch = domainMatch;

const { formatDate } = require("./formatDate");
exports.formatDate = formatDate;

const { parseDate } = require("./parseDate");
exports.parseDate = parseDate;

const { permutePath } = require("./permutePath");
exports.permutePath = permutePath;

// Additional Cookie methods
const cookieModule = require("./cookie");

/**
 * Parses a string as a cookie using the Cookie class's method.
 * {@inheritDoc Cookie.parse}
 * @public
 */
function parse(str, options) {
    return cookieModule.Cookie.parse(str, options);
}
exports.parse = parse;

/**
 * Creates a Cookie object from a JSON string using the Cookie class's method.
 * {@inheritDoc Cookie.fromJSON}
 * @public
 */
function fromJSON(str) {
    return cookieModule.Cookie.fromJSON(str);
}
exports.fromJSON = fromJSON;
