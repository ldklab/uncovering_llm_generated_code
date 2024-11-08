(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        root.moment = factory();
    }
}(this, function () {
    'use strict';

    let hookCallback, momentProperties = [], globalLocale;
    let locales = {}, updateInProgress = false;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Array.isArray(input);
    }

    function isObject(input) {
        return input !== null && typeof input === 'object';
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number';
    }

    function isFunction(input) {
        return typeof input === 'function';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
    }

    function extend(a, b) {
        for (let i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }
        if (hasOwnProp(b, 'toString')) a.toString = b.toString;
        if (hasOwnProp(b, 'valueOf')) a.valueOf = b.valueOf;
        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        return {
            overflow: -2,
            empty: false,
            invalidFormat: false,
            nullInput: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            rfc2822: false,
            weekdayMismatch: false
        };
    }

    function getParsingFlags(m) {
        if (!m._pf) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    const some = Array.prototype.some;

    function isValid(m) {
        let flags = getParsingFlags(m), parsedParts = some.call(flags.parsedDateParts, (i) => i !== null);

        if (m._d && !isNaN(m._d.getTime())) {
            isNowValid = flags.overflow < 0 && !flags.empty && !flags.invalidFormat && !flags.nullInput && !flags.userInvalidated && (!flags.meridiem || (flags.meridiem && parsedParts));
            if (m._strict) {
                isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
            m._isValid = isNowValid;
        } else {
            return isNowValid;
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        let m = createUTC(NaN);
        if (flags !== null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }
        return m;
    }

    function copyConfig(to, from) {
        let i, prop, val, momentPropertiesLen = momentProperties.length;
        ['_isAMomentObject', '_i', '_f', '_l', '_strict', '_tzm', '_isUTC', '_offset', '_pf', '_locale']
        .forEach(prop => {
            if (!isUndefined(from[prop])) {
                to[prop] = from[prop];
            }
        });

        if (momentPropertiesLen > 0) {
            for (i = 0; i < momentPropertiesLen; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }
        return to;
    }

    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d !== null ? config._d.getTime() : NaN);
        if (!this.isValid()) this._d = new Date(NaN);
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || (obj !== null && obj._isAMomentObject !== null);
    }

    function warn(msg) {
        if (!hooks.suppressDeprecationWarnings && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        let firstTime = true;
        return extend(function () {
            if (hooks.deprecationHandler !== null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                let args = [];
                for (let i = 0; i < arguments.length; i++) {
                    args.push(typeof arguments[i] === 'object' ? '\n[' + i + '] ' + Object.keys(arguments[0]).map(k => `${k}: ${arguments[0][k]}`) : arguments[i]);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + new Error().stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function isFunction(input) {
        return typeof input === 'function' || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set(config) {
        for (let i in config) {
            if (hasOwnProp(config, i)) {
                if (isFunction(config[i])) {
                    this[i] = config[i];
                } else {
                    this['_' + i] = config[i];
                }
            }
        }
        this._config = config;
        this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + '|' + /\d{1,2}/.source);
    }

    function Locale(config) {
        if (config !== null) {
            this.set(config);
        }
    }

    function calendar(key, mom, now) {
        const output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
        return formatFunctions[format](m);
    }

    hooks.version = '2.30.1';
    setHookCallback(createLocal);
    hooks.fn = Moment.prototype;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;

    return hooks;
}));
