'use strict';

// Check for environment variables related to color output
let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM;
let isTTY = true;

if (typeof process !== 'undefined') {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
    isTTY = process.stdout && process.stdout.isTTY;
}

const $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
        FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
    ),

    // Text styles and colors
    reset: init(0, 0),
    bold: init(1, 22),
    dim: init(2, 22),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),

    // Foreground colors
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    grey: init(90, 39),

    // Background colors
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49)
};

function run(styles, text) {
    let start = '', end = '';
    for (let style of styles) {
        start += style.open;
        end += style.close;
        if (text.includes(style.close)) {
            text = text.replace(style.rgx, style.close + style.open);
        }
    }
    return start + text + end;
}

function chain(activeStyles, keys) {
    const context = { activeStyles, keys };

    Object.keys($).forEach(key => {
        if (key !== 'enabled') {
            context[key] = $.enabled ? $.key.bind(context) : (txt) => txt;
        }
    });

    return context;
}

function init(open, close) {
    const styleBlock = {
        open: `\x1b[${open}m`,
        close: `\x1b[${close}m`,
        rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
    };

    return function (text) {
        if (this !== void 0 && this.activeStyles !== void 0) {
            if (!this.activeStyles.includes(open)) {
                this.activeStyles.push(open);
                this.keys.push(styleBlock);
            }
            return text === void 0 ? this : $.enabled ? run(this.keys, String(text)) : String(text);
        }
        return text === void 0 ? chain([open], [styleBlock]) : $.enabled ? run([styleBlock], String(text)) : String(text);
    };
}

module.exports = $;
