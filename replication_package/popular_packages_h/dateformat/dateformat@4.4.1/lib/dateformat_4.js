"use strict";

(function (global) {
  const dateFormat = function () {
    const token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LlopSZWN]|"[^"]*"|'[^']*'/g;
    const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    const timezoneClip = /[^-+\dA-Z]/g;

    return function (date, mask, utc, gmt) {
      if (arguments.length === 1 && typeof date === "string" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      date = date || date === 0 ? date : new Date();
      if (!(date instanceof Date)) date = new Date(date);
      if (isNaN(date)) throw TypeError("Invalid date");

      mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);

      const maskSlice = mask.slice(0, 4);
      if (maskSlice === "UTC:" || maskSlice === "GMT:") {
        mask = mask.slice(4);
        utc = true;
        gmt = maskSlice === "GMT:";
      }

      const _ = () => (utc ? "getUTC" : "get");
      const _d = () => date[_() + "Date"]();
      const D = () => date[_() + "Day"]();
      const _m = () => date[_() + "Month"]();
      const y = () => date[_() + "FullYear"]();
      const _H = () => date[_() + "Hours"]();
      const _M = () => date[_() + "Minutes"]();
      const _s = () => date[_() + "Seconds"]();
      const _L = () => date[_() + "Milliseconds"]();
      const _o = () => (utc ? 0 : date.getTimezoneOffset());
      const _W = () => getWeek(date);
      const _N = () => getDayOfWeek(date);

      const flags = {
        d: () => _d(),
        dd: () => pad(_d()),
        ddd: () => dateFormat.i18n.dayNames[D()],
        DDD: () => getDayName({ y: y(), m: _m(), D: D(), _: _(), dayName: dateFormat.i18n.dayNames[D()], short: true }),
        dddd: () => dateFormat.i18n.dayNames[D() + 7],
        DDDD: () => getDayName({ y: y(), m: _m(), D: D(), _: _(), dayName: dateFormat.i18n.dayNames[D() + 7] }),
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
        t: () => (_H() < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1]),
        tt: () => (_H() < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3]),
        T: () => (_H() < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5]),
        TT: () => (_H() < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7]),
        Z: () => gmt ? "GMT" : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC"),
        o: () => ((_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60) * 100 + Math.abs(_o()) % 60, 4)),
        p: () => ((_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60), 2) + ":" + pad(Math.floor(Math.abs(_o()) % 60), 2)),
        S: () => ["th", "st", "nd", "rd"][_d() % 10 > 3 ? 0 : (_d() % 100 - _d() % 10 != 10) * _d() % 10],
        W: () => _W(),
        N: () => _N()
      };

      return mask.replace(token, function (match) {
        if (match in flags) return flags[match]();
        return match.slice(1, match.length - 1);
      });
    };
  }();

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

  dateFormat.i18n = {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
  };

  const pad = (val, len = 2) => {
    val = String(val);
    while (val.length < len) val = "0" + val;
    return val;
  };

  const getDayName = ({ y, m, D, _, dayName, short = false }) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday[_ + "Date"]() - 1);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow[_ + "Date"]() + 1);

    const todayCheck = today[_ + "Day"]() === D && today[_ + "Month"]() === m && today[_ + "FullYear"]() === y;
    const yesterdayCheck = yesterday[_ + "Day"]() === D && yesterday[_ + "Month"]() === m && yesterday[_ + "FullYear"]() === y;
    const tomorrowCheck = tomorrow[_ + "Day"]() === D && tomorrow[_ + "Month"]() === m && tomorrow[_ + "FullYear"]() === y;

    if (todayCheck) return short ? "Tdy" : "Today";
    if (yesterdayCheck) return short ? "Ysd" : "Yesterday";
    if (tomorrowCheck) return short ? "Tmw" : "Tomorrow";

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
    if (dow === 0) dow = 7;
    return dow;
  };

  if (typeof define === "function" && define.amd) {
    define(() => dateFormat);
  } else if (typeof exports === "object") {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : this);
