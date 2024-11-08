'use strict';

// Initial setup of environmental variables and TTY status
let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
if (typeof process !== 'undefined') {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
    isTTY = process.stdout && process.stdout.isTTY;
}

// Main color and style object
const styles = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
        FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
    ),

    // Text styles
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

// Function to apply ANSI styles to strings
function applyStyles(styleArray, str) {
    let i = 0, tmp, start = '', end = '';
    for (; i < styleArray.length; i++) {
        tmp = styleArray[i];
        start += tmp.open;
        end += tmp.close;
        if (str.includes(tmp.close)) {
            str = str.replace(tmp.rgx, tmp.close + tmp.open);
        }
    }
    return start + str + end;
}

// Function to create a chainable style context
function createChain(existingStyles, styleKeys) {
    let context = { existingStyles, styleKeys };

    // Adding methods to the chain context
    for (const style in styles) {
        if (style !== 'enabled') {
            context[style] = styles[style].bind(context);
        }
    }

    return context;
}

// Core utility for creating style functions
function createStyle(open, close) {
    let styleBlock = {
        open: `\x1b[${open}m`,
        close: `\x1b[${close}m`,
        rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
    };
    return function (text) {
        if (this !== void 0 && this.existingStyles !== void 0) {
            if (!this.existingStyles.includes(open)) {
                this.existingStyles.push(open);
                this.styleKeys.push(styleBlock);
            }
            return text === void 0 ? this : styles.enabled ? applyStyles(this.styleKeys, text + '') : text + '';
        }
        return text === void 0 ? createChain([open], [styleBlock]) : styles.enabled ? applyStyles([styleBlock], text + '') : text + '';
    };
}

module.exports = styles;
