'use strict';

let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
if (typeof process !== 'undefined') {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
    isTTY = process.stdout && process.stdout.isTTY;
}

const $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
        FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
    ),

    // text modifiers
    reset: createStyle(0, 0),
    bold: createStyle(1, 22),
    dim: createStyle(2, 22),
    italic: createStyle(3, 23),
    underline: createStyle(4, 24),
    inverse: createStyle(7, 27),
    hidden: createStyle(8, 28),
    strikethrough: createStyle(9, 29),

    // text colors
    black: createStyle(30, 39),
    red: createStyle(31, 39),
    green: createStyle(32, 39),
    yellow: createStyle(33, 39),
    blue: createStyle(34, 39),
    magenta: createStyle(35, 39),
    cyan: createStyle(36, 39),
    white: createStyle(37, 39),
    gray: createStyle(90, 39),
    grey: createStyle(90, 39),

    // background colors
    bgBlack: createStyle(40, 49),
    bgRed: createStyle(41, 49),
    bgGreen: createStyle(42, 49),
    bgYellow: createStyle(43, 49),
    bgBlue: createStyle(44, 49),
    bgMagenta: createStyle(45, 49),
    bgCyan: createStyle(46, 49),
    bgWhite: createStyle(47, 49)
};

function applyStyles(codes, text) {
    let start = '', end = '';
    for (let { open, close, rgx } of codes) {
        start += open;
        end += close;
        if (text.includes(close)) {
            text = text.replace(rgx, close + open);
        }
    }
    return start + text + end;
}

function createContext(existing, styles) {
    const ctx = { existing, styles };

    for (const style in $) {
        ctx[style] = $[style].bind(ctx);
    }

    return ctx;
}

function createStyle(open, close) {
    const code = {
        open: `\x1b[${open}m`,
        close: `\x1b[${close}m`,
        rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
    };
    return function (text) {
        if (this && this.existing) {
            if (!this.existing.includes(open)) {
                this.existing.push(open);
                this.styles.push(code);
            }
            return text === undefined ? this : $.enabled ? applyStyles(this.styles, text + '') : text + '';
        }
        return text === undefined ? createContext([open], [code]) : $.enabled ? applyStyles([code], text + '') : text + '';
    };
}

module.exports = $;
