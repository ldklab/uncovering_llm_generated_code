(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = typeof globalThis !== 'undefined' ? globalThis : global || self).dayjs = factory();
    }
}(this, (function () {
    'use strict';

    const MILLISECOND = 1e3;
    const MINUTE = 6e4;
    const HOUR = 36e5;
    
    const units = {
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
    };

    const invalidDate = 'Invalid Date';

    const defaultRegex = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
    const formatRegex = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

    const defaultLocale = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        ordinal: function (number) {
            const suffix = ["th", "st", "nd", "rd"];
            const remainder = number % 100;
            return `[${number}${suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0]}]`;
        }
    };

    function padStart(value, length, pad) {
        const str = String(value);
        return str.length >= length ? str : Array(length + 1 - str.length).join(pad) + value;
    }

    const utils = {
        s: padStart,
        z: function (timezoneOffset) {
            const absOffset = Math.abs(timezoneOffset);
            const offsetHours = Math.floor(absOffset / 60);
            const offsetMinutes = absOffset % 60;
            return (timezoneOffset <= 0 ? "+" : "-") + padStart(offsetHours, 2, "0") + ":" + padStart(offsetMinutes, 2, "0");
        },
        m: function (base, compare) {
            if (base.date() < compare.date()) return -utils.m(compare, base);
            const months = 12 * (compare.year() - base.year()) + (compare.month() - base.month());
            const nextMonth = base.clone().add(months, 'month');
            const difference = compare - nextMonth < 0;
            const nextCorrect = base.clone().add(months + (difference ? -1 : 1), 'month');
            return -(months + (compare - nextMonth) / (difference ? nextMonth - nextCorrect : nextCorrect - nextMonth));
        },
        a: function (value) {
            return value < 0 ? Math.ceil(value) : Math.floor(value);
        },
        p: function (unit) {
            return units[unit] || String(unit || "").toLowerCase().replace(/s$/, "");
        },
        u: function (value) {
            return value === undefined;
        }
    };

    let currentLocale = 'en';
    const locales = {};
    locales[currentLocale] = defaultLocale;

    function isDayjsObject(instance) {
        return instance instanceof Dayjs || (instance && instance._isDayjsObject);
    }

    function locale(localeName, obj, updateGlobal) {
        if (!localeName) return currentLocale;
        
        let foundLocale = localeName.toLowerCase();
        if (locales[foundLocale]) {
            if (obj) locales[foundLocale] = obj;
            if (updateGlobal) currentLocale = foundLocale;
            return foundLocale;
        }

        const parts = localeName.split("-");
        if (parts.length > 1) return locale(parts[0], obj, updateGlobal);

        if (typeof obj === "object" && !locales[localeName]) {
            locales[localeName] = obj;
            foundLocale = localeName.toLowerCase();
        }

        updateGlobal && foundLocale && (currentLocale = foundLocale);
        return foundLocale || (!updateGlobal && currentLocale);
    }

    function dayjs(input, config) {
        return isDayjsObject(input) ? input.clone() : new Dayjs(createConfig(input, config));
    }

    function createConfig(input, config) {
        const current = isDayjsObject(input) ? input : {};
        const mergeIntoCurrent = typeof input === 'object' ? input : {};
        return {
            ...current,
            ...config,
            date: input,
            args: [input, config],
            ...mergeIntoCurrent
        };
    }

    class Dayjs {
        constructor(config) {
            this.$L = locale(config.locale, null, true);
            this.parse(config);
            this.$x = this.$x || config.$x || {};
            this._isDayjsObject = true;
        }

        parse(config) {
            this.$d = parseDate(config.date, config.utc);
            this.init();
        }

        init() {
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
            return utils;
        }

        isValid() {
            return !(this.$d.toString() === invalidDate);
        }

        isSame(input, unit) {
            const other = dayjs(input);
            return this.startOf(unit) <= other && other <= this.endOf(unit);
        }

        isAfter(input, unit) {
            return dayjs(input) < this.startOf(unit);
        }

        isBefore(input, unit) {
            return this.endOf(unit) < dayjs(input);
        }

        $g(input, key, getter) {
            return utils.u(input) ? this[key] : this.set(getter, input);
        }

        unix() {
            return Math.floor(this.valueOf() / MILLISECOND);
        }

        valueOf() {
            return this.$d.getTime();
        }

        startOf(unit, start) {
            const isStart = utils.u(start) || start;
            const offset = this.utcOffset();
            const dayOfYear = (y, M, D) => utils.w(isNaN(y) ? new Date(y) : y, this, "date").$g(D, 'date', 'date');
            const fn = {
                [units.year]: this => isStart ? dayOfYear(this.$y, 0, 1) : dayOfYear(this.$y + 1, 0, 1),
                [units.month]: this => isStart ? dayOfYear(this.$y, this.$M, 1) : dayOfYear(this.$y, this.$M + 1, 1),
                [units.week]: this => {
                    const startOfWeek = this.$locale().weekStart || 0;
                    const diff = (this.$W < startOfWeek ? this.$W + 7 : this.$W) - startOfWeek;
                    return this.$g(diff ? -diff + isStart : 6 - this.$W + isStart - 6, '$D', 'date');
                },
                [units.day]: this => dayOfYear(this.$y, this.$M, this.$D),
                [units.date]: this => dayOfYear(this.$y, this.$M, this.$D),
                [units.hour]: this => utils.w(this.toDate().setHours(1e3), this, "date").$g(0, 'time', 'hour'),
                [units.minute]: this => utils.w(this.toDate().setMilliseconds(1e3), this, "date").$g(0, 'time', 'minute'),
                [units.second]: this => utils.w(this.toDate().setMilliseconds(3), this, "date").$g(0, 'time', 'second'),
                [units.millisecond]: this => this.clone()
            };
            return fn[utils.p(unit)](this);
        }

        endOf(unit) {
            return this.startOf(unit, false);
        }

        $set(unit, value) {
            const method = {
                [units.date]: 'setDate',
                [units.month]: 'setMonth',
                [units.year]: 'setFullYear',
                [units.hour]: 'setHours',
                [units.minute]: 'setMinutes',
                [units.second]: 'setSeconds',
                [units.millisecond]: 'setMilliseconds'
            }[utils.p(unit)];

            const formattedValue = {
                date: value,
                month: value,
                year: value,
                hour: value,
                minute: value,
                second: value,
                millisecond: value
            }[utils.p(unit)];
            
            if (formattedValue === undefined) return this;
            this.$d[method](formattedValue);
            this.init();
            return this;
        }

        set(unit, value) {
            return this.clone().$set(unit, value);
        }

        add(value, unit) {
            const unitType = utils.p(unit);
            const direction = value < 0 ? -1 : 1;
            if (unitType === units.month || unitType === units.year) {
                return this.set(unitType, this.$g(value * direction + this[unitType.charAt(0)], `_${unitType.charAt(0)}`, unitType.charAt(0)));
            }
            const durationInMs = {
                [units.minute]: MINUTE,
                [units.hour]: HOUR,
                [units.second]: MILLISECOND
            }[unitType] || 1;

            return this.clone().$set('time', this.$d.valueOf() + value * durationInMs * direction);
        }

        subtract(value, unit) {
            return this.add(-value, unit);
        }

        format(formatStr) {
            const locale = this.$locale();
            const format = formatStr || "YYYY-MM-DDTHH:mm:ssZ";
            if (!this.isValid()) return locale.invalidDate || invalidDate;

            const replaceFunc = (match) => {
                switch (match) {
                    case 'YY': return String(this.$y).slice(-2);
                    case 'YYYY': return utils.s(this.$y, 4, '0');
                    case 'M': return String(this.$M + 1);
                    case 'MM': return utils.s(this.$M + 1, 2, '0');
                    case 'MMM': return locale.monthsShort[this.$M];
                    case 'MMMM': return locale.months[this.$M];
                    case 'D': return String(this.$D);
                    case 'DD': return utils.s(this.$D, 2, '0');
                    case 'H': return String(this.$H);
                    case 'HH': return utils.s(this.$H, 2, '0');
                    case 'h': return String(this.$H % 12 || 12);
                    case 'hh': return utils.s(this.$H % 12 || 12, 2, '0');
                    case 'a': return this.$H < 12 ? 'am' : 'pm';
                    case 'A': return this.$H < 12 ? 'AM' : 'PM';
                    case 'm': return String(this.$m);
                    case 'mm': return utils.s(this.$m, 2, '0');
                    case 's': return String(this.$s);
                    case 'ss': return utils.s(this.$s, 2, '0');
                    case 'SSS': return utils.s(this.$ms, 3, '0');
                    default: return match.replace(':', '');
                }
            };

            return format.replace(formatRegex, replaceFunc);
        }

        utcOffset() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }

        diff(compare, unit, float) {
            const other = dayjs(compare);
            const difference = this - other;
            const offset = (other.utcOffset() - this.utcOffset()) * MINUTE;

            const adjustByUnit = {
                [units.year]: () => utils.m(this, other) / 12,
                [units.month]: () => utils.m(this, other),
                [units.week]: () => (difference - offset) / 6048e5,
                [units.day]: () => (difference - offset) / 864e5,
                [units.hour]: () => difference / HOUR,
                [units.minute]: () => difference / MINUTE,
                [units.second]: () => difference / MILLISECOND
            };
            const result = adjustByUnit[utils.p(unit)]() || difference;
            return float ? result : utils.a(result);
        }

        daysInMonth() {
            return this.endOf(units.month).$D;
        }

        $locale() {
            return locales[this.$L];
        }

        locale(localeName, config) {
            if (!localeName) return this.$L;
            const result = this.clone();
            const newLocale = locale(localeName, config, true);
            if (newLocale) result.$L = newLocale;
            return result;
        }

        clone() {
            return dayjs(this.toDate());
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

    const proxy = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'];
    proxy.forEach(unit => {
        Dayjs.prototype[unit] = function (value) {
            return this.$g(value, `$${unit.charAt(0)}`, unit.charAt(0));
        };
    });

    dayjs.extend = function (plugin, config) {
        if (!plugin.$i) {
            plugin(config, Dayjs, dayjs);
            plugin.$i = true;
        }
        return dayjs;
    };
    dayjs.locale = locale;
    dayjs.isDayjs = isDayjsObject;
    dayjs.unix = function (timestamp) {
        return dayjs(1e3 * timestamp);
    };
    dayjs.en = locales[currentLocale];
    dayjs.Ls = locales;
    dayjs.p = {};

    return dayjs;

    function parseDate(input, utc) {
        if (input === null) {
            return new Date(NaN);
        }
        if (utils.u(input)) {
            return new Date();
        }
        if (input instanceof Date) {
            return new Date(input);
        }
        if (typeof input === 'string' && !/Z$/i.test(input)) {
            const parts = input.match(defaultRegex);
            if (parts) {
                const month = (parts[2] - 1) || 0;
                const ms = (parts[7] || '0').substring(0, 3);
                if (utc) {
                    return new Date(Date.UTC(parts[1], month, parts[3] || 1, parts[4] || 0, parts[5] || 0, parts[6] || 0, ms));
                }
                return new Date(parts[1], month, parts[3] || 1, parts[4] || 0, parts[5] || 0, parts[6] || 0, ms);
            }
        }
        return new Date(input);
    }

})));
