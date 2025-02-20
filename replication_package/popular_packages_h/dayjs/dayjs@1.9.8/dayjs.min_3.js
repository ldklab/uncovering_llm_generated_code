(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(); // Node.js or CommonJS environment
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // AMD environment
  } else {
    global.dayjs = factory(); // Browser global environment
  }
}(this, function () {
  'use strict';

  // Constants for time units
  const MILLISECOND = 'millisecond', SECOND = 'second', MINUTE = 'minute', HOUR = 'hour', 
        DAY = 'day', WEEK = 'week', MONTH = 'month', QUARTER = 'quarter', 
        YEAR = 'year', DATE = 'date';

  // Regex patterns for parsing and formatting dates
  const parseDatePattern = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,
        formatPattern = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

  // Default English locale data
  const enLocale = {
    name: "en",
    weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
  };

  // Utility function to pad strings
  const padStart = (str, length, pad) => {
    str = String(str);
    return str.length >= length ? str : Array(length + 1 - str.length).join(pad) + str;
  };

  // Utility functions
  const utils = {
    pad: padStart,
    timezoneOffset: function (offset) {
      const absOffset = Math.abs(offset),
            hours = Math.floor(absOffset / 60),
            minutes = absOffset % 60;
      return (offset <= 0 ? '+' : '-') + padStart(hours, 2, '0') + ':' + padStart(minutes, 2, '0');
    },
    calcMonthDiff: function (a, b) {
      if (a.date() < b.date()) return -utils.calcMonthDiff(b, a);
      const diff = 12 * (b.year() - a.year()) + (b.month() - a.month());
      const dayAfterPrevMonth = a.clone().add(diff, MONTH);
      const result = b - dayAfterPrevMonth < 0;
      const endOfMonth = a.clone().add(diff + (result ? -1 : 1), MONTH);
      return -(diff + (b - dayAfterPrevMonth) / (result ? dayAfterPrevMonth - endOfMonth : endOfMonth - dayAfterPrevMonth)) || 0;
    },
    absFloor: function (n) {
      return n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
    },
    normalizeUnit: function (unit) {
      return {
        M: MONTH, y: YEAR, w: WEEK, d: DAY, D: DATE, 
        h: HOUR, m: MINUTE, s: SECOND, ms: MILLISECOND, Q: QUARTER
      }[unit] || String(unit || '').toLowerCase().replace(/s$/, '');
    },
    isUndefined: function (val) {
      return val === undefined;
    }
  };

  // Default locale and locale management
  let defaultLocale = 'en';
  const locales = {};
  locales[defaultLocale] = enLocale;

  const isDayjsInstance = (object) => object instanceof Dayjs;

  const getLocale = function (key, definition, setDefault) {
    let localeName;
    if (!key) return defaultLocale;
    if (typeof key === 'string') {
      locales[key] && (localeName = key);
      definition && (locales[key] = definition, localeName = key);
    } else {
      const { name } = key;
      locales[name] = key;
      localeName = name;
    }
    if (!setDefault && localeName) defaultLocale = localeName;
    return localeName || (!setDefault && defaultLocale);
  };

  const createDayjsInstance = function (date, options) {
    if (isDayjsInstance(date)) return date.clone();
    const config = typeof options === 'object' ? options : {};
    config.date = date;
    config.args = arguments;
    return new Dayjs(config);
  };

  // Extendable utilities
  const globalUtils = { 
    format: padStart,
    getLocale: getLocale,
    isDayjsInstance: isDayjsInstance,
    createDayjsInstance: createDayjsInstance
  };

  // Dayjs class
  class Dayjs {
    constructor(config) {
      this.$L = getLocale(config.locale, null, true);
      this.parse(config);
    }

    parse(config) {
      // Parsing logic
      this.$d = this.createDate(config.date, config.utc);
      this.$x = config.x || {};
      this.init();
    }

    createDate(date, isUTC) {
      if (date === null) return new Date(NaN);
      if (utils.isUndefined(date)) return new Date();
      if (date instanceof Date) return new Date(date);
      if (typeof date === 'string' && !/Z$/i.test(date)) {
        const match = date.match(parseDatePattern);
        if (match) {
          const month = match[2] - 1 || 0;
          const millisecond = (match[7] || '0').substring(0, 3);
          return isUTC ? new Date(Date.UTC(match[1], month, match[3] || 1, match[4] || 0, match[5] || 0, match[6] || 0, millisecond)) : 
                         new Date(match[1], month, match[3] || 1, match[4] || 0, match[5] || 0, match[6] || 0, millisecond);
        }
      }
      return new Date(date);
    }

    init() {
      // Initialization logic
      const d = this.$d;
      this.$y = d.getFullYear();
      this.$M = d.getMonth();
      this.$D = d.getDate();
      this.$W = d.getDay();
      this.$H = d.getHours();
      this.$m = d.getMinutes();
      this.$s = d.getSeconds();
      this.$ms = d.getMilliseconds();
    }

    $utils() {
      return globalUtils;
    }

    isValid() {
      return this.$d.toString() !== "Invalid Date";
    }

    // Comparison Methods

    isSame(that, units) {
      const other = createDayjsInstance(that);
      return this.startOf(units) <= other && other <= this.endOf(units);
    }

    isAfter(that, units) {
      return createDayjsInstance(that) < this.startOf(units);
    }

    isBefore(that, units) {
      return this.endOf(units) < createDayjsInstance(that);
    }

    // Getter and Setter Methods

    $g(value, getterString, unit) {
      return utils.isUndefined(value) ? this[getterString] : this.set(unit, value);
    }

    unix() {
      return Math.floor(this.valueOf() / 1000);
    }

    valueOf() {
      return this.$d.getTime();
    }

    // Start and End of Time Units

    startOf(units, isStart) {
      const that = this;
      isStart = utils.isUndefined(isStart) ? true : isStart;
      const unit = utils.normalizeUnit(units);
      const Raw = (type, index) => isStart ? begin(this.$y, type, index) : end(this.$y, type, index);
      const begin = (year, type, val) => createDayjsInstance(that.$u ? Date.UTC(year, type, val) : new Date(year, type, val), that);
      const end = (a, type, val) => utils.createDayjsInstance(that.toDate()[a].apply(that.toDate("s"), isStart ? [0, 0, 0, 0] : [23, 59, 59, 999].slice(val)), that);
      switch (unit) {
        case YEAR: return Raw(1, 0);
        case MONTH: return Raw(1, this.$M);
        case WEEK: {
          const startOfWeek = this.$locale().weekStart || 0;
          return Raw(isStart ? this.$D - (this.$W < startOfWeek ? this.$W + 7 : this.$W) - startOfWeek : this.$D - (6 - (this.$W < startOfWeek ? this.$W + 7 : this.$W) - startOfWeek), this.$M);
        }
        case DAY: case DATE: return end("set" + (this.$u ? "UTC" : "") + "Hours", 0);
        case HOUR: return end("set" + (this.$u ? "UTC" : "") + "Minutes", 1);
        case MINUTE: return end("set" + (this.$u ? "UTC" : "") + "Seconds", 2);
        case SECOND: return end("set" + (this.$u ? "UTC" : "") + "Milliseconds", 3);
        default: return this.clone();
      }
    }

    endOf(units) {
      return this.startOf(units, false);
    }

    // Add and Subtract

    $set(units, value) {
      const unit = utils.normalizeUnit(units);
      const method = "set" + (this.$u ? "UTC" : "");
      const dateSetter = {
        [DAY]: "Date", [DATE]: "Date", [MONTH]: "Month", [YEAR]: "FullYear", 
        [HOUR]: "Hours", [MINUTE]: "Minutes", [SECOND]: "Seconds", [MILLISECOND]: "Milliseconds"
      };
      const action = dateSetter[unit] || unit;
      const computedValue = unit === DAY ? this.$D + (value - this.$W) : value;
      if (unit === MONTH || unit === YEAR) {
        const clone = this.clone().set(DATE, 1);
        clone.$d[action](computedValue);
        clone.init();
        this.$d = clone.set(DATE, Math.min(this.$D, clone.daysInMonth())).$d;
      } else if (action) {
        this.$d[action](computedValue);
      }
      return this.init(), this;
    }

    set(units, value) {
      return this.clone().$set(units, value);
    }

    get(units) {
      return this[utils.normalizeUnit(units)]();
    }

    add(value, units) {
      value = Number(value);
      const unit = utils.normalizeUnit(units);
      const time = {
        [MINUTE]: 60000, [HOUR]: 3600000, [SECOND]: 1000
      }[unit] || 1;
      const newValue = this.$d.getTime() + value * time;
      return globalUtils.createDayjsInstance(newValue, this);
    }

    subtract(value, units) {
      return this.add(-1 * value, units);
    }

    // Formatting

    format(formatStr) {
      const serverDate = this;
      if (!this.isValid()) return "Invalid Date";
      const template = formatStr || "YYYY-MM-DDTHH:mm:ssZ";
      const timezoneOffset = globalUtils.timezoneOffset(this);
      const locale = this.$locale();
      const hours = this.$H, minutes = this.$m;
      const month = this.$M, weekdays = locale.weekdays;
      const formatToken = (str, idx) => formatDate(serverDate, template, idx, str);
      const formatDate = (master, templ, localeIdx, str) => templ && (templ[localeIdx] || templ(master, str)) || weekdays[localeIdx].substr(0, str.length);
      const meridiem = locale.meridiem || function (hour, minute, isLower) {
        const m = hour < 12 ? 'AM' : 'PM';
        return isLower ? m.toLowerCase() : m;
      };
      const formattedTokens = {
        YY: String(this.$y).slice(-2),
        YYYY: this.$y,
        M: month + 1, MM: padStart(month + 1, 2, '0'),
        D: this.$D, DD: padStart(this.$D, 2, '0'),
        d: String(this.$W),
        dd: formatToken(locale.weekdaysMin, 2),
        ddd: formatToken(locale.weekdaysShort, 3),
        dddd: weekdays[this.$W],
        H: String(hours),
        HH: padStart(hours, 2, '0'),
        h: formatToken(padStart(hours % 12 || 12, 1, '0'), 1),
        hh: formatToken(padStart(hours % 12 || 12, 2, '0'), 2),
        a: meridiem(hours, minutes, true),
        A: meridiem(hours, minutes, false),
        m: String(minutes),
        mm: padStart(minutes, 2, '0'),
        s: String(this.$s),
        ss: padStart(this.$s, 2, '0'),
        SSS: padStart(this.$ms, 3, '0'),
        Z: timezoneOffset
      };
      return template.replace(formatPattern, (match, escapedFormat) => escapedFormat || (formattedTokens[match] || timezoneOffset.replace(":", "")));
    }

    // Timezone

    utcOffset() {
      return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
    }

    // Date Difference

    diff(that, units, float) {
      const unit = utils.normalizeUnit(units);
      const comparison = createDayjsInstance(that);
      const timezoneOffsetDifference = 60000 * (comparison.utcOffset() - this.utcOffset());
      const millisecondsDifference = this - comparison;
      const monthDiff = utils.calcMonthDiff(this, comparison);
      const calculation = {
        [YEAR]: monthDiff / 12,
        [MONTH]: monthDiff,
        [QUARTER]: monthDiff / 3,
        [WEEK]: (millisecondsDifference - timezoneOffsetDifference) / 604800000,
        [DAY]: (millisecondsDifference - timezoneOffsetDifference) / 86400000,
        [HOUR]: millisecondsDifference / 3600000,
        [MINUTE]: millisecondsDifference / 60000,
        [SECOND]: millisecondsDifference / 1000
      }[unit] || millisecondsDifference;

      return float ? calculation : utils.absFloor(calculation);
    }

    daysInMonth() {
      return this.endOf(MONTH).$D;
    }

    // Locale

    $locale() {
      return locales[this.$L];
    }

    locale(key, definition) {
      if (!key) return this.$L;
      const newLocale = this.clone();
      const localeName = getLocale(key, definition, true);
      if (localeName) newLocale.$L = localeName;
      return newLocale;
    }

    // Cloning and Conversion

    clone() {
      return globalUtils.createDayjsInstance(this.$d, this);
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

  // Map time component methods
  [["$ms", MILLISECOND], ["$s", SECOND], ["$m", MINUTE], ["$H", HOUR], 
   ["$W", DAY], ["$M", MONTH], ["$y", YEAR], ["$D", DATE]]
   .forEach((m) => {
     Dayjs.prototype[m[1]] = function (value) {
       return this.$g(value, m[0], m[1]);
     };
   });

  // Extend method
  createDayjsInstance.extend = function (plugin, option) {
    if (!plugin.$i) {
      plugin(option, Dayjs, createDayjsInstance);
      plugin.$i = true;
    }
    return createDayjsInstance;
  };

  // Locale function
  createDayjsInstance.locale = getLocale;

  // Dayjs instance check
  createDayjsInstance.isDayjsInstance = isDayjsInstance;

  // Unix timestamp
  createDayjsInstance.unix = function (timestamp) {
    return createDayjsInstance(1000 * timestamp);
  };

  // Default English locale
  createDayjsInstance.en = locales[defaultLocale];

  // Locales collection
  createDayjsInstance.locales = locales;

  // Placeholder for plugins
  createDayjsInstance.plugins = {};

  return createDayjsInstance;

}));
