'use strict';

// Export format
Object.defineProperty(exports, '__esModule', { value: true });

class LuxonError extends Error {}

// Custom errors for invalid operations
class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

class ConflictingSpecificationError extends LuxonError {}

class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

class InvalidArgumentError extends LuxonError {}

class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}

// Format constants used in localisation of dates and times
const n = "numeric", s = "short", l = "long";
const DATE_SHORT = { year: n, month: n, day: n };
const DATE_MED = { year: n, month: s, day: n };
const DATE_MED_WITH_WEEKDAY = { year: n, month: s, day: n, weekday: s };
const DATE_FULL = { year: n, month: l, day: n };
const DATE_HUGE = { year: n, month: l, day: n, weekday: l };
const TIME_SIMPLE = { hour: n, minute: n };
const TIME_WITH_SECONDS = { hour: n, minute: n, second: n };
const TIME_WITH_SHORT_OFFSET = { hour: n, minute: n, second: n, timeZoneName: s };
const TIME_WITH_LONG_OFFSET = { hour: n, minute: n, second: n, timeZoneName: l };
const TIME_24_SIMPLE = { hour: n, minute: n, hour12: false };
const TIME_24_WITH_SECONDS = { hour: n, minute: n, second: n, hour12: false };
const TIME_24_WITH_SHORT_OFFSET = { hour: n, minute: n, second: n, hour12: false, timeZoneName: s };
const TIME_24_WITH_LONG_OFFSET = { hour: n, minute: n, second: n, hour12: false, timeZoneName: l };
const DATETIME_SHORT = { year: n, month: n, day: n, hour: n, minute: n };
const DATETIME_SHORT_WITH_SECONDS = { year: n, month: n, day: n, hour: n, minute: n, second: n };
const DATETIME_MED = { year: n, month: s, day: n, hour: n, minute: n };
const DATETIME_MED_WITH_SECONDS = { year: n, month: s, day: n, hour: n, minute: n, second: n };
const DATETIME_MED_WITH_WEEKDAY = { year: n, month: s, day: n, weekday: s, hour: n, minute: n };
const DATETIME_FULL = { year: n, month: l, day: n, hour: n, minute: n, timeZoneName: s };
const DATETIME_FULL_WITH_SECONDS = { year: n, month: l, day: n, hour: n, minute: n, second: n, timeZoneName: s };
const DATETIME_HUGE = { year: n, month: l, day: n, weekday: l, hour: n, minute: n, timeZoneName: l };
const DATETIME_HUGE_WITH_SECONDS = { year: n, month: l, day: n, weekday: l, hour: n, minute: n, second: n, timeZoneName: l };

// Utility functions for type checking and other basic operations
function isUndefined(o) { return typeof o === "undefined"; }
function isNumber(o) { return typeof o === "number"; }
function isInteger(o) { return typeof o === "number" && o % 1 === 0; }
function isString(o) { return typeof o === "string"; }

// Intl support check
function hasIntl() { try { return typeof Intl !== "undefined" && Intl.DateTimeFormat; } catch (e) { return false; } }
function hasFormatToParts() { return !isUndefined(Intl.DateTimeFormat.prototype.formatToParts); }
function hasRelative() { try { return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat; } catch (e) { return false; } }

// Classes for handling zones
class Zone { /* Zone interface methods like type, name, offsetName, etc. */ }
class LocalZone extends Zone { /* Implementation specifics */ }
class IANAZone extends Zone { /* Implementation specifics */ }
class FixedOffsetZone extends Zone { /* Implementation specifics */ }
class InvalidZone extends Zone { /* Implementation specifics */ }

// Classes for Duration handling
class Duration { /* Class specifics about handling Durations */ }
class Interval { /* Class specifics about handling Intervals */ }

// Utility classes for Locale and Settings
class Settings { /* Static getters and setters for overall Luxon behavior */ }
class Formatter { /* Class specifics for formatting dates and times */ }
class Locale { /* Class specifics about handling locales */ }

// Main DateTime class for handling various date-time related operations
class DateTime {
  static fromISO(text, opts) { /* Implementation specifics for creating from ISO */ }
  static fromRFC2822(text, opts) { /* Implementation specifics for creating from RFC2822 */ }
  static fromHTTP(text, opts) { /* Implementation specifics for creating from HTTP header date */ }
  static fromSQL(text, opts) { /* Implementation specifics for creating DateTime from SQL */ }
  
  constructor(config) { /* Basic constructor for DateTime */ }

  // Other date-time methods like plus, minus, diff, startOf, endOf, toFormat, etc.
  static isDateTime(o) { return o && o.isLuxonDateTime || false; }
}

exports.DateTime = DateTime;
exports.Duration = Duration;
exports.Interval = Interval;
exports.Settings = Settings;
