(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // AMD
  } else {
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self).dayjs = factory(); // Global
  }
})(this, function() {
  'use strict';

  var MILLISECOND = 1e3, MINUTE = 6e4, HOUR = 36e5;
  var msName = 'millisecond', secondName = 'second', minuteName = 'minute', hourName = 'hour';
  var dayName = 'day', weekName = 'week', monthName = 'month', quarterName = 'quarter';
  var yearName = 'year', dateName = 'date', invalidDateName = "Invalid Date";
  var regexDate = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
  var regexFormat = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

  var defaultLocale = {
    name: "en",
    weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    ordinal: function(num) {
      var suffixes = ["th", "st", "nd", "rd"];
      var n = num % 100;
      return "[" + num + (suffixes[(n - 20) % 10] || suffixes[n] || suffixes[0]) + "]";
    }
  };

  var utils = {
    s: padStart,
    z: offsetFormat,
    m: diffMonth,
    a: absFloor,
    p: parseToken,
    u: isUndefined
  };

  function padStart(string, length, pad) {
    var str = String(string);
    return !str || str.length >= length ? string : '' + Array(length + 1 - str.length).join(pad) + string;
  }

  function offsetFormat(offsetMinutes) {
    var offset = -offsetMinutes, absOffset = Math.abs(offset), hours = Math.floor(absOffset / 60), mins = absOffset % 60;
    return (offset <= 0 ? '+' : '-') + padStart(hours, 2, '0') + ':' + padStart(mins, 2, '0');
  }

  function diffMonth(from, to) {
    if (from.date() < to.date()) return -diffMonth(to, from);
    var months = 12 * (to.year() - from.year()) + (to.month() - from.month());
    var diff = from.clone().add(months, 'month') - to < 0,
        next = from.clone().add(months + (diff ? -1 : 1), 'month');
    return -(months + (to - from) / (diff ? from - next : next - from)) || 0;
  }

  function absFloor(number) {
    return number < 0 ? Math.ceil(number) || 0 : Math.floor(number);
  }

  function parseToken(unit) {
    return {
      M: monthName,
      y: yearName,
      w: weekName,
      d: dayName,
      D: dateName,
      h: hourName,
      m: minuteName,
      s: secondName,
      ms: msName,
      Q: quarterName
    }[unit] || String(unit || '').toLowerCase().replace(/s$/, '');
  }

  function isUndefined(value) {
    return value === void 0;
  }

  var currentLocaleName = 'en';
  var locales = {};
  locales[currentLocaleName] = defaultLocale;

  function isDayjsObject(input) {
    return input instanceof DayjsInstance || (!(!input || !input.isDayjsObject));
  }

  function getOrSetLocale(locale, customLocaleData, resetLocale) {
    var foundLocale;
    if (!locale) return currentLocaleName;
    if (typeof locale === 'string') {
      var lowercaseLocale = locale.toLowerCase();
      if (locales[lowercaseLocale]) {
        foundLocale = lowercaseLocale;
      }
      if (customLocaleData) {
        locales[lowercaseLocale] = customLocaleData;
        foundLocale = lowercaseLocale;
      }
      var localeParts = locale.split('-');
      if (!foundLocale && localeParts.length > 1) return getOrSetLocale(localeParts[0]);
    } else {
      locales[locale.name] = locale;
      foundLocale = locale.name;
    }
    if (!resetLocale && foundLocale) {
      currentLocaleName = foundLocale;
    }
    return foundLocale || (!resetLocale && currentLocaleName);
  }

  function createDayjsInstance(config, format, options) {
    if (isDayjsObject(config)) return config.clone();
    var settings = typeof format === 'object' ? format : {};
    settings.date = config;
    settings.args = arguments;
    return new DayjsInstance(settings);
  }

  utils.l = getOrSetLocale;
  utils.i = isDayjsObject;

  utils.w = function(date, dayjs) {
    return createDayjsInstance(date, {locale: dayjs.$L, utc: dayjs.$u, x: dayjs.$x, $offset: dayjs.$offset});
  };

  function DayjsInstance(config) {
    this.$L = getOrSetLocale(config.locale, null, true);
    this.parse(config);
    this.$x = this.$x || config.x || {};
    this.isDayjsObject = true;
  }

  var dayjsProto = DayjsInstance.prototype;

  dayjsProto.parse = function(config) {
    this.$d = parseDateInput(config);
    this.init();
  };

  function parseDateInput(config) {
    var dateInput = config.date, utc = config.utc;
    if (dateInput === null) return new Date(NaN);
    if (isUndefined(dateInput)) return new Date();
    if (dateInput instanceof Date) return new Date(dateInput);
    if (typeof dateInput === 'string' && !/Z$/i.test(dateInput)) {
      var match = dateInput.match(regexDate);
      if (match) {
        var year = match[1], month = match[2] - 1 || 0, day = match[3] || 1;
        var hour = match[4] || 0, minute = match[5] || 0, second = match[6] || 0;
        var millisecond = (match[7] || '0').substring(0, 3);
        return utc ? new Date(Date.UTC(year, month, day, hour, minute, second, millisecond))
                   : new Date(year, month, day, hour, minute, second, millisecond);
      }
    }
    return new Date(dateInput);
  }

  dayjsProto.init = function() {
    var date = this.$d;
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.date = date.getDate();
    this.weekday = date.getDay();
    this.hour = date.getHours();
    this.minute = date.getMinutes();
    this.second = date.getSeconds();
    this.millisecond = date.getMilliseconds();
  };

  dayjsProto.$utils = function() {
    return utils;
  };

  dayjsProto.isValid = function() {
    return !(this.$d.toString() === invalidDateName);
  };

  dayjsProto.isSame = function(config, unit) {
    var that = createDayjsInstance(config);
    return this.startOf(unit) <= that && that <= this.endOf(unit);
  };

  dayjsProto.isAfter = function(config, unit) {
    return createDayjsInstance(config) < this.startOf(unit);
  };

  dayjsProto.isBefore = function(config, unit) {
    return this.endOf(unit) < createDayjsInstance(config);
  };

  dayjsProto.$g = function(value, getKey, setKey) {
    return isUndefined(value) ? this[getKey] : this.set(setKey, value);
  };

  dayjsProto.unix = function() {
    return Math.floor(this.valueOf() / 1e3);
  };

  dayjsProto.valueOf = function() {
    return this.$d.getTime();
  };

  dayjsProto.startOf = function(unit, startOf) {
    var instance = this;
    var shouldStartOf = !isUndefined(startOf) ? startOf : true;
    var token = parseToken(unit);
    var dateSetter = function(year, month) {
      var dateInstance = utils.w(instance.$u ? Date.UTC(instance.year, month, year) : new Date(instance.year, month, year), instance);
      return shouldStartOf ? dateInstance : dateInstance.endOf(dayName);
    };
    var timeSetter = function(method, isMidnight) {
      return utils.w(instance.toDate()[method].apply(instance.toDate('s'), (shouldStartOf ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(isMidnight)), instance);
    };
    var weekday = this.weekday, month = this.month, day = this.date;
    var prefix = 'set' + (this.$u ? 'UTC' : '');
    switch (token) {
      case yearName: return shouldStartOf ? dateSetter(1, 0) : dateSetter(31, 11);
      case monthName: return shouldStartOf ? dateSetter(1, month) : dateSetter(0, month + 1);
      case weekName:
        var weekStart = this.$locale().weekStart || 0;
        var offset = (weekday < weekStart ? weekday + 7 : weekday) - weekStart;
        return dateSetter(shouldStartOf ? day - offset : day + (6 - offset), month);
      case dayName:
      case dateName: return timeSetter(prefix + 'Hours', 0);
      case hourName: return timeSetter(prefix + 'Minutes', 1);
      case minuteName: return timeSetter(prefix + 'Seconds', 2);
      case secondName: return timeSetter(prefix + 'Milliseconds', 3);
      default: return this.clone();
    }
  };

  dayjsProto.endOf = function(unit) {
    return this.startOf(unit, false);
  };

  dayjsProto.$set = function(unit, value) {
    var instance = this;
    var token = parseToken(unit);
    var prefix = 'set' + (this.$u ? 'UTC' : '');
    var setterMap = {
      [dayName]: prefix + 'Date',
      [dateName]: prefix + 'Date',
      [monthName]: prefix + 'Month',
      [yearName]: prefix + 'FullYear',
      [hourName]: prefix + 'Hours',
      [minuteName]: prefix + 'Minutes',
      [secondName]: prefix + 'Seconds',
      [msName]: prefix + 'Milliseconds'
    };

    var setter = setterMap[token];
    var adjustedValue = token === dayName ? this.date + (value - this.weekday) : value;
    if (token === monthName || token === yearName) {
      var newInstance = this.clone().set(dateName, 1);
      newInstance.$d[setter](adjustedValue);
      newInstance.init();
      this.$d = newInstance.set(dateName, Math.min(this.date, newInstance.daysInMonth())).$d;
    } else {
      setter && this.$d[setter](adjustedValue);
    }
    this.init();
    return this;
  };

  dayjsProto.set = function(unit, value) {
    return this.clone().$set(unit, value);
  };

  dayjsProto.get = function(unit) {
    return this[this.$utils().p(unit)]();
  };

  dayjsProto.add = function(amount, unit) {
    var instance = this;
    amount = Number(amount);
    var token = parseToken(unit);
    var dayAdjsuter = function(days) {
      var newInstance = createDayjsInstance(instance);
      return utils.w(newInstance.date(newInstance.date() + Math.round(days * amount)), instance);
    };

    var timeUnitMultipliers = {
      [minuteName]: MINUTE,
      [hourName]: HOUR,
      [secondName]: MILLISECOND
    };
    var timeMultiplier = timeUnitMultipliers[token] || 1;
    var newTime = this.$d.getTime() + amount * timeMultiplier;
    switch (token) {
      case monthName: return this.set(monthName, this.month + amount);
      case yearName: return this.set(yearName, this.year + amount);
      case dayName: return dayAdjsuter(1);
      case weekName: return dayAdjsuter(7);
      default: return utils.w(newTime, this);
    }
  };

  dayjsProto.subtract = function(amount, unit) {
    return this.add(-amount, unit);
  };

  dayjsProto.format = function(formatStr) {
    var instance = this;
    var locale = this.$locale();
    if (!this.isValid()) return locale.invalidDate || invalidDateName;
    var format = formatStr || "YYYY-MM-DDTHH:mm:ssZ";
    var zone = offsetFormat(this);
    var hour = this.$H, minute = this.$m, monthIndex = this.$M;
    var weekdays = locale.weekdays, months = locale.months, meridiem = locale.meridiem;

    var formatToken = function(getValue, value, len, sliceLen) {
      return getValue && (getValue[value] || getValue(instance, format)) || value.slice(0, sliceLen || value.length);
    };

    var hour12 = function(value) {
      return padStart((hour % 12 || 12), value, '0');
    };

    var meridiemFormat = meridiem || function(hour, minute, isLowercase) {
      var period = hour < 12 ? 'AM' : 'PM';
      return isLowercase ? period.toLowerCase() : period;
    };

    return format.replace(regexFormat, function(match, bracketContent) {
      return bracketContent || (function(token) {
        switch (token) {
          case 'YY': return String(instance.year).slice(-2);
          case 'YYYY': return padStart(instance.year, 4, '0');
          case 'M': return monthIndex + 1;
          case 'MM': return padStart(monthIndex + 1, 2, '0');
          case 'MMM': return formatToken(locale.monthsShort, monthIndex, months, 3);
          case 'MMMM': return formatToken(months, monthIndex);
          case 'D': return instance.date;
          case 'DD': return padStart(instance.date, 2, '0');
          case 'd': return String(instance.weekday);
          case 'dd': return formatToken(locale.weekdaysMin, instance.weekday, weekdays, 2);
          case 'ddd': return formatToken(locale.weekdaysShort, instance.weekday, weekdays, 3);
          case 'dddd': return weekdays[instance.weekday];
          case 'H': return String(hour);
          case 'HH': return padStart(hour, 2, '0');
          case 'h': return hour12(1);
          case 'hh': return hour12(2);
          case 'a': return meridiemFormat(hour, minute, true);
          case 'A': return meridiemFormat(hour, minute, false);
          case 'm': return String(minute);
          case 'mm': return padStart(minute, 2, '0');
          case 's': return String(instance.second);
          case 'ss': return padStart(instance.second, 2, '0');
          case 'SSS': return padStart(instance.millisecond, 3, '0');
          case 'Z': return zone;
          default: return null;
        }
      }(match)) || zone.replace(':', '');
    });
  };

  dayjsProto.utcOffset = function() {
    return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
  };

  dayjsProto.diff = function(other, unit, isFloat) {
    var result, thisInstance = this;
    var token = parseToken(unit);
    var otherInstance = createDayjsInstance(other);
    var offsetDifference = (otherInstance.utcOffset() - thisInstance.utcOffset()) * MINUTE;
    var timestampDifference = thisInstance - otherInstance;
    var monthComparison = function() {
      return utils.m(thisInstance, otherInstance);
    };

    switch (token) {
      case yearName: result = monthComparison() / 12; break;
      case monthName: result = monthComparison(); break;
      case quarterName: result = monthComparison() / 3; break;
      case weekName: result = (timestampDifference - offsetDifference) / 6048e5; break;
      case dayName: result = (timestampDifference - offsetDifference) / 864e5; break;
      case hourName: result = timestampDifference / HOUR; break;
      case minuteName: result = timestampDifference / MINUTE; break;
      case secondName: result = timestampDifference / MILLISECOND; break;
      default: result = timestampDifference;
    }
    return isFloat ? result : utils.a(result);
  };

  dayjsProto.daysInMonth = function() {
    return this.endOf(monthName).date;
  };

  dayjsProto.$locale = function() {
    return locales[this.$L];
  };

  dayjsProto.locale = function(locale, customLocaleData) {
    if (!locale) return this.$L;
    var newInstance = this.clone();
    var receivedLocale = getOrSetLocale(locale, customLocaleData, true);
    if (receivedLocale) newInstance.$L = receivedLocale;
    return newInstance;
  };

  dayjsProto.clone = function() {
    return utils.w(this.$d, this);
  };

  dayjsProto.toDate = function() {
    return new Date(this.valueOf());
  };

  dayjsProto.toJSON = function() {
    return this.isValid() ? this.toISOString() : null;
  };

  dayjsProto.toISOString = function() {
    return this.$d.toISOString();
  };

  dayjsProto.toString = function() {
    return this.$d.toUTCString();
  };

  var dayjsWrapper = createDayjsInstance;
  var dayjsProto = DayjsInstance.prototype;
  
  [
    [msName, 'millisecond'],
    [secondName, 'second'],
    [minuteName, 'minute'],
    [hourName, 'hour'],
    [dayName, 'day'],
    [monthName, 'month'],
    [yearName, 'year'],
    [dateName, 'date']
  ].forEach(function(mapping) {
    dayjsProto[mapping[1]] = function(value) {
      return this.$g(value, mapping[0], mapping[1]);
    };
  });

  dayjsWrapper.extend = function(plugin, options) {
    return plugin.$i || (plugin(options, DayjsInstance, dayjsWrapper), plugin.$i = true), dayjsWrapper;
  };

  dayjsWrapper.locale = getOrSetLocale;
  dayjsWrapper.isDayjs = isDayjsObject;

  dayjsWrapper.unix = function(timestamp) {
    return createDayjsInstance(1e3 * timestamp);
  };

  dayjsWrapper.en = locales[currentLocaleName];
  dayjsWrapper.Ls = locales;
  dayjsWrapper.p = {};

  return dayjsWrapper;
});
