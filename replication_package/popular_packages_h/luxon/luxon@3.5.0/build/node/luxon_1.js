'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Error classes for handling various date-time exceptions
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

// Constants for date and time formatting
const n = "numeric", s = "short", l = "long";
const DATE_SHORT = { year: n, month: n, day: n };
const DATE_MED = { year: n, month: s, day: n };
const DATE_MED_WITH_WEEKDAY = { year: n, month: s, day: n, weekday: s };
// ... More format constants

// Abstract Zone class and concrete subclasses
class Zone {
  get type() {
    throw new ZoneIsAbstractError();
  }
  get name() {
    throw new ZoneIsAbstractError();
  }
  get isUniversal() {
    throw new ZoneIsAbstractError();
  }
  offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  offset(ts) {
    throw new ZoneIsAbstractError();
  }
  equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  get isValid() {
    throw new ZoneIsAbstractError();
  }
}

let singletonSystemZone = null;
class SystemZone extends Zone {
  static get instance() {
    if (singletonSystemZone === null) {
      singletonSystemZone = new SystemZone();
    }
    return singletonSystemZone;
  }
  get type() {
    return "system";
  }
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  get isUniversal() {
    return false;
  }
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale);
  }
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  equals(otherZone) {
    return otherZone.type === "system";
  }
  get isValid() {
    return true;
  }
}

let dtfCache = {};
function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short"
    });
  }
  return dtfCache[zone];
}
const typeToPos = { year: 0, month: 1, day: 2, era: 3, hour: 4, minute: 5, second: 6 };

function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
    parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];
    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

let ianaZoneCache = {};
class IANAZone extends Zone {
  static create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }
  static resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }
  static isValidZone(zone) {
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }
  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = IANAZone.isValidZone(name);
  }
  get type() {
    return "iana";
  }
  get name() {
    return this.zoneName;
  }
  get isUniversal() {
    return false;
  }
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  offset(ts) {
    const date = new Date(ts);
    if (isNaN(date)) return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    if (adOrBc === "BC") year = -Math.abs(year) + 1;
    const adjustedHour = hour === 24 ? 0 : hour;
    const asUTC = objToLocalTS({ year, month, day, hour: adjustedHour, minute, second, millisecond: 0 });
    let asTS = +date;
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  get isValid() {
    return this.valid;
  }
}

class Locale {
  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }
  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.specifiedLocale = specifiedLocale;
  }
}

let defaultWeekSettings = null;
class Settings {
  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }
  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }
}

class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }
  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
}

function isUndefined(o) {
  return typeof o === "undefined";
}

function toISODate(o, extended) {
  const longFormat = o.c.year > 9999 || o.c.year < 0;
  let c = "";
  if (longFormat && o.c.year >= 0) c += "+";
  c += padStart(o.c.year, longFormat ? 6 : 4);
  if (extended) {
    c += "-";
    c += padStart(o.c.month);
    c += "-";
    c += padStart(o.c.day);
  } else {
    c += padStart(o.c.month);
    c += padStart(o.c.day);
  }
  return c;
}

exports.VERSION = "3.5.0";
