"use strict";

const toDate = require("./lib/toDate");
const toFloat = require("./lib/toFloat");
const toInt = require("./lib/toInt");
const toBoolean = require("./lib/toBoolean");
const equals = require("./lib/equals");
const contains = require("./lib/contains");
const matches = require("./lib/matches");
const isEmail = require("./lib/isEmail");
const isURL = require("./lib/isURL");
const isMACAddress = require("./lib/isMACAddress");
const isIP = require("./lib/isIP");
const isIPRange = require("./lib/isIPRange");
const isFQDN = require("./lib/isFQDN");
const isDate = require("./lib/isDate");
const isBoolean = require("./lib/isBoolean");
const isLocale = require("./lib/isLocale");
const isAlpha = require("./lib/isAlpha");
const isAlphanumeric = require("./lib/isAlphanumeric");
const isNumeric = require("./lib/isNumeric");
const isPassportNumber = require("./lib/isPassportNumber");
const isPort = require("./lib/isPort");
const isLowercase = require("./lib/isLowercase");
const isUppercase = require("./lib/isUppercase");
const isIMEI = require("./lib/isIMEI");
const isAscii = require("./lib/isAscii");
const isFullWidth = require("./lib/isFullWidth");
const isHalfWidth = require("./lib/isHalfWidth");
const isVariableWidth = require("./lib/isVariableWidth");
const isMultibyte = require("./lib/isMultibyte");
const isSemVer = require("./lib/isSemVer");
const isSurrogatePair = require("./lib/isSurrogatePair");
const isInt = require("./lib/isInt");
const isFloat = require("./lib/isFloat");
const isDecimal = require("./lib/isDecimal");
const isHexadecimal = require("./lib/isHexadecimal");
const isOctal = require("./lib/isOctal");
const isDivisibleBy = require("./lib/isDivisibleBy");
const isHexColor = require("./lib/isHexColor");
const isRgbColor = require("./lib/isRgbColor");
const isHSL = require("./lib/isHSL");
const isISRC = require("./lib/isISRC");
const isIBAN = require("./lib/isIBAN");
const isBIC = require("./lib/isBIC");
const isMD5 = require("./lib/isMD5");
const isHash = require("./lib/isHash");
const isJWT = require("./lib/isJWT");
const isJSON = require("./lib/isJSON");
const isEmpty = require("./lib/isEmpty");
const isLength = require("./lib/isLength");
const isByteLength = require("./lib/isByteLength");
const isUUID = require("./lib/isUUID");
const isMongoId = require("./lib/isMongoId");
const isAfter = require("./lib/isAfter");
const isBefore = require("./lib/isBefore");
const isIn = require("./lib/isIn");
const isCreditCard = require("./lib/isCreditCard");
const isIdentityCard = require("./lib/isIdentityCard");
const isEAN = require("./lib/isEAN");
const isISIN = require("./lib/isISIN");
const isISBN = require("./lib/isISBN");
const isISSN = require("./lib/isISSN");
const isTaxID = require("./lib/isTaxID");
const isMobilePhone = require("./lib/isMobilePhone");
const isEthereumAddress = require("./lib/isEthereumAddress");
const isCurrency = require("./lib/isCurrency");
const isBtcAddress = require("./lib/isBtcAddress");
const isISO8601 = require("./lib/isISO8601");
const isRFC3339 = require("./lib/isRFC3339");
const isISO31661Alpha2 = require("./lib/isISO31661Alpha2");
const isISO31661Alpha3 = require("./lib/isISO31661Alpha3");
const isBase32 = require("./lib/isBase32");
const isBase58 = require("./lib/isBase58");
const isBase64 = require("./lib/isBase64");
const isDataURI = require("./lib/isDataURI");
const isMagnetURI = require("./lib/isMagnetURI");
const isMimeType = require("./lib/isMimeType");
const isLatLong = require("./lib/isLatLong");
const isPostalCode = require("./lib/isPostalCode");
const ltrim = require("./lib/ltrim");
const rtrim = require("./lib/rtrim");
const trim = require("./lib/trim");
const escape = require("./lib/escape");
const unescape = require("./lib/unescape");
const stripLow = require("./lib/stripLow");
const whitelist = require("./lib/whitelist");
const blacklist = require("./lib/blacklist");
const isWhitelisted = require("./lib/isWhitelisted");
const normalizeEmail = require("./lib/normalizeEmail");
const isSlug = require("./lib/isSlug");
const isStrongPassword = require("./lib/isStrongPassword");
const isVAT = require("./lib/isVAT");

const version = '13.5.2';

const validator = {
  version,
  toDate: toDate.default,
  toFloat: toFloat.default,
  toInt: toInt.default,
  toBoolean: toBoolean.default,
  equals: equals.default,
  contains: contains.default,
  matches: matches.default,
  isEmail: isEmail.default,
  isURL: isURL.default,
  isMACAddress: isMACAddress.default,
  isIP: isIP.default,
  isIPRange: isIPRange.default,
  isFQDN: isFQDN.default,
  isDate: isDate.default,
  isBoolean: isBoolean.default,
  isLocale: isLocale.default,
  isAlpha: isAlpha.default,
  isAlphanumeric: isAlphanumeric.default,
  isNumeric: isNumeric.default,
  isPassportNumber: isPassportNumber.default,
  isPort: isPort.default,
  isLowercase: isLowercase.default,
  isUppercase: isUppercase.default,
  isIMEI: isIMEI.default,
  isAscii: isAscii.default,
  isFullWidth: isFullWidth.default,
  isHalfWidth: isHalfWidth.default,
  isVariableWidth: isVariableWidth.default,
  isMultibyte: isMultibyte.default,
  isSemVer: isSemVer.default,
  isSurrogatePair: isSurrogatePair.default,
  isInt: isInt.default,
  isFloat: isFloat.default,
  isDecimal: isDecimal.default,
  isHexadecimal: isHexadecimal.default,
  isOctal: isOctal.default,
  isDivisibleBy: isDivisibleBy.default,
  isHexColor: isHexColor.default,
  isRgbColor: isRgbColor.default,
  isHSL: isHSL.default,
  isISRC: isISRC.default,
  isIBAN: isIBAN.default,
  isBIC: isBIC.default,
  isMD5: isMD5.default,
  isHash: isHash.default,
  isJWT: isJWT.default,
  isJSON: isJSON.default,
  isEmpty: isEmpty.default,
  isLength: isLength.default,
  isByteLength: isByteLength.default,
  isUUID: isUUID.default,
  isMongoId: isMongoId.default,
  isAfter: isAfter.default,
  isBefore: isBefore.default,
  isIn: isIn.default,
  isCreditCard: isCreditCard.default,
  isIdentityCard: isIdentityCard.default,
  isEAN: isEAN.default,
  isISIN: isISIN.default,
  isISBN: isISBN.default,
  isISSN: isISSN.default,
  isTaxID: isTaxID.default,
  isMobilePhone: isMobilePhone.default,
  isEthereumAddress: isEthereumAddress.default,
  isCurrency: isCurrency.default,
  isBtcAddress: isBtcAddress.default,
  isISO8601: isISO8601.default,
  isRFC3339: isRFC3339.default,
  isISO31661Alpha2: isISO31661Alpha2.default,
  isISO31661Alpha3: isISO31661Alpha3.default,
  isBase32: isBase32.default,
  isBase58: isBase58.default,
  isBase64: isBase64.default,
  isDataURI: isDataURI.default,
  isMagnetURI: isMagnetURI.default,
  isMimeType: isMimeType.default,
  isLatLong: isLatLong.default,
  isPostalCode: isPostalCode.default,
  ltrim: ltrim.default,
  rtrim: rtrim.default,
  trim: trim.default,
  escape: escape.default,
  unescape: unescape.default,
  stripLow: stripLow.default,
  whitelist: whitelist.default,
  blacklist: blacklist.default,
  isWhitelisted: isWhitelisted.default,
  normalizeEmail: normalizeEmail.default,
  isSlug: isSlug.default,
  isStrongPassword: isStrongPassword.default,
  isVAT: isVAT.default
};

module.exports = validator;
