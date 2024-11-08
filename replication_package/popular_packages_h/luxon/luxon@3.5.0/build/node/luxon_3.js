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
const DATE_MED = { year: "numeric", month: "short", day: "numeric" };
const DATE_MED_WITH_WEEKDAY = { year: "numeric", month: "short", day: "numeric", weekday: "short" };
const DATE_FULL = { year: "numeric", month: "long", day: "numeric" };
const DATE_HUGE = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
const TIME_SIMPLE = { hour: "numeric", minute: "numeric" };
const TIME_WITH_SECONDS = { hour: "numeric", minute: "numeric", second: "numeric" };
const TIME_WITH_SHORT_OFFSET = { hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "short" };
const TIME_WITH_LONG_OFFSET = { hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "long" };
const TIME_24_SIMPLE = { hour: "numeric", minute: "numeric", hourCycle: "h23" };
const TIME_24_WITH_SECONDS = { hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" };
const TIME_24_WITH_SHORT_OFFSET = { hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23", timeZoneName: "short" };
const TIME_24_WITH_LONG_OFFSET = { hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23", timeZoneName: "long" };
const DATETIME_SHORT = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
const DATETIME_SHORT_WITH_SECONDS = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
const DATETIME_MED = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" };
const DATETIME_MED_WITH_SECONDS = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
const DATETIME_MED_WITH_WEEKDAY = { year: "numeric", month: "short", day: "numeric", weekday: "short", hour: "numeric", minute: "numeric" };
const DATETIME_FULL = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", timeZoneName: "short" };
const DATETIME_FULL_WITH_SECONDS = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "short" };
const DATETIME_HUGE = { year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "numeric", minute: "numeric", timeZoneName: "long" };
const DATETIME_HUGE_WITH_SECONDS = { year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "long" };

class Zone {
  get type() {
    throw new ZoneIsAbstractError();
  }

  get name() {
    throw new ZoneIsAbstractError();
  }

  get ianaName() {
    return this.name;
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

let singleton$1 = null;

class SystemZone extends Zone {
  static get instance() {
    if (singleton$1 === null) {
      singleton$1 = new SystemZone();
    }
    return singleton$1;
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
    if (!zone) return false;
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

let singleton = null;

class FixedOffsetZone extends Zone {
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }

  static instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  static parseSpecifier(s) {
    if (s) {
      const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) return new FixedOffsetZone(signedOffset(r[1], r[2]));
    }
    return null;
  }

  constructor(offset) {
    super();
    this.fixed = offset;
  }

  get type() {
    return "fixed";
  }

  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }

  get ianaName() {
    return this.fixed === 0 ? "Etc/UTC" : `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
  }

  offsetName() {
    return this.name;
  }

  formatOffset(ts, format) {
    return formatOffset(this.fixed, format);
  }

  get isUniversal() {
    return true;
  }

  offset() {
    return this.fixed;
  }

  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }

  get isValid() {
    return true;
  }
}

class InvalidZone extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }

  get type() {
    return "invalid";
  }

  get name() {
    return this.zoneName;
  }

  get isUniversal() {
    return false;
  }

  offsetName() {
    return null;
  }

  formatOffset() {
    return "";
  }

  offset() {
    return NaN;
  }

  equals() {
    return false;
  }

  get isValid() {
    return false;
  }
}

function normalizeZone(input, defaultZone) {
  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (typeof input === "string") {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone;
    if (lowered === "local" || lowered === "system") return SystemZone.instance;
    if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
    return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
  } else if (typeof input === "number") {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
    return input;
  } else {
    return new InvalidZone(input);
  }
}

class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.weekSettings, opts.defaultToEN);
  }

  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }

  static resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }

  static fromObject({ locale, numberingSystem, outputCalendar, weekSettings } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }

  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }
    return this.fastNumbersCached;
  }

  listingMode() {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }

  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        validateWeekSettings(alts.weekSettings) || this.weekSettings,
        alts.defaultToEN || false
      );
    }
  }

  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }

  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }

  months(length, format = false) {
    return listStuff(this, length, months, () => {
      const intl = format ? { month: length, day: "numeric" } : { month: length },
        formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths(dt => this.extract(dt, intl, "month"));
      }
      return this.monthsCache[formatStr][length];
    });
  }

  weekdays(length, format = false) {
    return listStuff(this, length, weekdays, () => {
      const intl = format ? { weekday: length, year: "numeric", month: "long", day: "numeric" } : { weekday: length },
        formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays(dt => this.extract(dt, intl, "weekday"));
      }
      return this.weekdaysCache[formatStr][length];
    });
  }

  meridiems() {
    return listStuff(this, undefined, () => meridiems, () => {
      if (!this.meridiemCache) {
        const intl = { hour: "numeric", hourCycle: "h12" };
        this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(dt => this.extract(dt, intl, "dayperiod"));
      }
      return this.meridiemCache;
    });
  }

  eras(length) {
    return listStuff(this, length, eras, () => {
      const intl = { era: length };
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(dt => this.extract(dt, intl, "era"));
      }
      return this.eraCache[length];
    });
  }

  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(),
      matching = results.find(m => m.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }

  numberFormatter(opts = {}) {
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }

  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }

  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }

  listFormatter(opts = {}) {
    return getCachedLF(this.intl, opts);
  }

  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
  }

  getWeekSettings() {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }

  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }

  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }

  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }

  equals(other) {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }

  toString() {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
}

/**
 * Additional settings and configurations.
 */
let defaultZone = "system",
  defaultLocale = null,
  defaultNumberingSystem = null,
  defaultOutputCalendar = null,
  throwOnInvalid,
  defaultWeekSettings = null;

class Settings {
  static set defaultZone(zone) {
    defaultZone = zone;
  }

  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }

  static set defaultLocale(locale) {
    defaultLocale = locale;
  }

  static get defaultLocale() {
    return defaultLocale;
  }

  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }

  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }

  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }

  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }

  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }

  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }

  static set throwOnInvalid(t) {
    throwOnInvalid = t;
  }

  static get throwOnInvalid() {
    return throwOnInvalid;
  }

  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
    resetDigitRegexCache();
  }
}

class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }

  toMessage() {
    return this.explanation ? `${this.reason}: ${this.explanation}` : this.reason;
  }
}

exports.DateTime = DateTime;
exports.Duration = Duration;
exports.FixedOffsetZone = FixedOffsetZone;
exports.IANAZone = IANAZone;
exports.Info = Info;
exports.Interval = Interval;
exports.InvalidZone = InvalidZone;
exports.Settings = Settings;
exports.SystemZone = SystemZone;
exports.VERSION = VERSION;
exports.Zone = Zone;
