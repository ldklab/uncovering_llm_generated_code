(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self).dayjs = factory();
  }
})(this, function() {
  'use strict';

  const MILLISECOND = 1e3,
    MINUTE = 6e4,
    HOUR = 36e5,
    TYPE_UNIT = {
      millisecond: 'millisecond',
      second: 'second',
      minute: 'minute',
      hour: 'hour',
      day: 'day',
      week: 'week',
      month: 'month',
      quarter: 'quarter',
      year: 'year',
      date: 'date'
    },
    INVALID_DATE = 'Invalid Date',
    REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
    REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

  const defaultLocale = {
    name: 'en',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    ordinal: (number) => {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const val = number % 100;
      return `[${number}${suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]}]`;
    }
  };

  const utils = {
    padStart: (value, length, fill) => String(value).padStart(length, fill),
    zoneOffset: (date) => {
      const offset = -date.utcOffset();
      const absOffset = Math.abs(offset);
      const hours = Math.floor(absOffset / 60);
      const minutes = absOffset % 60;
      return `${offset <= 0 ? '+' : '-'}${utils.padStart(hours, 2, '0')}:${utils.padStart(minutes, 2, '0')}`;
    },
    parseLocaleKey: (key) => {
      const cleanKey = key || '';
      return cleanKey.toLowerCase().replace(/s$/, '');
    },
    isUndefined: (value) => value === undefined
  };

  let globalLocale = 'en';
  const localeData = {};
  localeData[globalLocale] = defaultLocale;

  const isDayjs = (obj) => obj instanceof Dayjs || (obj && obj.$isDayjsObject);

  const createLocale = (name, config, isGlobal) => {
    if (!name) return globalLocale;
    let localeKey;
    if (typeof name === 'string') {
      const lowercasedName = name.toLowerCase();
      if (localeData[lowercasedName]) localeKey = lowercasedName;
      if (config) localeData[lowercasedName] = config, localeKey = lowercasedName;
      const parts = name.split('-');
      if (!localeKey && parts.length > 1) return createLocale(parts[0]);
    } else if (name.name) {
      localeData[name.name] = name;
      localeKey = name.name;
    }
    if (!isGlobal && localeKey) globalLocale = localeKey;
    return localeKey || (isGlobal ? globalLocale : undefined);
  };

  const createDayjs = (config, c) => {
    if (isDayjs(config)) return config.clone();
    const parsedConfig = typeof c === 'object' ? c : {};
    parsedConfig.date = config;
    parsedConfig.args = arguments;
    return new Dayjs(parsedConfig);
  };

  const extend = function(plugin, option) {
    if (!plugin.$i) {
      plugin(option, Dayjs, createDayjs);
      plugin.$i = true;
    }
    return createDayjs;
  };

  class Dayjs {
    constructor(config) {
      this.$L = createLocale(config.locale, null, true);
      this.parse(config);
      this.$x = this.$x || config.x || {};
      this.$isDayjsObject = true;
    }

    parse(config) {
      this.$d = (function(dateConfig) {
        const { date, utc } = dateConfig;
        if (date === null) return new Date(NaN);
        if (utils.isUndefined(date)) return new Date();
        if (date instanceof Date) return new Date(date);
        if (typeof date === 'string' && !/Z$/i.test(date)) {
          const parsed = date.match(REGEX_PARSE);
          if (parsed) {
            const month = parsed[2] - 1 || 0;
            const millisecond = (parsed[7] || '0').substring(0, 3);
            return utc
              ? new Date(Date.UTC(parsed[1], month, parsed[3] || 1, parsed[4] || 0, parsed[5] || 0, parsed[6] || 0, millisecond))
              : new Date(parsed[1], month, parsed[3] || 1, parsed[4] || 0, parsed[5] || 0, parsed[6] || 0, millisecond);
          }
        }
        return new Date(date);
      })(config);
      this.init();
    }

    init() {
      const date = this.$d;
      this.$y = date.getFullYear();
      this.$M = date.getMonth();
      this.$D = date.getDate();
      this.$W = date.getDay();
      this.$H = date.getHours();
      this.$m = date.getMinutes();
      this.$s = date.getSeconds();
      this.$ms = date.getMilliseconds();
    }

    $utils() {
      return utils;
    }

    isValid() {
      return !(this.$d.toString() === INVALID_DATE);
    }

    clone() {
      return createDayjs(this.$d, this);
    }

    isSame(date, units) {
      const other = createDayjs(date);
      return this.startOf(units) <= other && other <= this.endOf(units);
    }

    isBefore(date, units) {
      return this.endOf(units) < createDayjs(date);
    }

    isAfter(date, units) {
      return createDayjs(date) < this.startOf(units);
    }

    $g(input, property, getter) {
      return utils.isUndefined(input) ? this[property] : this.set(getter, input);
    }

    unix() {
      return Math.floor(this.valueOf() / MILLISECOND);
    }

    valueOf() {
      return this.$d.getTime();
    }

    toDate() {
      return new Date(this.valueOf());
    }

    toString() {
      return this.$d.toUTCString();
    }

    static extend = extend;
    static locale = createLocale;
    static isDayjs = isDayjs;
    static unix(seconds) {
      return createDayjs(seconds * MILLISECOND);
    }
    static en = localeData[globalLocale];
    static Ls = localeData;
    static p = {};
  }

  const dayjsProto = Dayjs.prototype;

  [['$ms', TYPE_UNIT.millisecond], ['$s', TYPE_UNIT.second], ['$m', TYPE_UNIT.minute], ['$H', TYPE_UNIT.hour],
   ['$W', TYPE_UNIT.day], ['$M', TYPE_UNIT.month], ['$y', TYPE_UNIT.year], ['$D', TYPE_UNIT.date]].forEach(([method, unit]) => {
    dayjsProto[unit] = function(input) {
      return this.$g(input, method, unit);
    };
  });
  
  return Dayjs;
});
