"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Exporting functions and classes from various modules
exports.permutePath = exports.parseDate = exports.formatDate = exports.domainMatch = exports.defaultPath = exports.CookieJar = exports.cookieCompare = exports.Cookie = exports.PrefixSecurityEnum = exports.canonicalDomain = exports.version = exports.ParameterError = exports.Store = exports.getPublicSuffix = exports.permuteDomain = exports.pathMatch = exports.MemoryCookieStore = void 0;

// Exporting parse and fromJSON functions
exports.parse = parse;
exports.fromJSON = fromJSON;

// Importing and exporting MemoryCookieStore from memstore module
var { MemoryCookieStore } = require("../memstore");
exports.MemoryCookieStore = MemoryCookieStore;

// Importing and exporting other functionalities from different modules
var { pathMatch } = require("../pathMatch");
exports.pathMatch = pathMatch;

var { permuteDomain } = require("../permuteDomain");
exports.permuteDomain = permuteDomain;

var { getPublicSuffix } = require("../getPublicSuffix");
exports.getPublicSuffix = getPublicSuffix;

var { Store } = require("../store");
exports.Store = Store;

var { ParameterError } = require("../validators");
exports.ParameterError = ParameterError;

var { version } = require("../version");
exports.version = version;

var { canonicalDomain } = require("./canonicalDomain");
exports.canonicalDomain = canonicalDomain;

var { PrefixSecurityEnum } = require("./constants");
exports.PrefixSecurityEnum = PrefixSecurityEnum;

var { Cookie } = require("./cookie");
exports.Cookie = Cookie;

var { cookieCompare } = require("./cookieCompare");
exports.cookieCompare = cookieCompare;

var { CookieJar } = require("./cookieJar");
exports.CookieJar = CookieJar;

var { defaultPath } = require("./defaultPath");
exports.defaultPath = defaultPath;

var { domainMatch } = require("./domainMatch");
exports.domainMatch = domainMatch;

var { formatDate } = require("./formatDate");
exports.formatDate = formatDate;

var { parseDate } = require("./parseDate");
exports.parseDate = parseDate;

var { permutePath } = require("./permutePath");
exports.permutePath = permutePath;

// Importing specific functions from the cookie module
const { parse: cookieParse, fromJSON: cookieFromJSON } = require("./cookie");

/**
 * Parses a cookie string into an object
 * @param {string} str - The cookie string
 * @param {object} options - Parsing options
 * @public
 */
function parse(str, options) {
    return cookieParse(str, options);
}

/**
 * Converts a JSON string into a Cookie object
 * @param {string} str - The JSON string representation of a cookie
 * @public
 */
function fromJSON(str) {
    return cookieFromJSON(str);
}
