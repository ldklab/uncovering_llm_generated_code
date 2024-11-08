(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.dayjs = factory();
  }
}(this, (function () {
  'use strict';

  // Constants for time units
  var MILLISECOND = 'millisecond',
      SECOND = 'second',
      MINUTE = 'minute',
      HOUR = 'hour',
      DAY = 'day',
      WEEK = 'week',
      MONTH = 'month',
      QUARTER = 'quarter',
      YEAR = 'year',
      DATE = 'date';

  // Regex patterns for parsing date strings
  var parseRegex = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,
      formatRegex = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

  // Default locale
  var defaultLocale = {
    name: 'en',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_')
  };

  // Utility function for formatting
  var utils = {
    s: function (input, length, f) {
      var str = String(input);
      return (str.length >= length) ? input : (f || '0').repeat(length - str.length) + str;
    },
    // Timezone offset in format +/-HH:mm
    z: function (d) {
      var offset = -d.utcOffset(), absOffset = Math.abs(offset), hours = Math.floor(absOffset / 60), minutes = absOffset % 60;
      return (offset <= 0 ? '+' : '-') + utils.s(hours, 2, '0') + ':' + utils.s(minutes, 2, '0');
    },
    // ... other utility methods ...
  };

  // Locale handling
  var globalLocale = 'en', locales = {};
  locales[globalLocale] = defaultLocale;

  var setLocale = function (name, values, isDefault) {
    if (!name) return globalLocale;
    if (typeof name === 'string') {
      if (locales[name]) {
        globalLocale = name;
      }
      if (values) {
        locales[name] = values;
        globalLocale = name;
      }
    } else {
      var localeName = name.name;
      locales[localeName] = name;
      globalLocale = localeName;
    }
    return isDefault ? globalLocale : name;
  };

  // Date instance methods
  function Dayjs(options) {
    this.$L = setLocale((options || {}).locale, null, true);
    this.parse(options);
  }

  var proto = Dayjs.prototype;

  proto.parse = function (cfg) {
    this.$d = (function (cfg) {
      var date = cfg.date, isUTC = cfg.utc;
      if (null === date) return new Date(NaN);
      if (date instanceof Date) return new Date(date);
      if (typeof date === 'string' && !/Z$/i.test(date)) {
        var match = date.match(parseRegex);
        if (match) {
          var year = match[1], month = match[2] - 1 || 0, 
              day = match[3] || 1, hour = match[4] || 0, 
              minute = match[5] || 0, second = match[6] || 0, 
              ms = (match[7] || '0').substring(0, 3);
          return isUTC ? new Date(Date.UTC(year, month, day, hour, minute, second, ms))
                       : new Date(year, month, day, hour, minute, second, ms);
        }
      }
      return new Date(date);
    })(cfg);
    
    this.$x = cfg.x || {};
    this.init();
  };

  // Initialize date properties
  proto.init = function () {
    var date = this.$d;
    this.$y = date.getFullYear();
    this.$M = date.getMonth();
    this.$D = date.getDate();
    this.$W = date.getDay();
    this.$H = date.getHours();
    this.$m = date.getMinutes();
    this.$s = date.getSeconds();
    this.$ms = date.getMilliseconds();
  };

  proto.clone = function () {
    return initializeDate(this.$d, this);
  };

  // ... Other methods for manipulation and formatting ...

  // Main function to create dayjs instances
  function initializeDate(date, config) {
    return new Dayjs({ date: date, args: arguments, locale: config.$L });
  }

  // Return dayjs object with methods
  return initializeDate;

}))); 
