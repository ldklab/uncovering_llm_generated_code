'use strict';

let forceColor, nodeDisableColors, noColor, term, isTTY = true;
if (typeof process !== 'undefined') {
    ({ FORCE_COLOR: forceColor, NODE_DISABLE_COLORS: nodeDisableColors, NO_COLOR: noColor, TERM: term } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
}

const ansiStyles = {
    enabled: !nodeDisableColors && noColor == null && term !== 'dumb' && (
        forceColor != null && forceColor !== '0' || isTTY
    ),

    // Modifiers
    reset: createInit(0, 0),
    bold: createInit(1, 22),
    dim: createInit(2, 22),
    italic: createInit(3, 23),
    underline: createInit(4, 24),
    inverse: createInit(7, 27),
    hidden: createInit(8, 28),
    strikethrough: createInit(9, 29),

    // Colors
    black: createInit(30, 39),
    red: createInit(31, 39),
    green: createInit(32, 39),
    yellow: createInit(33, 39),
    blue: createInit(34, 39),
    magenta: createInit(35, 39),
    cyan: createInit(36, 39),
    white: createInit(37, 39),
    gray: createInit(90, 39),
    grey: createInit(90, 39),

    // Background Colors
    bgBlack: createInit(40, 49),
    bgRed: createInit(41, 49),
    bgGreen: createInit(42, 49),
    bgYellow: createInit(43, 49),
    bgBlue: createInit(44, 49),
    bgMagenta: createInit(45, 49),
    bgCyan: createInit(46, 49),
    bgWhite: createInit(47, 49)
};

function applyStyles(ansiArray, text) {
    let index = 0, currentStyle, start = '', end = '';
    for (; index < ansiArray.length; index++) {
        currentStyle = ansiArray[index];
        start += currentStyle.open;
        end += currentStyle.close;
        if (text.includes(currentStyle.close)) {
            text = text.replace(currentStyle.rgx, currentStyle.close + currentStyle.open);
        }
    }
    return start + text + end;
}

function createChain(existingStyles, styleKeys) {
    const context = { has: existingStyles, keys: styleKeys };

    context.reset = ansiStyles.reset.bind(context);
    context.bold = ansiStyles.bold.bind(context);
    context.dim = ansiStyles.dim.bind(context);
    context.italic = ansiStyles.italic.bind(context);
    context.underline = ansiStyles.underline.bind(context);
    context.inverse = ansiStyles.inverse.bind(context);
    context.hidden = ansiStyles.hidden.bind(context);
    context.strikethrough = ansiStyles.strikethrough.bind(context);

    context.black = ansiStyles.black.bind(context);
    context.red = ansiStyles.red.bind(context);
    context.green = ansiStyles.green.bind(context);
    context.yellow = ansiStyles.yellow.bind(context);
    context.blue = ansiStyles.blue.bind(context);
    context.magenta = ansiStyles.magenta.bind(context);
    context.cyan = ansiStyles.cyan.bind(context);
    context.white = ansiStyles.white.bind(context);
    context.gray = ansiStyles.gray.bind(context);
    context.grey = ansiStyles.grey.bind(context);

    context.bgBlack = ansiStyles.bgBlack.bind(context);
    context.bgRed = ansiStyles.bgRed.bind(context);
    context.bgGreen = ansiStyles.bgGreen.bind(context);
    context.bgYellow = ansiStyles.bgYellow.bind(context);
    context.bgBlue = ansiStyles.bgBlue.bind(context);
    context.bgMagenta = ansiStyles.bgMagenta.bind(context);
    context.bgCyan = ansiStyles.bgCyan.bind(context);
    context.bgWhite = ansiStyles.bgWhite.bind(context);

    return context;
}

function createInit(openCode, closeCode) {
    const block = {
        open: `\x1b[${openCode}m`,
        close: `\x1b[${closeCode}m`,
        rgx: new RegExp(`\\x1b\\[${closeCode}m`, 'g')
    };
    return function (text) {
        if (this !== undefined && this.has !== undefined) {
            if (!this.has.includes(openCode)) {
                this.has.push(openCode);
                this.keys.push(block);
            }
            return text === undefined ? this : ansiStyles.enabled ? applyStyles(this.keys, text + '') : text + '';
        }
        return text === undefined ? createChain([openCode], [block]) : ansiStyles.enabled ? applyStyles([block], text + '') : text + '';
    };
}

module.exports = ansiStyles;
