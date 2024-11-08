/**
 * filesize
 *
 * @copyright 2024 Jason Mulligan
 * @license BSD-3-Clause
 * @version 10.1.6
 */
'use strict';

const CONSTANTS = {
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
    ZERO: "0"
};

const STRINGS = {
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
};

function filesize(arg, options = {}) {
    const {
        bits = false,
        pad = false,
        base = -1,
        round = 2,
        locale = CONSTANTS.EMPTY,
        localeOptions = {},
        separator = CONSTANTS.EMPTY,
        spacer = CONSTANTS.SPACE,
        symbols = {},
        standard = CONSTANTS.EMPTY,
        output = CONSTANTS.STRING,
        fullform = false,
        fullforms = [],
        exponent = -1,
        roundingMethod = CONSTANTS.ROUND,
        precision = 0
    } = options;

    let e = exponent,
        num = Number(arg),
        result = [],
        val = 0,
        u = CONSTANTS.EMPTY;

    if (standard === CONSTANTS.SI) {
        base = 10;
        standard = CONSTANTS.JEDEC;
    } else if (standard === CONSTANTS.IEC || standard === CONSTANTS.JEDEC) {
        base = 2;
    } else if (base === 2) {
        standard = CONSTANTS.IEC;
    } else {
        base = 10;
        standard = CONSTANTS.JEDEC;
    }

    const ceil = base === 10 ? 1000 : 1024,
        full = fullform,
        neg = num < 0,
        roundingFunc = Math[roundingMethod];

    if (typeof arg !== "bigint" && isNaN(arg)) {
        throw new TypeError(CONSTANTS.INVALID_NUMBER);
    }

    if (typeof roundingFunc !== CONSTANTS.FUNCTION) {
        throw new TypeError(CONSTANTS.INVALID_ROUND);
    }

    if (neg) num = -num;

    if (e === -1 || isNaN(e)) {
        e = Math.floor(Math.log(num) / Math.log(ceil));
        if (e < 0) e = 0;
    }

    if (e > 8 && precision > 0) precision += 8 - e;

    if (output === CONSTANTS.EXPONENT) {
        return e;
    }

    if (num === 0) {
        result[0] = 0;
        u = result[1] = STRINGS.symbol[standard][bits ? CONSTANTS.BITS : CONSTANTS.BYTES][e];
    } else {
        val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));

        if (bits) {
            val *= 8;
            if (val >= ceil && e < 8) {
                val /= ceil;
                e++;
            }
        }

        const p = Math.pow(10, e > 0 ? round : 0);
        result[0] = roundingFunc(val * p) / p;

        if (result[0] === ceil && e < 8 && exponent === -1) {
            result[0] = 1;
            e++;
        }

        u = result[1] = base === 10 && e === 1 ? bits ? CONSTANTS.SI_KBIT : CONSTANTS.SI_KBYTE : STRINGS.symbol[standard][bits ? CONSTANTS.BITS : CONSTANTS.BYTES][e];
    }

    if (neg) result[0] = -result[0];

    if (precision > 0) {
        result[0] = result[0].toPrecision(precision);
    }

    result[1] = symbols[result[1]] || result[1];

    if (locale === true) {
        result[0] = result[0].toLocaleString();
    } else if (locale.length > 0) {
        result[0] = result[0].toLocaleString(locale, localeOptions);
    } else if (separator.length > 0) {
        result[0] = result[0].toString().replace(CONSTANTS.PERIOD, separator);
    }

    if (pad && round > 0) {
        const i = result[0].toString(),
            x = separator || ((i.match(/(\D)/g) || []).pop() || CONSTANTS.PERIOD),
            tmp = i.split(x),
            s = tmp[1] || CONSTANTS.EMPTY,
            l = s.length,
            n = round - l;

        result[0] = `${tmp[0]}${x}${s.padEnd(l + n, CONSTANTS.ZERO)}`;
    }

    if (full) {
        const fullForm = fullforms[e] || STRINGS.fullform[standard][e];
        result[1] = `${fullForm}${bits ? CONSTANTS.BIT : CONSTANTS.BYTE}${result[0] === 1 ? CONSTANTS.EMPTY : CONSTANTS.S}`;
    }

    return output === CONSTANTS.ARRAY ? result : output === CONSTANTS.OBJECT ? {
        value: result[0],
        symbol: result[1],
        exponent: e,
        unit: u
    } : result.join(spacer);
}

function partial(options = {}) {
    return arg => filesize(arg, options);
}

exports.filesize = filesize;
exports.partial = partial;
