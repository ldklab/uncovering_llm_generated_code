"use strict";

const toDate = require("./lib/toDate").default;
const toFloat = require("./lib/toFloat").default;
const toInt = require("./lib/toInt").default;
const toBoolean = require("./lib/toBoolean").default;
const equals = require("./lib/equals").default;
const contains = require("./lib/contains").default;
const matches = require("./lib/matches").default;
const isEmail = require("./lib/isEmail").default;
const isURL = require("./lib/isURL").default;
const isMACAddress = require("./lib/isMACAddress").default;
const isIP = require("./lib/isIP").default;
const isIPRange = require("./lib/isIPRange").default;
const isFQDN = require("./lib/isFQDN").default;
const isDate = require("./lib/isDate").default;
const isTime = require("./lib/isTime").default;
const isBoolean = require("./lib/isBoolean").default;
const isLocale = require("./lib/isLocale").default;
const isAbaRouting = require("./lib/isAbaRouting").default;
const isAlpha = require("./lib/isAlpha").default;
const isAlphaLocales = require("./lib/isAlpha").locales;
const isAlphanumeric = require("./lib/isAlphanumeric").default;
const isAlphanumericLocales = require("./lib/isAlphanumeric").locales;
const isNumeric = require("./lib/isNumeric").default;
const isPassportNumber = require("./lib/isPassportNumber").default;
const isPort = require("./lib/isPort").default;
const isLowercase = require("./lib/isLowercase").default;
const isUppercase = require("./lib/isUppercase").default;
const isIMEI = require("./lib/isIMEI").default;
const isAscii = require("./lib/isAscii").default;
const isFullWidth = require("./lib/isFullWidth").default;
const isHalfWidth = require("./lib/isHalfWidth").default;
const isVariableWidth = require("./lib/isVariableWidth").default;
const isMultibyte = require("./lib/isMultibyte").default;
const isSemVer = require("./lib/isSemVer").default;
const isSurrogatePair = require("./lib/isSurrogatePair").default;
const isInt = require("./lib/isInt").default;
const isFloat = require("./lib/isFloat").default;
const isFloatLocales = require("./lib/isFloat").locales;
const isDecimal = require("./lib/isDecimal").default;
const isHexadecimal = require("./lib/isHexadecimal").default;
const isOctal = require("./lib/isOctal").default;
const isDivisibleBy = require("./lib/isDivisibleBy").default;
const isHexColor = require("./lib/isHexColor").default;
const isRgbColor = require("./lib/isRgbColor").default;
const isHSL = require("./lib/isHSL").default;
const isISRC = require("./lib/isISRC").default;
const isIBAN = require("./lib/isIBAN").default;
const ibanLocales = require("./lib/isIBAN").locales;
const isBIC = require("./lib/isBIC").default;
const isMD5 = require("./lib/isMD5").default;
const isHash = require("./lib/isHash").default;
const isJWT = require("./lib/isJWT").default;
const isJSON = require("./lib/isJSON").default;
const isEmpty = require("./lib/isEmpty").default;
const isLength = require("./lib/isLength").default;
const isByteLength = require("./lib/isByteLength").default;
const isUUID = require("./lib/isUUID").default;
const isMongoId = require("./lib/isMongoId").default;
const isAfter = require("./lib/isAfter").default;
const isBefore = require("./lib/isBefore").default;
const isIn = require("./lib/isIn").default;
const isLuhnNumber = require("./lib/isLuhnNumber").default;
const isCreditCard = require("./lib/isCreditCard").default;
const isIdentityCard = require("./lib/isIdentityCard").default;
const isEAN = require("./lib/isEAN").default;
const isISIN = require("./lib/isISIN").default;
const isISBN = require("./lib/isISBN").default;
const isISSN = require("./lib/isISSN").default;
const isTaxID = require("./lib/isTaxID").default;
const isMobilePhone = require("./lib/isMobilePhone").default;
const isMobilePhoneLocales = require("./lib/isMobilePhone").locales;
const isEthereumAddress = require("./lib/isEthereumAddress").default;
const isCurrency = require("./lib/isCurrency").default;
const isBtcAddress = require("./lib/isBtcAddress").default;
const { isISO6346, isFreightContainerID } = require("./lib/isISO6346");
const isISO6391 = require("./lib/isISO6391").default;
const isISO8601 = require("./lib/isISO8601").default;
const isRFC3339 = require("./lib/isRFC3339").default;
const isISO31661Alpha2 = require("./lib/isISO31661Alpha2").default;
const isISO31661Alpha3 = require("./lib/isISO31661Alpha3").default;
const isISO4217 = require("./lib/isISO4217").default;
const isBase32 = require("./lib/isBase32").default;
const isBase58 = require("./lib/isBase58").default;
const isBase64 = require("./lib/isBase64").default;
const isDataURI = require("./lib/isDataURI").default;
const isMagnetURI = require("./lib/isMagnetURI").default;
const isMailtoURI = require("./lib/isMailtoURI").default;
const isMimeType = require("./lib/isMimeType").default;
const isLatLong = require("./lib/isLatLong").default;
const isPostalCode = require("./lib/isPostalCode").default;
const isPostalCodeLocales = require("./lib/isPostalCode").locales;
const ltrim = require("./lib/ltrim").default;
const rtrim = require("./lib/rtrim").default;
const trim = require("./lib/trim").default;
const escape = require("./lib/escape").default;
const unescape = require("./lib/unescape").default;
const stripLow = require("./lib/stripLow").default;
const whitelist = require("./lib/whitelist").default;
const blacklist = require("./lib/blacklist").default;
const isWhitelisted = require("./lib/isWhitelisted").default;
const normalizeEmail = require("./lib/normalizeEmail").default;
const isSlug = require("./lib/isSlug").default;
const isLicensePlate = require("./lib/isLicensePlate").default;
const isStrongPassword = require("./lib/isStrongPassword").default;
const isVAT = require("./lib/isVAT").default;

const version = '13.12.0';
const validator = {
  version,
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
  ibanLocales,
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
  isTaxID,
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
  isDate,
  isTime,
  isLicensePlate,
  isVAT,
};

module.exports = validator;
