(function(global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        global.dayjs = factory();
    }
})(this, function() {
    "use strict";
    
    var MILLISECOND = "millisecond",
        SECOND = "second",
        MINUTE = "minute",
        HOUR = "hour",
        DAY = "day",
        WEEK = "week",
        MONTH = "month",
        QUARTER = "quarter",
        YEAR = "year",
        DATE = "date";

    var dateParseRegex = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,
        formatParseRegex = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

    var defaultLocale = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
    };

    var zeroPad = function(number, length, char) {
        var str = String(number);
        return !str || str.length >= length ? number : "" + Array(length + 1 - str.length).join(char) + number;
    };

    var utils = {
        s: zeroPad,
        z: function(date) {
            var offset = -date.utcOffset(),
                absOffset = Math.abs(offset),
                hours = Math.floor(absOffset / 60),
                minutes = absOffset % 60;
            return (offset <= 0 ? "+" : "-") + zeroPad(hours, 2, "0") + ":" + zeroPad(minutes, 2, "0");
        },
        m: function(input, instance) {
            if (input.date() < instance.date()) return -utils.m(instance, input);
            var months = 12 * (instance.year() - input.year()) + (input.month() - instance.month()),
                compare = input.clone().add(months, MONTH),
                diff = instance - compare < 0,
                cmp = input.clone().add(months + (diff ? -1 : 1), MONTH);
            return +(-(months + (instance - compare) / (diff ? compare - cmp : cmp - compare)) || 0);
        },
        a: function(num) {
            return num < 0 ? Math.ceil(num) || 0 : Math.floor(num);
        },
        p: function(unit) {
            return {
                M: MONTH,
                y: YEAR,
                w: WEEK,
                d: DAY,
                D: DATE,
                h: HOUR,
                m: MINUTE,
                s: SECOND,
                ms: MILLISECOND,
                Q: QUARTER
            }[unit] || String(unit || "").toLowerCase().replace(/s$/, "");
        },
        u: function(input) {
            return input === void 0;
        }
    };

    var currentLocale = "en", locales = {};
    locales[currentLocale] = defaultLocale;

    var isDayjsInstance = function(input) {
        return input instanceof Dayjs;
    };

    var getLocale = function(locale, customData, setGlobal) {
        var result;
        if (!locale) return currentLocale;
        if (typeof locale === "string") {
            locales[locale] && (result = locale);
            customData && (locales[locale] = customData, result = locale);
        } else {
            var localeName = locale.name;
            locales[localeName] = locale;
            result = localeName;
        }
        return !setGlobal && result && (currentLocale = result), result || !setGlobal && currentLocale;
    };

    var dayjs = function(input, customParseFormat) {
        if (isDayjsInstance(input)) return input.clone();
        var config = typeof customParseFormat === "object" ? customParseFormat : {};
        config.date = input;
        config.args = arguments;
        return new Dayjs(config);
    };

    var wrapperUtils = {
        l: getLocale,
        i: isDayjsInstance,
        w: function(input, instance) {
            return dayjs(input, {
                locale: instance.$L,
                utc: instance.$u,
                x: instance.$x,
                $offset: instance.$offset
            });
        }
    };

    var Dayjs = function(config) {
        this.$L = getLocale(config.locale, null, true);
        this.parse(config);
    };

    var proto = Dayjs.prototype;
    proto.parse = function(config) {
        this.$d = function(configDate) {
            var date = configDate.date,
                utc = configDate.utc;
            if (null === date) return new Date(NaN);
            if (utils.u(date)) return new Date();
            if (date instanceof Date) return new Date(date);
            if ("string" == typeof date && !/Z$/i.test(date)) {
                var regexMatch = date.match(dateParseRegex);
                if (regexMatch) {
                    var month = regexMatch[2] - 1 || 0,
                        milliseconds = (regexMatch[7] || "0").substring(0, 3);
                    return utc ? new Date(Date.UTC(regexMatch[1], month, regexMatch[3] || 1, regexMatch[4] || 0, regexMatch[5] || 0, regexMatch[6] || 0, milliseconds)) : new Date(regexMatch[1], month, regexMatch[3] || 1, regexMatch[4] || 0, regexMatch[5] || 0, regexMatch[6] || 0, milliseconds);
                }
            }
            return new Date(date);
        }(config);

        this.$x = config.x || {};
        this.init();
    };

    proto.init = function() {
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

    proto.$utils = function() {
        return wrapperUtils;
    };

    proto.isValid = function() {
        return !("Invalid Date" === this.$d.toString());
    };

    proto.isSame = function(input, unit) {
        var dateInstance = dayjs(input);
        return this.startOf(unit) <= dateInstance && dateInstance <= this.endOf(unit);
    };

    proto.isAfter = function(input, unit) {
        return dayjs(input) < this.startOf(unit);
    };

    proto.isBefore = function(input, unit) {
        return this.endOf(unit) < dayjs(input);
    };

    proto.$g = function(value, getter, setter) {
        return utils.u(value) ? this[getter] : this.set(setter, value);
    };

    proto.unix = function() {
        return Math.floor(this.valueOf() / 1000);
    };

    proto.valueOf = function() {
        return this.$d.getTime();
    };

    proto.startOf = function(unit, isStart) {
        var that = this,
            notEnd = !!utils.u(isStart) || isStart,
            parsedUnit = utils.p(unit),
            setDateUnit = function(setYear, setMonth) {
                return utils.w(new Date(setYear, setMonth, that.$D, that.$H, that.$m, that.$s, that.$ms), that);
            },
            setHour = function(setMethod, unitIndex) {
                return utils.w(new Date(that.$y, that.MONTH, that.$D, setMethod.apply(that.toDate("s"), [true].map(Number)[unitIndex])), that);
            };

        switch (parsedUnit) {
            case YEAR: return notEnd ? setDateUnit(1, 0) : setDateUnit(31, 11);
            case MONTH: return notEnd ? setDateUnit(1, this.$M) : setDateUnit(0, this.$M + 1);
            case WEEK:
                var weekStart = this.$locale().weekStart || 0,
                    diff = (this.$W < weekStart ? this.$W + 7 : this.$W) - weekStart;
                return setDateUnit(notEnd ? this.$D - diff : this.$D + (6 - diff), this.$M);
            case DAY:
            case DATE: return setHour("Hours", 0);
            case HOUR: return setHour("Minutes", 1);
            case MINUTE: return setHour("Seconds", 2);
            case SECOND: return setHour("Milliseconds", 3);
            default: return this.clone();
        }
    };

    proto.endOf = function(unit) {
        return this.startOf(unit, false);
    };

    proto.$set = function(parsedUnit, input) {
        var setUnit, setMethod = utils.p(parsedUnit),
            setter = "set" + (this.$u ? "UTC" : ""),
            setString = function(field, methodName) {
                return (i[field] = "set" + (this.$u ? "UTC" : "") + methodName, i);
            },
            i = {};
            
        var parsedMethod = setString(DATE, "Date");
        parsedMethod = setString(DAY, "Date");
        parsedMethod = setString(MONTH, "Month");
        parsedMethod = setString(YEAR, "FullYear");
        parsedMethod = setString(HOUR, "Hours");
        parsedMethod = setString(MINUTE, "Minutes");
        parsedMethod = utils.p(SECOND, "Seconds");
        parsedMethod = utils.p(MILLISECOND, "Milliseconds");

        var date = utils.p(parsedMethod);
        if (parsedMethod === MONTH || parsedMethod === YEAR) {
            var dateClone = this.clone().set(DATE, 1);
            dateClone.$d[parsedMethod](value);
            dateClone.init();
            this.$d = dateClone.set(DATE, Math.min(this.$D, dateClone.daysInMonth())).$d;
        } else {
            var newVal = parsedUnit === DAY ? this.$D + (value - this.$W) : value;
            parsedMethod && this.$d[parsedMethod](newVal);
        }
        return this.init(), this;
    };
    
    proto.set = function(unit, value) {
        return this.clone().$set(unit, value);
    };

    proto.get = function(unit) {
        return this[utils.p(unit)]();
    };

    proto.add = function(amount, unit) {
        amount = Number(amount);
        var parsedUnit = utils.p(unit);
        
        function dateMath(diff) {
            var instanceClone = dayjs(this);
            return utils.w(instanceClone.date(instanceClone.date() + Math.round(diff * amount)), this);
        }

        if (parsedUnit === MONTH) return this.set(MONTH, this.$M + amount);
        if (parsedUnit === YEAR) return this.set(YEAR, this.$y + amount);
        if (parsedUnit === DAY) return dateMath(1);
        if (parsedUnit === WEEK) return dateMath(7);

        var operation = {};
        operation[MINUTE] = 60000;
        operation[HOUR] = 3600000;
        operation[SECOND] = 1000;

        var dateAdjustment = operation[parsedUnit] || 1;
        var dateValue = this.$d.getTime() + amount * dateAdjustment;
        return utils.w(dateValue, this);
    };

    proto.subtract = function(amount, unit) {
        return this.add(-1 * amount, unit);
    };

    proto.format = function(formatString) {
        if (!this.isValid()) return "Invalid Date";

        var formatStringOrDefault = formatString || "YYYY-MM-DDTHH:mm:ssZ",
            dateZone = utils.z(this),
            dateLocale = this.$locale(),
            hour = this.$H,
            minute = this.$m,
            month = this.$M,
            weekdays = dateLocale.weekdays,
            months = dateLocale.months;

        function lookup(keys, inStructure, fallbackStructure, length) {
            return keys && (keys[inStructure] || keys(this, formatStringOrDefault)) || fallbackStructure[inStructure].substr(0, length);
        }

        function meridian(hours) {
            return utils.s(hours % 12 || 12, [0], 0);
        }

        var meridiemCase = dateLocale.meridiem || function(hours, minute, isLowerCase) {
            var timePeriod = hours < 12 ? "AM" : "PM";
            return isLowerCase ? timePeriod.toLowerCase() : timePeriod;
        };

        var formatMapping = {
            YY: String(this.$y).slice(-2),
            YYYY: this.$y,
            M: month + 1,
            MM: utils.s(month + 1, 2, "0"),
            MMM: lookup(dateLocale.monthsShort, month, months, 3),
            MMMM: lookup(months, month),
            D: this.$D,
            DD: utils.s(this.$D, 2, "0"),
            d: String(this.$W),
            dd: lookup(dateLocale.weekdaysMin, this.$W, weekdays, 2),
            ddd: lookup(dateLocale.weekdaysShort, this.$W, weekdays, 3),
            dddd: weekdays[this.$W],
            H: String(hour),
            HH: utils.s(hour, 2, "0"),
            h: meridian(1),
            hh: meridian(2),
            a: meridiemCase(hour, minute, true),
            A: meridiemCase(hour, minute, false),
            m: String(minute),
            mm: utils.s(minute, 2, "0"),
            s: String(this.$s),
            ss: utils.s(this.$s, 2, "0"),
            SSS: utils.s(this.$ms, 3, "0"),
            Z: dateZone
        };
        
        return formatStringOrDefault.replace(formatParseRegex, function(regexMatch, escapedFormat) {
            return escapedFormat || formatMapping[regexMatch] || dateZone.replace(":", "");
        });
    };

    proto.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
    };

    proto.diff = function(input, unit, float) {
        var diffMethod = function(unit) {
            if (parsedUnit === YEAR) return periods / 12;
            if (parsedUnit === MONTH) return periods;
            if (parsedUnit === QUARTER) return periods / 3;
            if (parsedUnit === WEEK) return (periods - offset) / 604800000;
            if (parsedUnit === DAY) return (periods - offset) / 86400000;
            if (parsedUnit === HOUR) return periods / 3600000;
            if (parsedUnit === MINUTE) return periods / 60000;
            if (parsedUnit === SECOND) return periods / 1000;
            return periods;
        };

        var parsedUnit = utils.p(unit);
        var inputInstance = dayjs(input);
        var offset = 60000 * (inputInstance.utcOffset() - this.utcOffset());
        var periods = this - inputInstance;
        var monthsDiff = utils.m(this, inputInstance);

        var diffCalculation = diffMethod(parsedUnit);
        return float ? diffCalculation : utils.a(diffCalculation);
    };

    proto.daysInMonth = function() {
        return this.endOf(MONTH).$D;
    };

    proto.$locale = function() {
        return locales[this.$L];
    };

    proto.locale = function(locale, customData) {
        if (!locale) return this.$L;
        var result = this.clone(),
            parsedLocale = getLocale(locale, customData, true);
        return parsedLocale && (result.$L = parsedLocale), result;
    };

    proto.clone = function() {
        return utils.w(this.$d, this);
    };

    proto.toDate = function() {
        return new Date(this.valueOf());
    };

    proto.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
    };

    proto.toISOString = function() {
        return this.$d.toISOString();
    };

    proto.toString = function() {
        return this.$d.toUTCString();
    };

    dayjs.prototype = proto;

    [["ms", MILLISECOND], ["s", SECOND], ["m", MINUTE], ["H", HOUR], ["W", DAY], ["M", MONTH], ["y", YEAR], ["D", DATE]].forEach(function(pair) {
        proto[pair[1]] = function(value) {
            return this.$g(value, pair[0], pair[1]);
        };
    });

    dayjs.extend = function(plugin, option) {
        return plugin.$i || (plugin(option, Dayjs, dayjs), plugin.$i = true), dayjs;
    };

    dayjs.locale = getLocale;
    dayjs.isDayjs = isDayjsInstance;
    dayjs.unix = function(seconds) {
        return dayjs(1000 * seconds);
    };
    dayjs.en = locales[currentLocale];
    dayjs.Ls = locales;
    dayjs.p = {};

    return dayjs;
});
