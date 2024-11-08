const i18n = {
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

const masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
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
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

function pad(val, len = 2) {
    return String(val).padStart(len, "0");
}

function dateFormat(date, mask, utc) {
    if (arguments.length === 1 && typeof date === "string" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }

    date = date ? new Date(date) : new Date();
    if (isNaN(date)) throw TypeError("Invalid date");

    mask = String(masks[mask] || mask || masks["default"]);
    if (mask.startsWith("UTC:")) {
        mask = mask.slice(4);
        utc = true;
    }

    const _ = utc ? "getUTC" : "get";
    const d = date[`${_}Date`](),
          D = date[`${_}Day`](),
          m = date[`${_}Month`](),
          y = date[`${_}FullYear`](),
          H = date[`${_}Hours`](),
          M = date[`${_}Minutes`](),
          s = date[`${_}Seconds`](),
          L = date[`${_}Milliseconds`](),
          o = utc ? 0 : date.getTimezoneOffset();

    const flags = {
        d: d,
        dd: pad(d),
        ddd: i18n.dayNames[D],
        DDD: ["Yesterday", "Today", "Tomorrow"][((D - new Date().getDay() + 3) % 3 + 3) % 3] || i18n.dayNames[D],
        dddd: i18n.dayNames[D + 7],
        DDDD: ["Yesterday", "Today", "Tomorrow"][((D - new Date().getDay() + 3) % 3 + 3) % 3] || i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: i18n.monthNames[m],
        mmmm: i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(Math.round(L / 10)),
        t: H < 12 ? i18n.timeNames[0] : i18n.timeNames[1],
        tt: H < 12 ? i18n.timeNames[2] : i18n.timeNames[3],
        T: H < 12 ? i18n.timeNames[4] : i18n.timeNames[5],
        TT: H < 12 ? i18n.timeNames[6] : i18n.timeNames[7],
        Z: utc ? "UTC" : (String(date).match(/\(([\w\s]+)\)/) || [])[1] || "",
        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        p: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60)) + ":" + pad(Math.abs(o) % 60),
        S: ["th", "st", "nd", "rd"][(d % 10 > 3 || (d % 100 - d % 10) === 10) ? 0 : d % 10],
        W: Math.ceil((((new Date(Date.UTC(y, m, d)).getTime() - new Date(Date.UTC(y, 0, 1)).getTime()) / 86400000) + new Date(Date.UTC(y, 0, 1)).getDay() + 1) / 7),
        N: D || 7
    };

    return mask.replace(/'([^']+)'|"([^"]+)"|%([a-zA-Z])\1*|./g, function ($0) {
        return flags[$0] !== undefined ? flags[$0] : $0.slice(1, $0.length - 1);
    });
}

export { i18n, masks };
export default dateFormat;
