(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self).dayjs = factory();
  }
})(this, function () {
  'use strict';

  const MS_IN_SECOND = 1000;
  const MS_IN_MINUTE = 60 * MS_IN_SECOND;
  const MS_IN_HOUR = 60 * MS_IN_MINUTE;
  const MILLISECOND = "millisecond", SECOND = "second", MINUTE = "minute", HOUR = "hour";
  const DAY = "day", WEEK = "week", MONTH = "month", QUARTER = "quarter", YEAR = "year";
  const DATE = "date", INVALID_DATE = "Invalid Date";

  const ISO_DATE_REGEX = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
  const FORMAT_TOKENS_REGEX = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
  
  const defaultLocale = {
    name: "en",
    weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    ordinal: function (number) {
      const suffixes = ["th", "st", "nd", "rd"];
      const value = number % 100;
      return `[${number}${suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]}]`;
    }
  };

  const utilities = {
    pad: function (number, length, char) {
      const str = String(number);
      return str.length >= length ? str : Array(length + 1 - str.length).join(char) + str;
    },
    timezoneOffset: function (date) {
      const offset = -date.utcOffset();
      const absOffset = Math.abs(offset);
      const hours = Math.floor(absOffset / 60);
      const minutes = absOffset % 60;
      return (offset <= 0 ? "+" : "-") + utilities.pad(hours, 2, "0") + ":" + utilities.pad(minutes, 2, "0");
    },
    monthDiff: function (a, b) {
      if (a.date() < b.date()) return -utilities.monthDiff(b, a);
      const diffMonths = 12 * (b.year() - a.year()) + (b.month() - a.month());
      const adjustedMonth = a.clone().add(diffMonths, MONTH);
      const isOverflow = b - adjustedMonth < 0;
      const endMonth = 12 * (b.year() - adjustedMonth.year()) + (b.month() - adjustedMonth.month());
      const tempMonth = a.clone().add(endMonth + (isOverflow ? -1 : 1), MONTH);
      return -(diffMonths + (b - adjustedMonth) / (isOverflow ? adjustedMonth - tempMonth : tempMonth - adjustedMonth)) || 0;
    },
    absFloor: function (number) {
      return number < 0 ? Math.ceil(number) || 0 : Math.floor(number);
    },
    parsePeriod: function (period) {
      return { M: MONTH, y: YEAR, w: WEEK, d: DAY, D: DATE, h: HOUR, m: MINUTE, s: SECOND, ms: MILLISECOND, Q: QUARTER }[period] || String(period || "").toLowerCase().replace(/s$/, "");
    },
    isUndefined: function (val) {
      return val === void 0;
    }
  };

  let globalLocale = "en";
  const locales = { en: defaultLocale };

  function isDayjsObject(instance) {
    return instance instanceof Dayjs || (!(!instance || !instance.$isDayjsObject));
  }

  function getLocale(name, customLocale, doSelect) {
    if (!name) return globalLocale;

    if (typeof name === "string") {
      const lowerName = name.toLowerCase();
      locales[lowerName] && (globalLocale = lowerName);
      customLocale && (locales[lowerName] = customLocale) && (globalLocale = lowerName);
      const splitName = name.split("-");
      if (!globalLocale && splitName.length > 1) return getLocale(splitName[0]);

    } else {
      const localeName = name.name;
      locales[localeName] = name;
      globalLocale = localeName;
    }

    return !doSelect && globalLocale;
  }

  function createDayjsInstance(date, givenLocale) {
    if (isDayjsObject(date)) return date.clone();

    const options = typeof givenLocale === 'object' ? givenLocale : {};
    options.date = date;
    options.args = arguments;
    return new Dayjs(options);
  }

  const Methods = {
    isDayjsObject: isDayjsObject,
    locale: getLocale
  };

  function Dayjs(config) {
    this.$L = getLocale(config.locale, null, true);
    this.parse(config);
    this.$x = this.$x || config.x || {};
    this.$isDayjsObject = true;
  }

  const dayjsProto = Dayjs.prototype;

  dayjsProto.parse = function (config) {
    this.$d = (function (cfg) {
      const input = cfg.date,
        useUTC = cfg.utc;

      if (input === null) return new Date(NaN);

      if (utilities.isUndefined(input)) return new Date();

      if (input instanceof Date) return new Date(input);

      if (typeof input === "string" && !/Z$/i.test(input)) {
        const parts = input.match(ISO_DATE_REGEX);
        if (parts) {
          const month = parts[2] - 1 || 0;
          const subsecond = (parts[7] || "0").substring(0, 3);
          return useUTC ?
            new Date(Date.UTC(parts[1], month, parts[3] || 1, parts[4] || 0, parts[5] || 0, parts[6] || 0, subsecond)) :
            new Date(parts[1], month, parts[3] || 1, parts[4] || 0, parts[5] || 0, parts[6] || 0, subsecond);
        }
      }
      return new Date(input);
    })(config);
    this.init();
  };

  dayjsProto.init = function () {
    const date = this.$d;
    this.$y = date.getFullYear();
    this.$M = date.getMonth();
    this.$D = date.getDate();
    this.$W = date.getDay();
    this.$H = date.getHours();
    this.$m = date.getMinutes();
    this.$s = date.getSeconds();
    this.$ms = date.getMilliseconds();
  };

  dayjsProto.$utils = function () {
    return utilities;
  };

  dayjsProto.isValid = function () {
    return !(this.$d.toString() === INVALID_DATE);
  };

  dayjsProto.isSame = function (targetDate, unit) {
    const target = createDayjsInstance(targetDate);
    return this.startOf(unit) <= target && target <= this.endOf(unit);
  };

  dayjsProto.isAfter = function (targetDate, unit) {
    return createDayjsInstance(targetDate) < this.startOf(unit);
  };

  dayjsProto.isBefore = function (targetDate, unit) {
    return this.endOf(unit) < createDayjsInstance(targetDate);
  };

  dayjsProto.$g = function (inputValue, field, unit) {
    return utilities.isUndefined(inputValue) ? this[field] : this.set(unit, inputValue);
  };

  dayjsProto.unix = function () {
    return Math.floor(this.valueOf() / 1000);
  };

  dayjsProto.valueOf = function () {
    return this.$d.getTime();
  };

  dayjsProto.startOf = function (unit, startOf) {
    const self = this;
    const isStart = !utilities.isUndefined(startOf) ? startOf : true;
    const conversionUnit = utilities.parsePeriod(unit);
    const willClone = isStart ? true : false;

    const setToZero = function (values, sliceIndices) {
      values[vMethodName + "Hours"] = 0;
      return willClone ? self.clone() : self.set(vMethodName + "Hours", 0);
    };

    const compute = function () {
      const year = self.$y;
      const month = self.$M;
      const date = willClone ? 1 : 0;
      let hour;
      return createDayjsInstance(Date.UTC(year, month, date, hour, 0, 0, 0), {
        locale: globalLocale,
        utc: true
      });
    };

    switch (conversionUnit) {
      case YEAR:
        hour = year = self.$y;
        month = date = zeroZero = date = zeroZero = 1;
        return compute();

      case MONTH:
        month = date = zeroZero = date = zeroZero = 1;
        return compute();

      case WEEK:
        const weekStart = self.$locale().weekStart || 0;
        const diff = (self.$W < weekStart ? self.$W + 7 : self.$W) - weekStart;
        const day = self.$D - diff + (6 - diff);
        return compute();

      case DAY:
      case DATE:
        return setToZero(v, 0);

      case HOUR:
        return setToZero(v, 1);

      case MINUTE:
        return setToZero(v, 2);

      case SECOND:
        return setToZero(v, 3);

      default:
        return self.clone();
    }
  };

  dayjsProto.endOf = function (unit) {
    return this.startOf(unit, false);
  };

  dayjsProto.$set = function (unit, inputValue) {
    const pUnit = utilities.parsePeriod(unit);
    const method = "set" + (this.$u ? "UTC" : "");
    const methodsMap = {
      [DAY]: method + "Date",
      [DATE]: method + "Date",
      [MONTH]: method + "Month",
      [YEAR]: method + "FullYear",
      [HOUR]: method + "Hours",
      [MINUTE]: method + "Minutes",
      [SECOND]: method + "Seconds",
      [MILLISECOND]: method + "Milliseconds"
    };

    if (methodsMap[pUnit]) {
      this.$d[methodsMap[pUnit]](inputValue);
      this.init();
      return this;
    }
  };

  dayjsProto.set = function (unit, inputValue) {
    return this.clone().$set(unit, inputValue);
  };

  dayjsProto.get = function (unit) {
    return this[utilities.parsePeriod(unit)]();
  };

  dayjsProto.add = function (amount, unit) {
    amount = Number(amount);
    const period = utilities.parsePeriod(unit);
    const periodMap = {
      [YEAR]: (val) => this.set(YEAR, this.$y + val),
      [MONTH]: (val) => this.set(MONTH, this.$M + val),
      [DAY]: (val) => createDayjsInstance(this.$d.setDate(this.$D + (val * daysInMonth[this.$M])), this.$x)
    };

    if (periodMap[period]) return periodMap[period](amount);

    const ms = { [SECOND]: MS_IN_SECOND, [MINUTE]: MS_IN_MINUTE, [HOUR]: MS_IN_HOUR }[period] || 1;
    const timestamp = this.$d.getTime() + amount * ms;
    return createDayjsInstance(timestamp, this.$x);
  };

  dayjsProto.subtract = function (amount, unit) {
    return this.add(-1 * amount, unit);
  };

  dayjsProto.format = function (formatString) {
    const self = this;
    const currentLocale = self.$locale();

    if (!self.isValid()) {
      return currentLocale.invalidDate || INVALID_DATE;
    }

    const format = formatString || "YYYY-MM-DDTHH:mm:ssZ";
    const offset = utilities.timezoneOffset(self);
    const hour = self.$H;
    const minute = self.$m;
    const month = self.$M;
    const weekdays = currentLocale.weekdays;
    const months = currentLocale.months;
    const meridiemFunc = currentLocale.meridiem;

    function meridiem(hour, minute, isLower) {
      const pm = hour < 12 ? "AM" : "PM";
      return isLower ? pm.toLowerCase() : pm;
    }

    function formatMeridiem(h, format, lower) {
      return h <= 12 ? h : meridiem(h, '', lower);
    }

    return format.replace(FORMAT_TOKENS_REGEX, function (match, escape) {
      if (escape) return escape;

      switch (match) {
        case 'YY':
          return String(self.$y).slice(-2);
        case 'YYYY':
          return utilities.pad(self.$y, 4, "0");
        case 'M':
          return month + 1;
        case 'MM':
          return utilities.pad(month + 1, 2, "0");
        case 'MMM':
          return months[month].substring(0, 3);
        case 'MMMM':
          return months[month];
        case 'D':
          return self.$D;
        case 'DD':
          return utilities.pad(self.$D, 2, "0");
        case 'd':
          return String(self.$W);
        case 'dd':
          return weekdays[self.$W].substring(0, 2);
        case 'ddd':
          return weekdays[self.$W].substring(0, 3);
        case 'dddd':
          return weekdays[self.$W];
        case 'H':
          return String(hour);
        case 'HH':
          return utilities.pad(hour, 2, "0");
        case 'h':
          return formatMeridiem(hour, '', true);
        case 'hh':
          return formatMeridiem(hour, '', false);
        case 'a':
          return meridiemFunc ? meridiemFunc(hour, minute, true) : meridiem(hour, minute, true);
        case 'A':
          return meridiemFunc ? meridiemFunc(hour, minute, false) : meridiem(hour, minute, false);
        case 'm':
          return String(minute);
        case 'mm':
          return utilities.pad(minute, 2, "0");
        case 's':
          return String(self.$s);
        case 'ss':
          return utilities.pad(self.$s, 2, "0");
        case 'SSS':
          return utilities.pad(self.$ms, 3, "0");
        case 'Z':
          return offset;
      }
      return null;
    });
  };

  dayjsProto.utcOffset = function () {
    return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
  };

  dayjsProto.diff = function (input, unit, float) {
    const currentDayjs = createDayjsInstance(input);
    const unitType = utilities.parsePeriod(unit);
    const targetDayjs = createDayjsInstance(this);
    const deltaMilliseconds = targetDayjs - currentDayjs;
    const conversionFactor = {
      [YEAR]: utilities.monthDiff(currentDayjs, targetDayjs) / 12,
      [MONTH]: utilities.monthDiff(currentDayjs, targetDayjs),
      [QUARTER]: utilities.monthDiff(currentDayjs, targetDayjs) / 3,
      [WEEK]: (deltaMilliseconds - (targetDayjs.utcOffset() - currentDayjs.utcOffset()) * MS_IN_MINUTE) / 6048e5,
      [DAY]: (deltaMilliseconds - (targetDayjs.utcOffset() - currentDayjs.utcOffset()) * MS_IN_MINUTE) / 864e5,
      [HOUR]: deltaMilliseconds / MS_IN_HOUR,
      [MINUTE]: deltaMilliseconds / MS_IN_MINUTE,
      [SECOND]: deltaMilliseconds / MS_IN_SECOND
    }[unitType] || deltaMilliseconds;

    return float ? conversionFactor : utilities.absFloor(conversionFactor);
  };

  dayjsProto.daysInMonth = function () {
    return this.endOf(MONTH).$D;
  };

  dayjsProto.$locale = function () {
    return locales[this.$L];
  };

  dayjsProto.locale = function (locale, instance) {
    const clone = this.clone();
    const newLocale = getLocale(locale, instance, true);
    if (newLocale) {
      clone.$L = newLocale;
    }
    return clone;
  };

  dayjsProto.clone = function () {
    return createDayjsInstance(this.$d, this.$x);
  };

  dayjsProto.toDate = function () {
    return new Date(this.valueOf());
  };

  dayjsProto.toJSON = function () {
    return this.isValid() ? this.toISOString() : null;
  };

  dayjsProto.toISOString = function () {
    return this.$d.toISOString();
  };

  dayjsProto.toString = function () {
    return this.$d.toUTCString();
  };

  const dayjsMethodBindings = [
    ["$ms", MILLISECOND],
    ["$s", SECOND],
    ["$m", MINUTE],
    ["$H", HOUR],
    ["$W", DAY],
    ["$M", MONTH],
    ["$y", YEAR],
    ["$D", DATE]
  ];

  dayjsMethodBindings.forEach(([field, method]) => {
    dayjsProto[method] = function (inputValue) {
      return this.$g(inputValue, field, method);
    };
  });

  Dayjs.extend = function (extension, options) {
    if (!extension.$i) {
      extension(options, Dayjs, createDayjsInstance);
      extension.$i = true;
    }
    return createDayjsInstance;
  };

  Dayjs.locale = getLocale;
  Dayjs.isDayjs = isDayjsObject;

  Dayjs.unix = function (seconds) {
    return createDayjsInstance(1000 * seconds);
  };

  Dayjs.en = locales[globalLocale];
  Dayjs.Ls = locales;
  Dayjs.p = {};

  return Dayjs;
});
