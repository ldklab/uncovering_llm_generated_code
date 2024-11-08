'use strict';

const FILESIZE_CONSTANTS = {
    ARRAY: "array",
    BIT: "bit",
    BITS: "bits",
    BYTE: "byte",
    BYTES: "bytes",
    EMPTY: "",
    EXPONENT: "exponent",
    FUNCTION: "function",
    IEC: "iec",
    INVALID_NUMBER: "Invalid number",
    INVALID_ROUND: "Invalid rounding method",
    JEDEC: "jedec",
    OBJECT: "object",
    PERIOD: ".",
    ROUND: "round",
    S: "s",
    SI: "si",
    SI_KBIT: "kbit",
    SI_KBYTE: "kB",
    SPACE: " ",
    STRING: "string",
    ZERO: "0",
    STRINGS: {
        symbol: {
            iec: {
                bits: ["bit", "Kibit", "Mibit", "Gibit", "Tibit", "Pibit", "Eibit", "Zibit", "Yibit"],
                bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
            },
            jedec: {
                bits: ["bit", "Kbit", "Mbit", "Gbit", "Tbit", "Pbit", "Ebit", "Zbit", "Ybit"],
                bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
            }
        },
        fullform: {
            iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
            jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
        }
    }
};

function calculateFilesize(arg, options = {}) {
    const {
        bits = false,
        pad = false,
        base = -1,
        round = 2,
        locale = FILESIZE_CONSTANTS.EMPTY,
        localeOptions = {},
        separator = FILESIZE_CONSTANTS.EMPTY,
        spacer = FILESIZE_CONSTANTS.SPACE,
        symbols = {},
        standard = FILESIZE_CONSTANTS.EMPTY,
        output = FILESIZE_CONSTANTS.STRING,
        fullform = false,
        fullforms = [],
        exponent = -1,
        roundingMethod = FILESIZE_CONSTANTS.ROUND,
        precision = 0
    } = options;

    let e = exponent;
    let num = Number(arg);
    let result = [];
    let val = 0;
    let u = FILESIZE_CONSTANTS.EMPTY;

    // Synchronizing base & standard
    if (standard === FILESIZE_CONSTANTS.SI) {
        base = 10;
        standard = FILESIZE_CONSTANTS.JEDEC;
    } else if (standard === FILESIZE_CONSTANTS.IEC || standard === FILESIZE_CONSTANTS.JEDEC) {
        base = 2;
    } else if (base === 2) {
        standard = FILESIZE_CONSTANTS.IEC;
    } else {
        base = 10;
        standard = FILESIZE_CONSTANTS.JEDEC;
    }

    const ceil = base === 10 ? 1000 : 1024;
    const full = fullform === true;
    const neg = num < 0;
    const roundingFunc = Math[roundingMethod];

    if (typeof arg !== "bigint" && isNaN(arg)) {
        throw new TypeError(FILESIZE_CONSTANTS.INVALID_NUMBER);
    }

    if (typeof roundingFunc !== FILESIZE_CONSTANTS.FUNCTION) {
        throw new TypeError(FILESIZE_CONSTANTS.INVALID_ROUND);
    }

    if (neg) {
        num = -num;
    }

    if (e === -1 || isNaN(e)) {
        e = Math.floor(Math.log(num) / Math.log(ceil));
        if (e < 0) {
            e = 0;
        }
    }

    if (e > 8) {
        if (precision > 0) {
            precision += 8 - e;
        }
        e = 8;
    }

    if (output === FILESIZE_CONSTANTS.EXPONENT) {
        return e;
    }

    if (num === 0) {
        result[0] = 0;
        u = result[1] = FILESIZE_CONSTANTS.STRINGS.symbol[standard][bits ? FILESIZE_CONSTANTS.BITS : FILESIZE_CONSTANTS.BYTES][e];
    } else {
        val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));

        if (bits) {
            val = val * 8;
            if (val >= ceil && e < 8) {
                val = val / ceil;
                e++;
            }
        }

        const p = Math.pow(10, e > 0 ? round : 0);
        result[0] = roundingFunc(val * p) / p;

        if (result[0] === ceil && e < 8 && exponent === -1) {
            result[0] = 1;
            e++;
        }

        u = result[1] = base === 10 && e === 1 ? bits ? FILESIZE_CONSTANTS.SI_KBIT : FILESIZE_CONSTANTS.SI_KBYTE : FILESIZE_CONSTANTS.STRINGS.symbol[standard][bits ? FILESIZE_CONSTANTS.BITS : FILESIZE_CONSTANTS.BYTES][e];
    }

    if (neg) {
        result[0] = -result[0];
    }

    if (precision > 0) {
        result[0] = result[0].toPrecision(precision);
    }

    result[1] = symbols[result[1]] || result[1];

    if (locale === true) {
        result[0] = result[0].toLocaleString();
    } else if (locale.length > 0) {
        result[0] = result[0].toLocaleString(locale, localeOptions);
    } else if (separator.length > 0) {
        result[0] = result[0].toString().replace(FILESIZE_CONSTANTS.PERIOD, separator);
    }

    if (pad && round > 0) {
        const i = result[0].toString();
        const x = separator || ((i.match(/(\D)/g) || []).pop() || FILESIZE_CONSTANTS.PERIOD);
        const tmp = i.toString().split(x);
        const s = tmp[1] || FILESIZE_CONSTANTS.EMPTY;
        const l = s.length;
        const n = round - l;

        result[0] = `${tmp[0]}${x}${s.padEnd(l + n, FILESIZE_CONSTANTS.ZERO)}`;
    }

    if (full) {
        result[1] = fullforms[e] ? fullforms[e] : FILESIZE_CONSTANTS.STRINGS.fullform[standard][e] + (bits ? FILESIZE_CONSTANTS.BIT : FILESIZE_CONSTANTS.BYTE) + (result[0] === 1 ? FILESIZE_CONSTANTS.EMPTY : FILESIZE_CONSTANTS.S);
    }

    return output === FILESIZE_CONSTANTS.ARRAY ? result : output === FILESIZE_CONSTANTS.OBJECT ? {
        value: result[0],
        symbol: result[1],
        exponent: e,
        unit: u
    } : result.join(spacer);
}

function createPartialFilesizeCalculator(options = {}) {
    return arg => calculateFilesize(arg, options);
}

exports.filesize = calculateFilesize;
exports.partial = createPartialFilesizeCalculator;
