// moment.js
// version : 2.30.1
// authors : Tim Wood, Iskren Chernev, Moment.js contributors
// license : MIT
// momentjs.com

(function (global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.moment = factory();
    }
}(this, function () {
    'use strict';

    let hookCallback;

    const hooks = (...args) => hookCallback.apply(null, args);

    const setHookCallback = callback => {
        hookCallback = callback;
    };

    const isArray = input => Array.isArray(input);

    const isObject = input => input !== null && Object.prototype.toString.call(input) === '[object Object]';

    const isUndefined = input => input === undefined;

    const isNumber = input => typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';

    const isDate = input => input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';

    const extend = (a, b) => {
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        if (b.hasOwnProperty('toString')) {
            a.toString = b.toString;
        }
        if (b.hasOwnProperty('valueOf')) {
            a.valueOf = b.valueOf;
        }
        return a;
    };

    const createUTC = (input, format, locale, strict) => createLocalOrUTC(input, format, locale, strict, true).utc();

    const defaultParsingFlags = () => ({
        empty: false,
        unusedTokens: [],
        unusedInput: [],
        overflow: -2,
        charsLeftOver: 0,
        nullInput: false,
        invalidEra: null,
        invalidMonth: null,
        invalidFormat: false,
        userInvalidated: false,
        iso: false,
        parsedDateParts: [],
        era: null,
        meridiem: null,
        rfc2822: false,
        weekdayMismatch: false,
    });

    const getParsingFlags = m => {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    };

    const isValid = m => {
        let flags = null,
            parsedParts = false,
            isNowValid = m._d && !isNaN(m._d.getTime());
        if (isNowValid) {
            flags = getParsingFlags(m);
            parsedParts = flags.parsedDateParts.some(i => i != null);
            isNowValid =
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidEra &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));
            if (m._strict) {
                isNowValid =
                    isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        } else {
            return isNowValid;
        }
        return m._isValid;
    };

    const createInvalid = flags => {
        const m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }
        return m;
    };

    const momentProperties = (hooks.momentProperties = []),
        updateInProgress = false;

    const copyConfig = (to, from) => {
        for (let i = 0; i < momentProperties.length; i++) {
            const prop = momentProperties[i],
                val = from[prop];
            if (!isUndefined(val)) {
                to[prop] = val;
            }
        }

        for (let key of Object.keys(from)) {
            if (!isUndefined(from[key])) {
                to[key] = from[key];
            }
        }

        return to;
    };

    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    const isMoment = obj => obj instanceof Moment || (obj != null && obj._isAMomentObject != null);

    const addFormatToken = (token, padded, ordinal, callback) => {
        const func = typeof callback === 'string' ? function () { return this[callback](); } : callback;
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    };

    const makeFormatFunction = format => {
        const array = format.match(formattingTokens),
            length = array.length;

        for (let i = 0; i < length; i++) {
            if (!formatTokenFunctions[array[i]]) {
                array[i] = removeFormattingTokens(array[i]);
            } else {
                array[i] = formatTokenFunctions[array[i]];
            }
        }

        return function (mom) {
            let output = '';
            for (let i = 0; i < length; i++) {
                output += isFunction(array[i])
                    ? array[i].call(mom, format)
                    : array[i];
            }
            return output;
        };
    };

    const expandFormat = (format, locale) => {
        let i = 5;
        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    };

    const defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L',
    };

    const calendar = function (key, mom, now) {
        const output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    };

    const defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    };

    const longDateFormat = function (key) {
        let format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.match(formattingTokens).map(tok => 
            tok === 'MMMM' || tok === 'MM' || tok === 'DD' || tok === 'dddd'
                ? tok.slice(1)
                : tok).join('');

        return this._longDateFormat[key];
    };

    const defaultInvalidDate = 'Invalid date';

    const invalidDate = function () {
        return this._invalidDate;
    };

    const relativeTime = function (number, withoutSuffix, string, isFuture) {
        const output = this._relativeTime[string];
        return isFunction(output)
            ? output(number, withoutSuffix, string, isFuture)
            : output.replace(/%d/i, number);
    };

    const pastFuture = function (diff, output) {
        const format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    };

    const matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}/i,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    const defaultLocaleWeek = {
        dow: 0,
        doy: 6,
    };

    const localeWeek = function (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    };

    const defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');

    const localeMonths = function (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months : this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] : 
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    };

    const localeMonthsShort = function (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : 
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    };

    const handleStrictParse = function (monthName, format, strict) {
        const llc = monthName.toLocaleLowerCase();
        let i, mom;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                i = indexOf.call(this._shortMonthsParse, llc);
                return i !== -1 ? i : null;
            }
            i = indexOf.call(this._longMonthsParse, llc);
            return i !== -1 ? i : null;
        }

        if (format === 'MMM') {
            i = indexOf.call(this._shortMonthsParse, llc);
            if (i !== -1) return i;
            i = indexOf.call(this._longMonthsParse, llc);
            return i !== -1 ? i : null;
        }
        i = indexOf.call(this._longMonthsParse, llc);
        if (i !== -1) return i;
        i = indexOf.call(this._shortMonthsParse, llc);
        return i !== -1 ? i : null;
    };

    const localeMonthsParse = function (monthName, format, strict) {
        let i, regex;

        if (this._monthsParseExact) return handleStrictParse.call(this, monthName, format, strict);

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            let month = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(month, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(month, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(month, '') + '|^' + this.monthsShort(month, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            }
            if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            }
            if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    };

    const setMonth = (mom, value) => {
        if (!mom.isValid()) return mom;

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        const month = value,
            date = mom.date();
        date = Math.min(date, daysInMonth(mom.year(), month));
        void ((mom._isUTC ? mom._d.setUTCMonth(month, date) : mom._d.setMonth(month, date)));
        return mom;
    };

    const getSetMonth = function (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        }
        return get(this, 'Month');
    };

    const getDaysInMonth = () => daysInMonth(this.year(), this.month());

    const monthsShortRegex = function (isStrict) {
        if (this._monthsParseExact) {
            if (!this.hasOwnProperty('_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            return isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        } else {
            if (!this.hasOwnProperty('_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    };

    const monthsRegex = function (isStrict) {
        if (this._monthsParseExact) {
            if (!this.hasOwnProperty('_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            return isStrict ? this._monthsStrictRegex : this._monthsRegex;
        } else {
            if (!this.hasOwnProperty('_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
    };

    const computeMonthsParse = function () {
        const initMonthParseRegex = regex => new RegExp('^' + regexEscape(regex) + '$', 'i'),
            mixedPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPiecesSorted = [],
            shortPiecesSorted = [],
            longPiecesSorted = [];

        const processMonths = (regexGet, format) => {
            for (let i = 0; i < 12; i++) {
                const date = createUTC([2000, i]);
                mixedPieces.push(regexGet.call(this, date, format));
                shortPieces.push(regexEscape(this.monthsShort(date, format)));
                longPieces.push(regexEscape(this.months(date, format)));
            }
        };

        processMonths(this.monthsShort, '');
        shortPieces.forEach(p => mixedPiecesSorted.push(p));
        mixedPiecesSorted.sort(cmpLenRev);
        processMonths(this.months, '');
        longPieces.forEach(p => mixedPiecesSorted.push(p));
        mixedPiecesSorted.sort(cmpLenRev);

        this._monthsRegex = initMonthParseRegex(mixedPiecesSorted.join('|'));
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = initMonthParseRegex(longPiecesSorted.join('|'));
        this._monthsShortStrictRegex = initMonthParseRegex(shortPiecesSorted.join('|'));
    };

    const createDate = (y, m, d, h, M, s, ms) => {
        if (y < 100 && y >= 0) {
            const date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) date.setFullYear(y);
            return date;
        }
        return new Date(y, m, d, h, M, s, ms);
    };

    const createUTCDate = y => new Date(Date.UTC.apply(null, [y].concat(Array.prototype.slice.call(arguments, 1)))) < 100 ? 
        new Date(Date.UTC.apply(null, [y + 400].concat(Array.prototype.slice.call(arguments, 1)))) :
        new Date(Date.UTC.apply(null, arguments));

    const firstWeekOffset = (year, dow, doy) => {
        const fwd = 7 + dow - doy,
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
    };

    const dayOfYearFromWeeks = (year, week, weekday, dow, doy) => {
        const localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset;

        let resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear,
        };
    };

    const weekOfYear = (mom, dow, doy) => {
        const weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1;

        let resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear,
        };
    };

    const weeksInYear = (year, dow, doy) => {
        const weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    };

    const addFormatToken = (token, padded, ordinal, callback) => {
        const func = typeof callback === 'string' ? function () { return this[callback](); } : callback;
        if (token) formatTokenFunctions[token] = func;
        if (padded) formatTokenFunctions[padded[0]] = function () {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
        if (ordinal) formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        };
    };

    const removeFormattingTokens = input => input.match(/\[[\s\S]/) ? input.replace(/^\[|\]$/g, '') : input.replace(/\\/g, '');

    const makeFormatFunction = format => {
        const array = format.match(formattingTokens),
            length = array.length;

        for (let i = 0; i < length; i++) {
            array[i] = formatTokenFunctions[array[i]] || removeFormattingTokens(array[i]);
        }

        return function (mom) {
            let output = '';
            for (let i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    };

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) this._d = new Date(NaN);
        if (!updateInProgress) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    const isMoment = input => input instanceof Moment || (input != null && input._isAMomentObject != null);

    const some = Array.prototype.some || function (fun) {
        const t = Object(this), l = t.length >>> 0;
        for (let i = 0; i < l; i++) {
            if (i in t && fun.call(this, t[i], i, t)) return true;
        }
        return false;
    };

    const isValid = m => {
        const flags = getParsingFlags(m);
        let parsedParts = false, isNowValid = m._d && !isNaN(m._d.getTime());
        if (isNowValid) {
            parsedParts = some.call(flags.parsedDateParts, i => i != null);
            isNowValid =
                flags.overflow < 0 && !flags.empty && !flags.invalidEra &&
                !flags.invalidMonth && !flags.invalidWeekday &&
                !flags.weekdayMismatch && !flags.nullInput &&
                !flags.invalidFormat && !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));
            if (m._strict) {
                isNowValid = isNowValid && flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
        }
        if (!Object.isFrozen(m)) m._isValid = isNowValid;
        return isNowValid || m._isValid;
    };

    const extend = (a, b) => {
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        if (b.hasOwnProperty('toString')) a.toString = b.toString;
        if (b.hasOwnProperty('valueOf')) a.valueOf = b.valueOf;
        return a;
    };

    const createInvalid = flags => {
        const m = createUTC(NaN);
        if (flags != null) extend(getParsingFlags(m), flags);
        else getParsingFlags(m).userInvalidated = true;
        return m;
    };

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    const isFunction = input => input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';

    const set = config => {
        for (let i in config) {
            if (hasOwnProperty.call(config, i)) {
                let prop = config[i];
                this['_' + i] = isFunction(prop) ? prop : prop;
            }
        }
        this._config = config;
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + /\d{1,2}/.source
        );
    };

    const getLocale = key => {
        const data = key && key._locale && key._locale._abbr ? key._locale._abbr : key;
        return data || globalLocale;
    };

    const createDuration = (input, key) => {
        let duration = input;
        if (isDuration(input)) {
            duration = { ms: input._milliseconds, d: input._days, M: input._months };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = { [key || 'milliseconds']: +input };
        } else if (input == null) {
            duration = {};
        } else if (typeof input === 'object' && ('from' in input || 'to' in input)) {
            duration = { ms: momentsDifference(createLocal(input.from), createLocal(input.to)).milliseconds, M: momentsDifference(createLocal(input.from), createLocal(input.to)).months };
        }
        return new Duration(duration);
    };

    const diff = input => momentsDifference(createLocal(input), this).milliseconds;

    const Duration = function (duration) {
        let normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors

        this._days = +days + weeks * 7;

        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    };

    const isDuration = obj => obj instanceof Duration;

    const absRound = number => Math.round(Math.abs(number));

    function daysToMonths(days) { return (days * 4800) / 146097; }

    function monthsToDays(months) { return (months * 146097) / 4800; }

    function addSubtract(duration, input, value, direction) {
        const other = createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
    }

    const add = createAdder(1, 'add');
    const subtract = createAdder(-1, 'subtract');

    const createAdder = (direction, name) => {
        return (val, period) => {
            let dur, tmp;
            if (period !== null && !isNaN(+period)) {
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);

            return this;
        };
    };

    hooks.updateOffset = function () {};

    const createLocalOrUTC = (input, format, locale, strict, isUTC) => {
        const c = {};
        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }
        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }
        if ((isObject(input) && isObjectEmpty(input)) || (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        return createFromConfig(c);
    };

    const createFromConfig = config => new Moment(checkOverflow(prepareConfig(config)));

    const makeGetSet = (unit, keepTime) => {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            }
            return get(this, unit);
        };
    };

    const set$1 = (mom, unit, value) => {
        const d = mom._d,
            isUTC = mom._isUTC;

        if (!mom.isValid() || isNaN(value)) {
            return;
        }

        switch (unit) {
            case 'Milliseconds':
                return void (isUTC ? d.setUTCMilliseconds(value) : d.setMilliseconds(value));
            case 'Seconds':
                return void (isUTC ? d.setUTCSeconds(value) : d.setSeconds(value));
            case 'Minutes':
                return void (isUTC ? d.setUTCMinutes(value) : d.setMinutes(value));
            case 'Hours':
                return void (isUTC ? d.setUTCHours(value) : d.setHours(value));
            case 'Date':
                return void (isUTC ? d.setUTCDate(value) : d.setDate(value));
            case 'FullYear':
                void (isUTC ? d.setUTCFullYear(value) : d.setFullYear(value));
                break;
        }
    };

    const get = (mom, unit) => {
        if (!mom.isValid()) return NaN;

        const d = mom._d,
            isUTC = mom._isUTC;

        switch (unit) {
            case 'Milliseconds':
                return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
            case 'Seconds':
                return isUTC ? d.getUTCSeconds() : d.getSeconds();
            case 'Minutes':
                return isUTC ? d.getUTCMinutes() : d.getMinutes();
            case 'Hours':
                return isUTC ? d.getUTCHours() : d.getHours();
            case 'Date':
                return isUTC ? d.getUTCDate() : d.getDate();
            case 'Month':
                return isUTC ? d.getUTCMonth() : d.getMonth();
            case 'FullYear':
                return isUTC ? d.getUTCFullYear() : d.getFullYear();
            default:
                return NaN;
        }
    };

    const checkOverflow = m => {
        const overflow = getParsingFlags(m).overflow;
        if (overflow !== -1 && overflow !== undefined) return NaN;
        return m;
    };

    const prepareConfig = config => {
        const input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);
        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    };

    const getSetOffset = (input, keepLocalTime, keepMinutes) => {
        const offset = this._offset || 0,
            localAdjust;

        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) return this;
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;

            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        }
        return this._isUTC ? offset : getDateOffset(this);
    };

    const duration = function (input, key) {
        let dura = input;
        const isTypedObject = isObject(input);
        if (isTypedObject && input._isAMomentObject != null) {
            dura = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months,
            };
        } else if (isNumber(input)) {
            dura = {};
            dura[key || 'milliseconds'] = +input;
        }
        return new Duration(dura);
    };

    const createDuration = (duration, key) => {
        const matching = /^(-|\+)?(?:\d+[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/.exec(duration);
        if (matching) {
            const teams = [
                matching[1] || '',
                parseInt(matching[2], 10),
                parseInt(matching[3], 10),
            ];
            if (matching[4]) teams.push(parseInt(matching[4], 10));
            if (matching[5]) teams.push(parseInt(absRound(+matching[5] * 1000), 10));
            return new Duration({
                hours: teams[1] * Math.sign(teams[0] || '+'),
                minutes: teams[2] * Math.sign(teams[0] || '+'),
                seconds: teams[3] * Math.sign(teams[0] || '+'),
                milliseconds: teams[4] * Math.sign(teams[0] || '+'),
            });
        }

        if (isObject(duration) && ('from' in duration || 'to' in duration)) {
            const diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
            return new Duration({
                ms: diffRes.milliseconds,
                M: diffRes.months,
            });
        }

        return new Duration({
            milliseconds: duration,
        });
    };

    const momentsDifference = (base, other) => {
        if (!(base.isValid() && other.isValid())) {
            return { months: 0, milliseconds: 0 };
        }
        const res = { months: 0, milliseconds: 0 };
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'months').isAfter(other)) {
                --res.months;
            }
            res.milliseconds = +other - +base.clone().add(res.months, 'months');
        } else {
            res.months = base.month() - other.month() + (base.year() - other.year()) * 12;
            if (other.clone().add(res.months, 'months').isAfter(base)) {
                --res.months;
            }
            res.milliseconds = +base - +other.clone().add(res.months, 'months');
        }
        return res;
    };

    function calendar$1(time, formats) {
        if (arguments.length === 1) {
            if (!arguments[0]) {
                return;
            }
            if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }

        const now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output = formats && (isFunction(formats[format])
                ? formats[format].call(this, now)
                : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    const toISOString = keepOffset => {
        if (!this.isValid()) return null;
        const utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(
                m,
                utc
                    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                    : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }
        if (isFunction(Date.prototype.toISOString)) {
            if (utc) return this.toDate().toISOString();
            return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                .toISOString()
                .replace('Z', formatMoment(m, 'Z'));
        }
        return formatMoment(
            m,
            utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
        );
    };

    const format = inputString => {
        if (!inputString) {
            inputString = this.isUtc()
                ? hooks.defaultFormatUtc
                : hooks.defaultFormat;
        }
        const output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    };

    const listLocales = () => {
        return keys(locales);
    };

    hookCallback = createLocal;

    return hooks;

}));
