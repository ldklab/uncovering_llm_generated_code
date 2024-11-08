// colors.js
const ansiStyles = {
    modifiers: {
        reset: [0, 0],
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29],
    },
    colors: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39],
        grey: [90, 39],
        // Bright colors
        brightRed: [91, 39],
        brightGreen: [92, 39],
        brightYellow: [93, 39],
        brightBlue: [94, 39],
        brightMagenta: [95, 39],
        brightCyan: [96, 39],
        brightWhite: [97, 39],
    },
    bgColors: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        bgGray: [100, 49],
        bgGrey: [100, 49],
        // Bright bg colors
        bgBrightRed: [101, 49],
        bgBrightGreen: [102, 49],
        bgBrightYellow: [103, 49],
        bgBrightBlue: [104, 49],
        bgBrightMagenta: [105, 49],
        bgBrightCyan: [106, 49],
        bgBrightWhite: [107, 49],
    },
};

function applyAnsiStyle(style, text) {
    if (!style) return text;
    const start = `\x1b[${style[0]}m`; 
    const end = `\x1b[${style[1]}m`;
    const removeEnd = new RegExp(`\\x1b\\[${style[1]}m`, 'g');
    return start + text.replace(removeEnd, start) + end;
}

// Extend String prototype with modifiers
Object.entries(ansiStyles.modifiers).forEach(([key, style]) => {
    Object.defineProperty(String.prototype, key, {
        get: function () {
            return applyAnsiStyle(style, this);
        },
    });
});

// Extend String prototype with colors
Object.entries(ansiStyles.colors).forEach(([key, style]) => {
    Object.defineProperty(String.prototype, key, {
        get: function () {
            return applyAnsiStyle(style, this);
        },
    });
});

// Extend String prototype with background colors
Object.entries(ansiStyles.bgColors).forEach(([key, style]) => {
    Object.defineProperty(String.prototype, key, {
        get: function () {
            return applyAnsiStyle(style, this);
        },
    });
});

// Safe usage implementation
const safeStyles = {};
Object.entries(ansiStyles.modifiers).forEach(([name, codes]) => {
    safeStyles[name] = (text) => applyAnsiStyle(codes, text);
});
Object.entries(ansiStyles.colors).forEach(([name, codes]) => {
    safeStyles[name] = (text) => applyAnsiStyle(codes, text);
});
Object.entries(ansiStyles.bgColors).forEach(([name, codes]) => {
    safeStyles[name] = (text) => applyAnsiStyle(codes, text);
});

module.exports = {
    ...safeStyles,
    enable: () => {}, // To be implemented if needed
    disable: () => {}, // To be implemented if needed
    setTheme(customTheme) {
        for (const [key, definition] of Object.entries(customTheme)) {
            const styleList = definition.split(' ');
            String.prototype[key] = this.combineStyles(styleList);
        }
    },
    combineStyles(styleList) {
        return function (inputStr) {
            return styleList.reduce((accumStr, style) => applyAnsiStyle(safeStyles[style], accumStr), inputStr);
        };
    },
};

// Safe usage example
const colorModule = require('@colors/colors/safe');
console.log(colorModule.red('This text is red'));
