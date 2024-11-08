'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class LuxonError extends Error {}
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

const DATE_SHORT = { year: "numeric", month: "numeric", day: "numeric" };
// (other formats omitted for brevity)

const isUndefined = (o) => typeof o === "undefined";
const isNumber = (o) => typeof o === "number";
const isInteger = (o) => typeof o === "number" && o % 1 === 0;
const isString = (o) => typeof o === "string";
const isDate = (o) => Object.prototype.toString.call(o) === "[object Date]";

function hasIntl() {
  try {
    return typeof Intl !== "undefined" && Intl.DateTimeFormat;
  } catch (e) {
    return false;
  }
}

function hasFormatToParts() {
  return !isUndefined(Intl.DateTimeFormat.prototype.formatToParts);
}

function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}

class DateTime {
  static local(year, month, day, hour, minute, second, millisecond) {
    // Implementation omitted for brevity
  }
  
  static utc(year, month, day, hour, minute, second, millisecond) {
    // Implementation omitted for brevity
  }
  
  // Additional methods omitted for brevity
}

class Duration {
  static fromMillis(count, opts) {
    // Implementation omitted for brevity
  }

  static fromObject(obj) {
    // Implementation omitted for brevity
  }

  static isDuration(o) {
    return o && o.isLuxonDuration || false;
  }

  // Additional methods omitted for brevity
}

class Interval {
  static fromDateTimes(start, end) {
    // Implementation omitted for brevity
  }

  static after(start, duration) {
    // Implementation omitted for brevity
  }

  // Additional methods omitted for brevity
}

class Zone {
  // Abstract methods
  get type() {
    throw new ZoneIsAbstractError();
  }
  
  get name() {
    throw new ZoneIsAbstractError();
  }
  
  get universal() {
    throw new ZoneIsAbstractError();
  }
}

exports.DateTime = DateTime;
exports.Duration = Duration;
exports.Interval = Interval;
exports.InvalidDurationError = InvalidDurationError;
exports.InvalidDateTimeError = InvalidDateTimeError;
exports.InvalidArgumentError = InvalidArgumentError;
exports.InvalidIntervalError = InvalidIntervalError;
exports.LuxonError = LuxonError;
exports.ZoneIsAbstractError = ZoneIsAbstractError;
exports.ConflictingSpecificationError = ConflictingSpecificationError;
//# sourceMappingURL=luxon.js.map
