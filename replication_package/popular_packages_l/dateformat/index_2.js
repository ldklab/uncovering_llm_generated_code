// Define internationalization strings for days, months, and time periods
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

// Define date and time formats with templates
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

// Function to pad a number with leading zeros
function pad(value, length = 2) {
    value = String(value);
    while (value.length < length) value = "0" + value;
    return value;
}

// Main function to format the date according to a mask
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

    const methodPrefix = utc ? "getUTC" : "get";
    const day = date[methodPrefix + "Date"](),
        weekDay = date[methodPrefix + "Day"](),
        month = date[methodPrefix + "Month"](),
        year = date[methodPrefix + "FullYear"](),
        hours = date[methodPrefix + "Hours"](),
        minutes = date[methodPrefix + "Minutes"](),
        seconds = date[methodPrefix + "Seconds"](),
        milliseconds = date[methodPrefix + "Milliseconds"](),
        timezoneOffset = utc ? 0 : date.getTimezoneOffset(),
        now = new Date(),
        weekDayNames = i18n.dayNames,
        monthNames = i18n.monthNames,
        amPm = i18n.timeNames,
        flags = {
            d: day,
            dd: pad(day),
            ddd: weekDayNames[weekDay],
            DDD: weekDay === (now.getDay() + 6) % 7 ? "Yesterday" : weekDay === now.getDay() ? "Today" : weekDay === (now.getDay() + 1) % 7 ? "Tomorrow" : weekDayNames[weekDay],
            dddd: weekDayNames[weekDay + 7],
            DDDD: weekDay === (now.getDay() + 6) % 7 ? "Yesterday" : weekDay === now.getDay() ? "Today" : weekDay === (now.getDay() + 1) % 7 ? "Tomorrow" : weekDayNames[weekDay + 7],
            m: month + 1,
            mm: pad(month + 1),
            mmm: monthNames[month],
            mmmm: monthNames[month + 12],
            yy: String(year).slice(2),
            yyyy: year,
            h: hours % 12 || 12,
            hh: pad(hours % 12 || 12),
            H: hours,
            HH: pad(hours),
            M: minutes,
            MM: pad(minutes),
            s: seconds,
            ss: pad(seconds),
            l: pad(milliseconds, 3),
            L: pad(Math.round(milliseconds / 10)),
            t: hours < 12 ? amPm[0] : amPm[1],
            tt: hours < 12 ? amPm[2] : amPm[3],
            T: hours < 12 ? amPm[4] : amPm[5],
            TT: hours < 12 ? amPm[6] : amPm[7],
            Z: utc ? "UTC" : (String(date).match(/\(([\w\s]+)\)/) || [])[1] || "", 
            o: (timezoneOffset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(timezoneOffset) / 60) * 100 + Math.abs(timezoneOffset) % 60, 4),
            p: (timezoneOffset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(timezoneOffset) / 60)) + ":" + pad(Math.abs(timezoneOffset) % 60),
            S: ["th", "st", "nd", "rd"][(day % 10 > 3 || (day % 100 - day % 10) / 10 === 1) ? 0 : day % 10],
            W: Math.ceil((((new Date(Date.UTC(year, month, day)).getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + new Date(Date.UTC(year, 0, 1)).getDay() + 1) / 7),
            N: weekDay || 7
        };

    return mask.replace(/'([^']+)'|"([^"]+)"|%(.)|([a-z])\1*|./gi, function (match) {
        return match in flags ? flags[match] : match.slice(1, match.length - 1);
    });
}

export { i18n, masks };
export default dateFormat;
