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

    // Text modifiers
    reset: createStyle(0, 0),
    bold: createStyle(1, 22),
    dim: createStyle(2, 22),
    italic: createStyle(3, 23),
    underline: createStyle(4, 24),
    inverse: createStyle(7, 27),
    hidden: createStyle(8, 28),
    strikethrough: createStyle(9, 29),

    // Text colors
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

    // Background colors
    bgBlack: createStyle(40, 49),
    bgRed: createStyle(41, 49),
    bgGreen: createStyle(42, 49),
    bgYellow: createStyle(43, 49),
    bgBlue: createStyle(44, 49),
    bgMagenta: createStyle(45, 49),
    bgCyan: createStyle(46, 49),
    bgWhite: createStyle(47, 49)
};

function applyStyles(styles, str) {
    let openStyles = '', closeStyles = '';
    for (let style of styles) {
        openStyles += style.open;
        closeStyles += style.close;
        if (str.includes(style.close)) {
            str = str.replace(style.pattern, style.close + style.open);
        }
    }
    return openStyles + str + closeStyles;
}

function createChainedStyles(existingStyles, existingFormats) {
    const context = { existingStyles, existingFormats };

    Object.keys($).forEach(key => {
        context[key] = $[key].bind(context);
    });

    return context;
}

function createStyle(openCode, closeCode) {
    const styleFormat = {
        open: `\x1b[${openCode}m`,
        close: `\x1b[${closeCode}m`,
        pattern: new RegExp(`\\x1b\\[${closeCode}m`, 'g')
    };

    return function apply(txt) {
        if (this !== undefined && this.existingStyles !== undefined) {
            if (!this.existingStyles.includes(openCode)) {
                this.existingStyles.push(openCode);
                this.existingFormats.push(styleFormat);
            }
            return txt === undefined ? this : $.enabled ? applyStyles(this.existingFormats, txt + '') : txt + '';
        }
        return txt === undefined ? createChainedStyles([openCode], [styleFormat]) : $.enabled ? applyStyles([styleFormat], txt + '') : txt + '';
    };
}

module.exports = $;
