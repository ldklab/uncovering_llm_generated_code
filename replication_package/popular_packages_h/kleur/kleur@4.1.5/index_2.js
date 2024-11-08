'use strict';

let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
if (typeof process !== 'undefined') {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
}

const styles = createStyles();

function createStyles() {
    return {
        enabled: canUseColors(),
        // modifiers
        reset: createStyle(0, 0),
        bold: createStyle(1, 22),
        dim: createStyle(2, 22),
        italic: createStyle(3, 23),
        underline: createStyle(4, 24),
        inverse: createStyle(7, 27),
        hidden: createStyle(8, 28),
        strikethrough: createStyle(9, 29),
        // colors
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
}

function canUseColors() {
    return !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
        (FORCE_COLOR != null && FORCE_COLOR !== '0') || isTTY
    );
}

function createStyle(open, close) {
    const ansiCode = {
        open: `\x1b[${open}m`,
        close: `\x1b[${close}m`,
        rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
    };
    return function styler(txt) {
        if (this !== undefined && this.has !== undefined) {
            if (!this.has.includes(open)) {
                this.has.push(open);
                this.keys.push(ansiCode);
            }
            return txt === undefined ? this : styles.enabled ? applyStyles(this.keys, `${txt}`) : `${txt}`;
        }
        return txt === undefined ? styleChain([open], [ansiCode]) : styles.enabled ? applyStyles([ansiCode], `${txt}`) : `${txt}`;
    };
}

function applyStyles(styleArray, text) {
    let beg = '', end = '';
    for (const style of styleArray) {
        beg += style.open;
        end += style.close;
        if (text.includes(style.close)) {
            text = text.replace(style.rgx, style.close + style.open);
        }
    }
    return beg + text + end;
}

function styleChain(has, keys) {
    const chainObj = { has, keys };

    for (const style in styles) {
        if (typeof styles[style] === 'function') {
            chainObj[style] = styles[style].bind(chainObj);
        }
    }
    return chainObj;
}

module.exports = styles;
