"use strict";

(function (global) {
    // Utility for detecting the type of an object
    const _typeof = arg => typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? typeof arg : (arg && typeof Symbol === "function" && arg.constructor === Symbol && arg !== Symbol.prototype ? "symbol" : typeof arg);

    const dateFormat = (function () {
        // Regular expressions for parsing date format tokens
        const token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LlopSZWN]|"[^"]*"|'[^']*'/g;
        const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        const timezoneClip = /[^-+\dA-Z]/g;

        // Main formatting function
        return function (date, mask, utc, gmt) {
            // Handle when only one argument is passed and it's a string without digits
            if (arguments.length === 1 && kindOf(date) === "string" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Default to current date if `date` is undefined or null
            date = date || date === 0 ? date : new Date();

            // Parse `date` to a Date object if necessary
            if (!(date instanceof Date)) {
                date = new Date(date);
            }

            if (isNaN(date)) {
                throw TypeError("Invalid date");
            }

            // Select mask
            mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);

            // Handle UTC or GMT prefix in mask
            const maskSlice = mask.slice(0, 4);
            if (maskSlice === "UTC:" || maskSlice === "GMT:") {
                mask = mask.slice(4);
                utc = true;
                if (maskSlice === "GMT:") gmt = true;
            }

            // Helper functions to get various parts of the date
            const _ = () => utc ? "getUTC" : "get";
            const getValue = method => date[_() + method]();

            const flags = {
                d: () => getValue("Date"),
                dd: () => pad(getValue("Date")),
                ddd: () => dateFormat.i18n.dayNames[getValue("Day")],
                DDD: () => getDayName({y: getValue("FullYear"), m: getValue("Month"), D: getValue("Day"), _: _(), dayName: dateFormat.i18n.dayNames[getValue("Day")], short: true}),
                dddd: () => dateFormat.i18n.dayNames[getValue("Day") + 7],
                DDDD: () => getDayName({y: getValue("FullYear"), m: getValue("Month"), D: getValue("Day"), _: _(), dayName: dateFormat.i18n.dayNames[getValue("Day") + 7]}),
                m: () => getValue("Month") + 1,
                mm: () => pad(getValue("Month") + 1),
                mmm: () => dateFormat.i18n.monthNames[getValue("Month")],
                mmmm: () => dateFormat.i18n.monthNames[getValue("Month") + 12],
                yy: () => String(getValue("FullYear")).slice(2),
                yyyy: () => pad(getValue("FullYear"), 4),
                h: () => getValue("Hours") % 12 || 12,
                hh: () => pad(getValue("Hours") % 12 || 12),
                H: () => getValue("Hours"),
                HH: () => pad(getValue("Hours")),
                M: () => getValue("Minutes"),
                MM: () => pad(getValue("Minutes")),
                s: () => getValue("Seconds"),
                ss: () => pad(getValue("Seconds")),
                l: () => pad(getValue("Milliseconds"), 3),
                L: () => pad(Math.floor(getValue("Milliseconds") / 10)),
                t: () => dateFormat.i18n.timeNames[getValue("Hours") < 12 ? 0 : 1],
                tt: () => dateFormat.i18n.timeNames[getValue("Hours") < 12 ? 2 : 3],
                T: () => dateFormat.i18n.timeNames[getValue("Hours") < 12 ? 4 : 5],
                TT: () => dateFormat.i18n.timeNames[getValue("Hours") < 12 ? 6 : 7],
                Z: () => gmt ? "GMT" : (utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC")),
                o: () => {
                    const o = utc ? 0 : date.getTimezoneOffset();
                    return (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
                },
                p: () => {
                    const o = utc ? 0 : date.getTimezoneOffset();
                    return (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60), 2) + ":" + pad(Math.floor(Math.abs(o) % 60), 2);
                },
                S: () => ["th", "st", "nd", "rd"][getValue("Date") % 10 > 3 ? 0 : (getValue("Date") % 100 - getValue("Date") % 10 != 10) * getValue("Date") % 10],
                W: () => getWeek(date),
                N: () => getDayOfWeek(date)
            };

            return mask.replace(token, match => flags[match] ? flags[match]() : match.slice(1, match.length - 1));
        };
    })();

    // Predefined masks
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
        isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
        expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z"
    };

    // Localization data
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ],
        timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
    };

    // Utility functions
    const pad = (val, len) => {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    };

    const getDayName = ({ y, m, D, _, dayName, short = false }) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today[_ + "Date"]() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(today[_ + "Date"]() + 1);

        if (today[_ + "FullYear"]() === y && today[_ + "Month"]() === m && today[_ + "Date"]() === D) return short ? "Tdy" : "Today";
        if (yesterday[_ + "FullYear"]() === y && yesterday[_ + "Month"]() === m && yesterday[_ + "Date"]() === D) return short ? "Ysd" : "Yesterday";
        if (tomorrow[_ + "FullYear"]() === y && tomorrow[_ + "Month"]() === m && tomorrow[_ + "Date"]() === D) return short ? "Tmw" : "Tomorrow";

        return dayName;
    };

    const getWeek = (date) => {
        const targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);
        
        const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
        firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);

        const ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
        targetThursday.setHours(targetThursday.getHours() - ds);

        const weekDiff = (targetThursday - firstThursday) / (864e5 * 7);
        return 1 + Math.floor(weekDiff);
    };

    const getDayOfWeek = (date) => {
        let dow = date.getDay();
        return dow === 0 ? 7 : dow;
    };

    const kindOf = (val) => {
        if (val === null) return "null";
        if (val === undefined) return "undefined";
        if (_typeof(val) !== "object") return _typeof(val);
        if (Array.isArray(val)) return "array";
        return {}.toString.call(val).slice(8, -1).toLowerCase();
    };

    // Export module
    if (typeof define === "function" && define.amd) {
        define(() => dateFormat);
    } else if (typeof exports === "object") {
        module.exports = dateFormat;
    } else {
        global.dateFormat = dateFormat;
    }
})(typeof window === "undefined" ? global : window);
