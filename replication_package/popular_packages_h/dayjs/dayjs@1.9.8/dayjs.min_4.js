(function (global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    global.dayjs = factory();
  }
}(this, function () {
  'use strict';

  const UNITS = {
    millisecond: "millisecond",
    second: "second",
    minute: "minute",
    hour: "hour",
    day: "day",
    week: "week",
    month: "month",
    quarter: "quarter",
    year: "year",
    date: "date"
  };

  const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/;
  const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

  const DEFAULT_LOCALE = {
    name: "en",
    weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
  };

  const padStart = (input, length, fill) => {
    const str = String(input);
    return str.length >= length ? str : new Array(length - str.length + 1).join(fill) + input;
  };

  const utils = {
    padStart,
    timezoneOffset: (input) => {
      const offset = -input.utcOffset();
      const absOffset = Math.abs(offset);
      return (offset <= 0 ? "+" : "-") + padStart(Math.floor(absOffset / 60), 2, "0") + ":" + padStart(absOffset % 60, 2, "0");
    },
    monthsDiff: (start, end) => {
      if (start.date() < end.date()) return -utils.monthsDiff(end, start);
      const diffInMonths = 12 * (end.year() - start.year()) + (end.month() - start.month());
      const adjustedDiff = start.clone().add(diffInMonths, UNITS.month);
      const increment = end - adjustedDiff < 0 ? -1 : 1;
      const test = start.clone().add(diffInMonths + increment, UNITS.month);
      return -(diffInMonths + (end - adjustedDiff) / (end < adjustedDiff ? adjustedDiff - test : test - adjustedDiff)) || 0;
    },
    absFloor: (number) => Math.floor(Math.abs(number)),
    parseDateArgument: (argument) => {
      const mapping = {
        M: UNITS.month,
        y: UNITS.year,
        w: UNITS.week,
        d: UNITS.day,
        D: UNITS.date,
        h: UNITS.hour,
        m: UNITS.minute,
        s: UNITS.second,
        ms: UNITS.millisecond,
        Q: UNITS.quarter
      };
      return mapping[argument] || String(argument || "").toLowerCase().replace(/s$/, "");
    },
    isUndefined: (input) => typeof input === "undefined"
  };

  const defaultLocaleName = "en";
  const locales = { [defaultLocaleName]: DEFAULT_LOCALE };

  class Dayjs {
    constructor(config) {
      this.$L = setLocale(config.locale, null, true);
      this.parse(config);
    }

    parse(config) {
      this.$d = parseDate(config);
      this.$x = config.x || {};
      this.init();
    }

    init() {
      this.$y = this.$d.getFullYear();
      this.$M = this.$d.getMonth();
      this.$D = this.$d.getDate();
      this.$W = this.$d.getDay();
      this.$H = this.$d.getHours();
      this.$m = this.$d.getMinutes();
      this.$s = this.$d.getSeconds();
      this.$ms = this.$d.getMilliseconds();
    }

    $utils() {
      return utils;
    }

    isValid() {
      return this.$d.toString() !== "Invalid Date";
    }

    isSame(date, unit) {
      const other = parseDateInstance(date);
      return this.startOf(unit) <= other && other <= this.endOf(unit);
    }

    isAfter(date, unit) {
      return parseDateInstance(date) < this.startOf(unit);
    }

    isBefore(date, unit) {
      return this.endOf(unit) < parseDateInstance(date);
    }

    $g(value, key, unit) {
      return utils.isUndefined(value) ? this[key] : this.set(unit, value);
    }

    unix() {
      return Math.floor(this.valueOf() / 1000);
    }

    valueOf() {
      return this.$d.getTime();
    }

    startOf(unit, isStartOf = true) {
      const currentDate = this.$d;
      const dateSetter = `set${this.$u ? "UTC" : ""}Date`;
      const methods = {
        [UNITS.year]: () => this.startYear(isStartOf),
        [UNITS.month]: () => this.startMonth(isStartOf),
        [UNITS.week]: () => this.startWeek(isStartOf),
        [UNITS.day]: () => this.startDay(isStartOf),
        [UNITS.date]: () => this.clone().[dateSetter](isStartOf ? 1 : currentDate.getDate()),
        [UNITS.hour]: () => this.clone().setMinute(isStartOf ? 0 : 59).setSecond(isStartOf ? 0 : 59).setMillisecond(isStartOf ? 0 : 999),
        [UNITS.minute]: () => this.clone().setSecond(isStartOf ? 0 : 59).setMillisecond(isStartOf ? 0 : 999),
        [UNITS.second]: () => this.clone().setMillisecond(isStartOf ? 0 : 999),
        [UNITS.millisecond]: () => this.clone()
      };
      return methods[unit]();
    }

    endOf(unit) {
      return this.startOf(unit, false);
    }

    $set(unit, value) {
      const ucUnit = utils.parseDateArgument(unit);
      const method = `set${this.$u ? "UTC" : ""}`;
      const methods = {
        [UNITS.date]: `${method}Date`,
        [UNITS.month]: `${method}Month`,
        [UNITS.year]: `${method}FullYear`,
        [UNITS.hour]: `${method}Hours`,
        [UNITS.minute]: `${method}Minutes`,
        [UNITS.second]: `${method}Seconds`,
        [UNITS.millisecond]: `${method}Milliseconds`
      };
      if (ucUnit === UNITS.month || ucUnit === UNITS.year) {
        const date = this.clone().[methods.date](1);
        date.$d[methods[ucUnit]](value);
        date.init();
        this.$d = date;
        this.$d[methods.date](Math.min(this.$D, date.daysInMonth()));
      } else {
        this.$d[methods[ucUnit]](value);
      }
      this.init();
      return this;
    }

    set(unit, value) {
      return this.clone().$set(unit, value);
    }

    get(unit) {
      const parsedUnit = utils.parseDateArgument(unit);
      return this.$g(null, parsedUnit, parsedUnit)();
    }

    add(number, unit) {
      // Conversion takes care of accounting for larger units
      number = Number(number);
      const unitFunc = utils.parseDateArgument(unit);
      const adjust = {
        [UNITS.month]: () => this.set(UNITS.month, this.$M + number),
        [UNITS.year]: () => this.set(UNITS.year, this.$y + number),
        [UNITS.day]: () => days(1),
        [UNITS.week]: () => days(7)
      };
      const steps = {
        [UNITS.minute]: 60000,
        [UNITS.hour]: 3600000,
        [UNITS.second]: 1000
      };
      const step = steps[unitFunc] || 1;
      return DateWrapper(this.$d.getTime() + number * step);
    }

    subtract(number, unit) {
      return this.add(-number, unit);
    }

    format(formatStr = 'YYYY-MM-DDTHH:mm:ssZ') {
      if (!this.isValid()) return "Invalid Date";
      
      const units = {
        YY: String(this.$y).slice(-2),
        YYYY: this.$y,
        M: this.$M + 1,
        MM: utils.padStart(this.$M + 1, 2, '0'),
        MMM: this.$locale().monthsShort[this.$M] || this.$locale().months[this.$M].substring(0, 3),
        MMMM: this.$locale().months[this.$M],
        D: this.$D,
        DD: utils.padStart(this.$D, 2, '0'),
        d: String(this.$W),
        dd: this.$locale().weekdaysMin[this.$W] || this.$locale().weekdays[this.$W].substring(0, 2),
        ddd: this.$locale().weekdaysShort[this.$W] || this.$locale().weekdays[this.$W].substring(0, 3),
        dddd: this.$locale().weekdays[this.$W],
        H: String(this.$H),
        HH: utils.padStart(this.$H, 2, "0"),
        h: String(this.$H % 12 || 12),
        hh: utils.padStart(this.$H % 12 || 12, 2, "0"),
        a: this.$locale().meridiem(this.$H, this.$m, true),
        A: this.$locale().meridiem(this.$H, this.$m, false),
        m: String(this.$m),
        mm: utils.padStart(this.$m, 2, "0"),
        s: String(this.$s),
        ss: utils.padStart(this.$s, 2, "0"),
        SSS: utils.padStart(this.$ms, 3, "0"),
        Z: utils.timezoneOffset(this)
      };

      return Object.keys(units).reduce((str, key) => str.replace(new RegExp(key, 'g'), units[key]), formatStr);
    }

    utcOffset() {
      return -this.$d.getTimezoneOffset();
    }

    diff(input, units, precise) {
      const target = parseDateInstance(input);
      const diff = this - target;
      const dividers = {
        [UNITS.year]: () => utils.monthsDiff(this, target) / 12,
        [UNITS.month]: () => utils.monthsDiff(this, target),
        [UNITS.quarter]: () => utils.monthsDiff(this, target) / 3,
        [UNITS.week]: () => diff / 604800000,
        [UNITS.day]: () => diff / 86400000,
        [UNITS.hour]: () => diff / 3600000,
        [UNITS.minute]: () => diff / 60000,
        [UNITS.second]: () => diff / 1000,
        [UNITS.millisecond]: () => diff
      };
      const unitDiff = dividers[units] || dividers[UNITS.millisecond];
      return precise ? unitDiff : utils.absFloor(unitDiff);
    }

    daysInMonth() {
      return this.endOf(UNITS.month).$D;
    }

    $locale() {
      return locales[this.$L];
    }

    locale(locale, customData) {
      if (!locale) return this.$L;
      const newLocale = setLocale(locale, customData, true);
      if (newLocale) this.$L = newLocale;
      return this;
    }

    clone() {
      return new DayWrapper(this.$d);
    }

    toDate() {
      return new Date(this.valueOf());
    }

    toJSON() {
      return this.isValid() ? this.toISOString() : null;
    }

    toISOString() {
      return this.$d.toISOString();
    }

    toString() {
      return this.$d.toUTCString();
    }
  }

  const parseDate = ({ date, utc }) => {
    if (date === null) return new Date(NaN);
    if (utils.isUndefined(date)) return new Date();
    if (date instanceof Date) return new Date(date);
    if (typeof date === "string" && !/Z$/i.test(date)) {
      const matches = date.match(REGEX_PARSE);
      if (matches) {
        const [, year, month = 1, day = 1, hour, minute, second, millisecond] = matches;
        const monthIndex = month - 1;
        const ms = (millisecond || "0").substr(0, 3);
        return utc
          ? new Date(Date.UTC(year, monthIndex, day, hour || 0, minute || 0, second || 0, ms))
          : new Date(year, monthIndex, day, hour || 0, minute || 0, second || 0, ms);
      }
    }
    return new Date(date);
  };

  const parseDateInstance = (date, options = {}) => {
    const input = date instanceof DayWrapper ? date.clone() : new DayWrapper(date);
    return options.hasOwnProperty(UNITS.date) || Object.keys(date).every(k => k in UNITS)
      ? input.set(options, true)
      : input;
  };

  const setLocale = (localeKey, custom, reset = false) => {
    let localeData;
    if (!localeKey) return defaultLocaleName;
    if (typeof localeKey === "string") {
      localeData = locales[localeKey];
      if (reset && localeData) return localeKey;
      return (localeData = locales[localeKey] = custom || {});
    }
    localeData = localeKey.name;
    locales[localeData] = localeKey;
    if (reset) return localeData;
  };

  const DateWrapper = function (date) {
    return new Dayjs({ date });
  };

  const dayjs = function (date, options) {
    return new DayWrapper(options ? Object.assign({ date }, options) : date);
  };

  // Static Methods
  dayjs.extend = function (plugin, option) {
    if (!plugin.$i) {
      plugin(option, Dayjs, dayjs);
      plugin.$i = true;
    }
    return dayjs;
  };

  dayjs.locale = setLocale;
  dayjs.isDayjs = (input) => input instanceof Dayjs;
  dayjs.unix = (timestamp) => new DayWrapper(timestamp * 1000);
  dayjs.en = locales[defaultLocaleName];
  dayjs.Ls = locales;
  dayjs.p = {};

  // Prototype Methods Aliasing
  [["$ms", UNITS.millisecond], ["$s", UNITS.second], ["$m", UNITS.minute], ["$H", UNITS.hour], ["$W", UNITS.day], ["$D", UNITS.date], ["$y", UNITS.year], ["$M", UNITS.month]].forEach(([altName, name]) => {
    Dayjs.prototype[name] = function (value) {
      return this.$g(value, altName, name);
    };
  });

  return dayjs;
}));
