(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory();
}(this, (function () {
    'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isDate(input) {
        return (
            input instanceof Date ||
            Object.prototype.toString.call(input) === '[object Date]'
        );
    }

    function extend(a, b) {
        for (var i in b) {
            if (Object.prototype.hasOwnProperty.call(b, i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function createInvalid(flags) {
        return createUTC(NaN);
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createFromConfig(config) {
        var res = new Moment(config);
        if (res._nextDay) {
            res.add(1, 'd');
            res._nextDay = undefined;
        }
        return res;
    }

    function Moment(config) {
        this._isAMomentObject = true;
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
    }

    Moment.prototype.isValid = function () {
        return !isNaN(this._d.getTime());
    };

    Moment.prototype.add = function (value, unit) {
        if (!this.isValid()) return this;
        var duration = createDuration(value, unit);
        addSubtract(this, duration, 1);
        return this;
    };

    function addSubtract(mom, duration, isAdding) {
        var milliseconds = duration._milliseconds;
        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        return mom;
    }

    function createDuration(input, unit) {
        var duration = {
            _milliseconds: parseFloat(input),
        };
        return duration;
    }

    Moment.prototype.format = function (format) {
        if (!this.isValid()) {
            return "Invalid date";
        }
        var formatted = this._d.toISOString(); // Simplified format assuming basic ISO
        return formatted;
    };

    return hooks;

})));
