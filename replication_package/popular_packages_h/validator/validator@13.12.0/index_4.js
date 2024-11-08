"use strict";

const { default: toDate } = require("./lib/toDate");
const { default: toFloat } = require("./lib/toFloat");
const { default: toInt } = require("./lib/toInt");
const { default: toBoolean } = require("./lib/toBoolean");
const { default: equals } = require("./lib/equals");
const { default: contains } = require("./lib/contains");
const { default: matches } = require("./lib/matches");
const { default: isEmail } = require("./lib/isEmail");
const { default: isURL } = require("./lib/isURL");
const { default: isMACAddress } = require("./lib/isMACAddress");
const { default: isIP } = require("./lib/isIP");
const { default: isIPRange } = require("./lib/isIPRange");
const { default: isFQDN } = require("./lib/isFQDN");
const { default: isDate } = require("./lib/isDate");
const { default: isTime } = require("./lib/isTime");
const { default: isBoolean } = require("./lib/isBoolean");
const { default: isLocale } = require("./lib/isLocale");
const { default: isAbaRouting } = require("./lib/isAbaRouting");
const { default: isAlpha } = require("./lib/isAlpha");
const { locales: isAlphaLocales } = require("./lib/isAlpha");
const { default: isAlphanumeric } = require("./lib/isAlphanumeric");
const { locales: isAlphanumericLocales } = require("./lib/isAlphanumeric");
const { default: isNumeric } = require("./lib/isNumeric");
const { default: isPassportNumber } = require("./lib/isPassportNumber");
const { default: isPort } = require("./lib/isPort");
const { default: isLowercase } = require("./lib/isLowercase");
const { default: isUppercase } = require("./lib/isUppercase");
const { default: isIMEI } = require("./lib/isIMEI");
const { default: isAscii } = require("./lib/isAscii");
const { default: isFullWidth } = require("./lib/isFullWidth");
const { default: isHalfWidth } = require("./lib/isHalfWidth");
const { default: isVariableWidth } = require("./lib/isVariableWidth");
const { default: isMultibyte } = require("./lib/isMultibyte");
const { default: isSemVer } = require("./lib/isSemVer");
const { default: isSurrogatePair } = require("./lib/isSurrogatePair");
const { default: isInt } = require("./lib/isInt");
const { default: isFloat } = require("./lib/isFloat");
const { locales: isFloatLocales } = require("./lib/isFloat");
const { default: isDecimal } = require("./lib/isDecimal");
const { default: isHexadecimal } = require("./lib/isHexadecimal");
const { default: isOctal } = require("./lib/isOctal");
const { default: isDivisibleBy } = require("./lib/isDivisibleBy");
const { default: isHexColor } = require("./lib/isHexColor");
const { default: isRgbColor } = require("./lib/isRgbColor");
const { default: isHSL } = require("./lib/isHSL");
const { default: isISRC } = require("./lib/isISRC");
const { default: isIBAN } = require("./lib/isIBAN");
const { locales: ibanLocales } = require("./lib/isIBAN");
const { default: isBIC } = require("./lib/isBIC");
const { default: isMD5 } = require("./lib/isMD5");
const { default: isHash } = require("./lib/isHash");
const { default: isJWT } = require("./lib/isJWT");
const { default: isJSON } = require("./lib/isJSON");
const { default: isEmpty } = require("./lib/isEmpty");
const { default: isLength } = require("./lib/isLength");
const { default: isByteLength } = require("./lib/isByteLength");
const { default: isUUID } = require("./lib/isUUID");
const { default: isMongoId } = require("./lib/isMongoId");
const { default: isAfter } = require("./lib/isAfter");
const { default: isBefore } = require("./lib/isBefore");
const { default: isIn } = require("./lib/isIn");
const { default: isLuhnNumber } = require("./lib/isLuhnNumber");
const { default: isCreditCard } = require("./lib/isCreditCard");
const { default: isIdentityCard } = require("./lib/isIdentityCard");
const { default: isEAN } = require("./lib/isEAN");
const { default: isISIN } = require("./lib/isISIN");
const { default: isISBN } = require("./lib/isISBN");
const { default: isISSN } = require("./lib/isISSN");
const { default: isMobilePhone } = require("./lib/isMobilePhone");
const { locales: isMobilePhoneLocales } = require("./lib/isMobilePhone");
const { default: isPostalCode } = require("./lib/isPostalCode");
const { locales: isPostalCodeLocales } = require("./lib/isPostalCode");
const { default: isEthereumAddress } = require("./lib/isEthereumAddress");
const { default: isCurrency } = require("./lib/isCurrency");
const { default: isBtcAddress } = require("./lib/isBtcAddress");
const { isISO6346, isFreightContainerID } = require("./lib/isISO6346");
const { default: isISO6391 } = require("./lib/isISO6391");
const { default: isISO8601 } = require("./lib/isISO8601");
const { default: isRFC3339 } = require("./lib/isRFC3339");
const { default: isISO31661Alpha2 } = require("./lib/isISO31661Alpha2");
const { default: isISO31661Alpha3 } = require("./lib/isISO31661Alpha3");
const { default: isISO4217 } = require("./lib/isISO4217");
const { default: isBase32 } = require("./lib/isBase32");
const { default: isBase58 } = require("./lib/isBase58");
const { default: isBase64 } = require("./lib/isBase64");
const { default: isDataURI } = require("./lib/isDataURI");
const { default: isMagnetURI } = require("./lib/isMagnetURI");
const { default: isMailtoURI } = require("./lib/isMailtoURI");
const { default: isMimeType } = require("./lib/isMimeType");
const { default: isLatLong } = require("./lib/isLatLong");
const { default: ltrim } = require("./lib/ltrim");
const { default: rtrim } = require("./lib/rtrim");
const { default: trim } = require("./lib/trim");
const { default: escape } = require("./lib/escape");
const { default: unescape } = require("./lib/unescape");
const { default: stripLow } = require("./lib/stripLow");
const { default: whitelist } = require("./lib/whitelist");
const { default: blacklist } = require("./lib/blacklist");
const { default: isWhitelisted } = require("./lib/isWhitelisted");
const { default: normalizeEmail } = require("./lib/normalizeEmail");
const { default: isSlug } = require("./lib/isSlug");
const { default: isStrongPassword } = require("./lib/isStrongPassword");
const { default: isTaxID } = require("./lib/isTaxID");
const { default: isLicensePlate } = require("./lib/isLicensePlate");
const { default: isVAT } = require("./lib/isVAT");

const version = '13.12.0';

const validator = {
    version: version,
    toDate,
    toFloat,
    toInt,
    toBoolean,
    equals,
    contains,
    matches,
    isEmail,
    isURL,
    isMACAddress,
    isIP,
    isIPRange,
    isFQDN,
    isBoolean,
    isIBAN,
    isBIC,
    isAbaRouting,
    isAlpha,
    isAlphaLocales,
    isAlphanumeric,
    isAlphanumericLocales,
    isNumeric,
    isPassportNumber,
    isPort,
    isLowercase,
    isUppercase,
    isAscii,
    isFullWidth,
    isHalfWidth,
    isVariableWidth,
    isMultibyte,
    isSemVer,
    isSurrogatePair,
    isInt,
    isIMEI,
    isFloat,
    isFloatLocales,
    isDecimal,
    isHexadecimal,
    isOctal,
    isDivisibleBy,
    isHexColor,
    isRgbColor,
    isHSL,
    isISRC,
    isMD5,
    isHash,
    isJWT,
    isJSON,
    isEmpty,
    isLength,
    isLocale,
    isByteLength,
    isUUID,
    isMongoId,
    isAfter,
    isBefore,
    isIn,
    isLuhnNumber,
    isCreditCard,
    isIdentityCard,
    isEAN,
    isISIN,
    isISBN,
    isISSN,
    isMobilePhone,
    isMobilePhoneLocales,
    isPostalCode,
    isPostalCodeLocales,
    isEthereumAddress,
    isCurrency,
    isBtcAddress,
    isISO6346,
    isFreightContainerID,
    isISO6391,
    isISO8601,
    isRFC3339,
    isISO31661Alpha2,
    isISO31661Alpha3,
    isISO4217,
    isBase32,
    isBase58,
    isBase64,
    isDataURI,
    isMagnetURI,
    isMailtoURI,
    isMimeType,
    isLatLong,
    ltrim,
    rtrim,
    trim,
    escape,
    unescape,
    stripLow,
    whitelist,
    blacklist,
    isWhitelisted,
    normalizeEmail,
    isSlug,
    isStrongPassword,
    isTaxID,
    isDate,
    isTime,
    isLicensePlate,
    isVAT,
    ibanLocales
};

exports.default = validator;
module.exports = exports.default;
module.exports.default = exports.default;
