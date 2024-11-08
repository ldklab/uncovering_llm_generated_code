const token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
const timezone = /\b(?:[A-Z]{1,3}[A-Z][TC])(?:[-+]\d{4})?|((?:Australian )?(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time)\b/g;
const timezoneClip = /[^-+\dA-Z]/g;

export default function dateFormat(date, mask, utc, gmt) {
    if (arguments.length === 1 && typeof date === "string" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }
    date = date || date === 0 ? date : new Date;
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) throw TypeError("Invalid date");

    mask = String(masks[mask] || mask || masks["default"]);
    const maskSlice = mask.slice(0, 4);
    if (maskSlice === "UTC:" || maskSlice === "GMT:") {
        mask = mask.slice(4);
        utc = true;
        if (maskSlice === "GMT:") gmt = true;
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
        ddd: () => i18n.dayNames[D()],
        DDD: () => getDayName({ y: y(), m: _m(), d: _d(), _: _(), dayName: i18n.dayNames[D()], short: true }),
        dddd: () => i18n.dayNames[D() + 7],
        DDDD: () => getDayName({ y: y(), m: _m(), d: _d(), _: _(), dayName: i18n.dayNames[D() + 7] }),
        m: () => _m() + 1,
        mm: () => pad(_m() + 1),
        mmm: () => i18n.monthNames[_m()],
        mmmm: () => i18n.monthNames[_m() + 12],
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
        t: () => (_H() < 12 ? i18n.timeNames[0] : i18n.timeNames[1]),
        tt: () => (_H() < 12 ? i18n.timeNames[2] : i18n.timeNames[3]),
        T: () => (_H() < 12 ? i18n.timeNames[4] : i18n.timeNames[5]),
        TT: () => (_H() < 12 ? i18n.timeNames[6] : i18n.timeNames[7]),
        Z: () => (gmt ? "GMT" : utc ? "UTC" : formatTimezone(date)),
        o: () => ((_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60) * 100 + Math.abs(_o()) % 60, 4)),
        p: () => ((_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60), 2) + ":" + pad(Math.floor(Math.abs(_o()) % 60), 2)),
        S: () => ["th", "st", "nd", "rd"][_d() % 10 > 3 ? 0 : (_d() % 100 - _d() % 10 != 10) * _d() % 10],
        W: () => _W(),
        WW: () => pad(_W()),
        N: () => _N()
    };

    return mask.replace(token, (match) => {
        if (match in flags) return flags[match]();
        return match.slice(1, match.length - 1);
    });
}

export const masks = {
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

export const i18n = {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
};

const pad = (val, len = 2) => String(val).padStart(len, "0");

const getDayName = ({ y, m, d, _, dayName, short = false }) => {
    const today = new Date;
    const yesterday = new Date;
    yesterday.setDate(yesterday[_ + "Date"]() - 1);
    const tomorrow = new Date;
    tomorrow.setDate(tomorrow[_ + "Date"]() + 1);

    const today_d = () => today[_ + "Date"]();
    const today_m = () => today[_ + "Month"]();
    const today_y = () => today[_ + "FullYear"]();

    const yesterday_d = () => yesterday[_ + "Date"]();
    const yesterday_m = () => yesterday[_ + "Month"]();
    const yesterday_y = () => yesterday[_ + "FullYear"]();

    const tomorrow_d = () => tomorrow[_ + "Date"]();
    const tomorrow_m = () => tomorrow[_ + "Month"]();
    const tomorrow_y = () => tomorrow[_ + "FullYear"]();

    if (today_y() === y && today_m() === m && today_d() === d) return short ? "Tdy" : "Today";
    if (yesterday_y() === y && yesterday_m() === m && yesterday_d() === d) return short ? "Ysd" : "Yesterday";
    if (tomorrow_y() === y && tomorrow_m() === m && tomorrow_d() === d) return short ? "Tmw" : "Tomorrow";
    
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

export const formatTimezone = (date) => {
    return (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC");
};
