"use strict";

// Helper function to determine the type of an object
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        return typeof obj;
    } else {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }
}

// Date formatting utility function
(function(global) {
    var dateFormat = function() {
        // Regular expressions for parsing tokens and timezones
        var token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LlopSZWN]|"[^"]*"|'[^']*'/g;
        var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        var timezoneClip = /[^-+\dA-Z]/g;

        // Main date formatting function
        return function(date, mask, utc, gmt) {
            if (arguments.length === 1 && kindOf(date) === "string" && !/\d/.test(date)) {
                // If only a mask is provided as a string without digits
                mask = date;
                date = undefined;
            }

            // Initialize date
            date = date || date === 0 ? date : new Date;
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            if (isNaN(date)) {
                throw TypeError("Invalid date");
            }

            // Get mask pattern
            mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);
            var maskSlice = mask.slice(0, 4);
            if (maskSlice === "UTC:" || maskSlice === "GMT:") {
                mask = mask.slice(4);
                utc = true;
                if (maskSlice === "GMT:") {
                    gmt = true;
                }
            }

            // Helper functions to get date components
            var _ = () => utc ? "getUTC" : "get";
            var _d = () => date[_() + "Date"]();
            var D = () => date[_() + "Day"]();
            var _m = () => date[_() + "Month"]();
            var y = () => date[_() + "FullYear"]();
            var _H = () => date[_() + "Hours"]();
            var _M = () => date[_() + "Minutes"]();
            var _s = () => date[_() + "Seconds"]();
            var _L = () => date[_() + "Milliseconds"]();
            var _o = () => utc ? 0 : date.getTimezoneOffset();
            var _W = () => getWeek(date);
            var _N = () => getDayOfWeek(date);

            // Flags mapping functions for date components
            var flags = {
                d: () => _d(),
                dd: () => pad(_d()),
                ddd: () => dateFormat.i18n.dayNames[D()],
                DDD: () => getDayName({ y: y(), m: _m(), D: D(), _: _, dayName: dateFormat.i18n.dayNames[D()], short: true }),
                dddd: () => dateFormat.i18n.dayNames[D() + 7],
                DDDD: () => getDayName({ y: y(), m: _m(), D: D(), _: _, dayName: dateFormat.i18n.dayNames[D() + 7] }),
                m: () => _m() + 1,
                mm: () => pad(_m() + 1),
                mmm: () => dateFormat.i18n.monthNames[_m()],
                mmmm: () => dateFormat.i18n.monthNames[_m() + 12],
                yy: () => String(y()).slice(2),
                yyyy: () => pad(y(), 4),
                h: () => _H() % 12 || 12,
                hh: () => pad(_H() % 12 || 12),
                H: () => _H(),
                HH: () => pad(_H()),
                M: () => _M(),
                MM: () => pad(_M()),
                s: () => _s(),
                ss: () => pad(_s()),
                l: () => pad(_L(), 3),
                L: () => pad(Math.floor(_L() / 10)),
                t: () => _H() < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
                tt: () => _H() < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
                T: () => _H() < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
                TT: () => _H() < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
                Z: () => gmt ? "GMT" : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC"),
                o: () => (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60) * 100 + Math.abs(_o()) % 60, 4),
                p: () => (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60), 2) + ":" + pad(Math.floor(Math.abs(_o()) % 60), 2),
                S: () => ["th", "st", "nd", "rd"][_d() % 10 > 3 ? 0 : (_d() % 100 - _d() % 10 != 10) * _d() % 10],
                W: () => _W(),
                N: () => _N()
            };

            // Replace mask tokens with respective values
            return mask.replace(token, function(match) {
                if (match in flags) {
                    return flags[match]();
                }
                return match.slice(1, match.length - 1);
            });
        };
    }();

    // Predefined date format masks
    dateFormat.masks = {
        default: "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        paddedShortDate: "mm/dd/yyyy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
        expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z"
    };

    // Internationalization for day and month names
    dateFormat.i18n = {
        dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
    };

    // Helper function for padding numbers
    var pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
            val = "0" + val;
        }
        return val;
    };

    // Helper function to get day name based on conditions
    var getDayName = function({ y, m, D, _, dayName, short = false }) {
        var today = new Date;
        var yesterday = new Date;
        yesterday.setDate(yesterday[_ + "Date"]() - 1);
        var tomorrow = new Date;
        tomorrow.setDate(tomorrow[_ + "Date"]() + 1);

        if (today[_ + "FullYear"]() === y && today[_ + "Month"]() === m && today[_ + "Day"]() === D) {
            return short ? "Tdy" : "Today";
        } else if (yesterday[_ + "FullYear"]() === y && yesterday[_ + "Month"]() === m && yesterday[_ + "Day"]() === D) {
            return short ? "Ysd" : "Yesterday";
        } else if (tomorrow[_ + "FullYear"]() === y && tomorrow[_ + "Month"]() === m && tomorrow[_ + "Day"]() === D) {
            return short ? "Tmw" : "Tomorrow";
        }
        return dayName;
    };

    // Calculate ISO week number
    var getWeek = function(date) {
        var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);
        var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
        firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);
        var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
        targetThursday.setHours(targetThursday.getHours() - ds);
        var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
        return 1 + Math.floor(weekDiff);
    };

    // Calculate day of the week
    var getDayOfWeek = function(date) {
        var dow = date.getDay();
        if (dow === 0) { dow = 7; }
        return dow;
    };

    // Helper to determine type of a value
    var kindOf = function(val) {
        if (val === null) { return "null"; }
        if (val === undefined) { return "undefined"; }
        if (_typeof(val) !== "object") { return _typeof(val); }
        if (Array.isArray(val)) { return "array"; }
        return {}.toString.call(val).slice(8, -1).toLowerCase();
    };

    // Export dateFormat function based on the environment (AMD, CommonJS, or global)
    if (typeof define === "function" && define.amd) {
        define(() => dateFormat);
    } else if (typeof exports === "object") {
        module.exports = dateFormat;
    } else {
        global.dateFormat = dateFormat;
    }
})(typeof global !== "undefined" ? global : window);
