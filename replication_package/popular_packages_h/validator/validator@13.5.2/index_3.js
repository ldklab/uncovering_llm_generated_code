"use strict";

// Utility to determine the type of a given object.
function _typeof(obj) { 
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        return typeof obj;
    } else {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }
}

// Mark the module as an ES module.
Object.defineProperty(exports, "__esModule", {
    value: true
});

// Importing various utility functions from respective modules.
const _toDate = require("./lib/toDate").default;
const _toFloat = require("./lib/toFloat").default;
const _toInt = require("./lib/toInt").default;
const _toBoolean = require("./lib/toBoolean").default;
const _equals = require("./lib/equals").default;
const _contains = require("./lib/contains").default;
const _matches = require("./lib/matches").default;
const _isEmail = require("./lib/isEmail").default;
const _isURL = require("./lib/isURL").default;
const _isMACAddress = require("./lib/isMACAddress").default;
const _isIP = require("./lib/isIP").default;
const _isIPRange = require("./lib/isIPRange").default;
const _isFQDN = require("./lib/isFQDN").default;
const _isBoolean = require("./lib/isBoolean").default;
const _isLocale = require("./lib/isLocale").default;
const _isAlpha = require("./lib/isAlpha");
const _isAlphanumeric = require("./lib/isAlphanumeric");
const _isNumeric = require("./lib/isNumeric").default;
const _isPassportNumber = require("./lib/isPassportNumber").default;
const _isPort = require("./lib/isPort").default;
const _isLowercase = require("./lib/isLowercase").default;
const _isUppercase = require("./lib/isUppercase").default;
const _isIMEI = require("./lib/isIMEI").default;
const _isAscii = require("./lib/isAscii").default;
const _isFullWidth = require("./lib/isFullWidth").default;
const _isHalfWidth = require("./lib/isHalfWidth").default;
const _isVariableWidth = require("./lib/isVariableWidth").default;
const _isMultibyte = require("./lib/isMultibyte").default;
const _isSemVer = require("./lib/isSemVer").default;
const _isSurrogatePair = require("./lib/isSurrogatePair").default;
const _isInt = require("./lib/isInt").default;
const _isFloat = require("./lib/isFloat");
const _isDecimal = require("./lib/isDecimal").default;
const _isHexadecimal = require("./lib/isHexadecimal").default;
const _isOctal = require("./lib/isOctal").default;
const _isDivisibleBy = require("./lib/isDivisibleBy").default;
const _isHexColor = require("./lib/isHexColor").default;
const _isRgbColor = require("./lib/isRgbColor").default;
const _isHSL = require("./lib/isHSL").default;
const _isISRC = require("./lib/isISRC").default;
const _isIBAN = require("./lib/isIBAN").default;
const _isBIC = require("./lib/isBIC").default;
const _isMD5 = require("./lib/isMD5").default;
const _isHash = require("./lib/isHash").default;
const _isJWT = require("./lib/isJWT").default;
const _isJSON = require("./lib/isJSON").default;
const _isEmpty = require("./lib/isEmpty").default;
const _isLength = require("./lib/isLength").default;
const _isByteLength = require("./lib/isByteLength").default;
const _isUUID = require("./lib/isUUID").default;
const _isMongoId = require("./lib/isMongoId").default;
const _isAfter = require("./lib/isAfter").default;
const _isBefore = require("./lib/isBefore").default;
const _isIn = require("./lib/isIn").default;
const _isCreditCard = require("./lib/isCreditCard").default;
const _isIdentityCard = require("./lib/isIdentityCard").default;
const _isEAN = require("./lib/isEAN").default;
const _isISIN = require("./lib/isISIN").default;
const _isISBN = require("./lib/isISBN").default;
const _isISSN = require("./lib/isISSN").default;
const _isTaxID = require("./lib/isTaxID").default;
const _isMobilePhone = require("./lib/isMobilePhone");
const _isEthereumAddress = require("./lib/isEthereumAddress").default;
const _isCurrency = require("./lib/isCurrency").default;
const _isBtcAddress = require("./lib/isBtcAddress").default;
const _isISO = require("./lib/isISO8601").default;
const _isRFC = require("./lib/isRFC3339").default;
const _isISO31661Alpha = require("./lib/isISO31661Alpha2").default;
const _isISO31661Alpha2 = require("./lib/isISO31661Alpha3").default;
const _isBase = require("./lib/isBase32").default;
const _isBase2 = require("./lib/isBase58").default;
const _isBase3 = require("./lib/isBase64").default;
const _isDataURI = require("./lib/isDataURI").default;
const _isMagnetURI = require("./lib/isMagnetURI").default;
const _isMimeType = require("./lib/isMimeType").default;
const _isLatLong = require("./lib/isLatLong").default;
const _isPostalCode = require("./lib/isPostalCode");
const _ltrim = require("./lib/ltrim").default;
const _rtrim = require("./lib/rtrim").default;
const _trim = require("./lib/trim").default;
const _escape = require("./lib/escape").default;
const _unescape = require("./lib/unescape").default;
const _stripLow = require("./lib/stripLow").default;
const _whitelist = require("./lib/whitelist").default;
const _blacklist = require("./lib/blacklist").default;
const _isWhitelisted = require("./lib/isWhitelisted").default;
const _normalizeEmail = require("./lib/normalizeEmail").default;
const _isSlug = require("./lib/isSlug").default;
const _isStrongPassword = require("./lib/isStrongPassword").default;
const _isVAT = require("./lib/isVAT").default;

// Export object with validation functionalities for client use.
const validator = {
    version: '13.5.2',
    toDate: _toDate,
    toFloat: _toFloat,
    toInt: _toInt,
    toBoolean: _toBoolean,
    equals: _equals,
    contains: _contains,
    matches: _matches,
    isEmail: _isEmail,
    isURL: _isURL,
    isMACAddress: _isMACAddress,
    isIP: _isIP,
    isIPRange: _isIPRange,
    isFQDN: _isFQDN,
    isBoolean: _isBoolean,
    isIBAN: _isIBAN,
    isBIC: _isBIC,
    isAlpha: _isAlpha.default,
    isAlphaLocales: _isAlpha.locales,
    isAlphanumeric: _isAlphanumeric.default,
    isAlphanumericLocales: _isAlphanumeric.locales,
    isNumeric: _isNumeric,
    isPassportNumber: _isPassportNumber,
    isPort: _isPort,
    isLowercase: _isLowercase,
    isUppercase: _isUppercase,
    isAscii: _isAscii,
    isFullWidth: _isFullWidth,
    isHalfWidth: _isHalfWidth,
    isVariableWidth: _isVariableWidth,
    isMultibyte: _isMultibyte,
    isSemVer: _isSemVer,
    isSurrogatePair: _isSurrogatePair,
    isInt: _isInt,
    isIMEI: _isIMEI,
    isFloat: _isFloat.default,
    isFloatLocales: _isFloat.locales,
    isDecimal: _isDecimal,
    isHexadecimal: _isHexadecimal,
    isOctal: _isOctal,
    isDivisibleBy: _isDivisibleBy,
    isHexColor: _isHexColor,
    isRgbColor: _isRgbColor,
    isHSL: _isHSL,
    isISRC: _isISRC,
    isMD5: _isMD5,
    isHash: _isHash,
    isJWT: _isJWT,
    isJSON: _isJSON,
    isEmpty: _isEmpty,
    isLength: _isLength,
    isLocale: _isLocale,
    isByteLength: _isByteLength,
    isUUID: _isUUID,
    isMongoId: _isMongoId,
    isAfter: _isAfter,
    isBefore: _isBefore,
    isIn: _isIn,
    isCreditCard: _isCreditCard,
    isIdentityCard: _isIdentityCard,
    isEAN: _isEAN,
    isISIN: _isISIN,
    isISBN: _isISBN,
    isISSN: _isISSN,
    isMobilePhone: _isMobilePhone.default,
    isMobilePhoneLocales: _isMobilePhone.locales,
    isPostalCode: _isPostalCode.default,
    isPostalCodeLocales: _isPostalCode.locales,
    isEthereumAddress: _isEthereumAddress,
    isCurrency: _isCurrency,
    isBtcAddress: _isBtcAddress,
    isISO8601: _isISO,
    isRFC3339: _isRFC,
    isISO31661Alpha2: _isISO31661Alpha,
    isISO31661Alpha3: _isISO31661Alpha2,
    isBase32: _isBase,
    isBase58: _isBase2,
    isBase64: _isBase3,
    isDataURI: _isDataURI,
    isMagnetURI: _isMagnetURI,
    isMimeType: _isMimeType,
    isLatLong: _isLatLong,
    ltrim: _ltrim,
    rtrim: _rtrim,
    trim: _trim,
    escape: _escape,
    unescape: _unescape,
    stripLow: _stripLow,
    whitelist: _whitelist,
    blacklist: _blacklist,
    isWhitelisted: _isWhitelisted,
    normalizeEmail: _normalizeEmail,
    toString: String,
    isSlug: _isSlug,
    isStrongPassword: _isStrongPassword,
    isTaxID: _isTaxID,
    isDate: _isDate,
    isVAT: _isVAT
};

// Export the validator as default export.
exports.default = validator;
module.exports = exports.default;
module.exports.default = exports.default;
