// colors.js
const styles = {
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

function applyStyle(style, str) {
  if (!style) return str;
  const open = `\x1b[${style[0]}m`;
  const close = `\x1b[${style[1]}m`;
  const closeRe = new RegExp(`\\x1b\\[${style[1]}m`, 'g');
  return open + str.replace(closeRe, open) + close;
}

// Extend String prototype with styles
Object.keys(styles.modifiers).forEach((style) => {
  Object.defineProperty(String.prototype, style, {
    get: function () {
      return applyStyle(styles.modifiers[style], this);
    },
  });
});

Object.keys(styles.colors).forEach((color) => {
  Object.defineProperty(String.prototype, color, {
    get: function () {
      return applyStyle(styles.colors[color], this);
    },
  });
});

Object.keys(styles.bgColors).forEach((bgColor) => {
  Object.defineProperty(String.prototype, bgColor, {
    get: function () {
      return applyStyle(styles.bgColors[bgColor], this);
    },
  });
});

// Safe usage methods
const safe = {};
Object.keys(styles.modifiers).forEach((style) => {
  safe[style] = (str) => applyStyle(styles.modifiers[style], str);
});

Object.keys(styles.colors).forEach((color) => {
  safe[color] = (str) => applyStyle(styles.colors[color], str);
});

Object.keys(styles.bgColors).forEach((bgColor) => {
  safe[bgColor] = (str) => applyStyle(styles.bgColors[bgColor], str);
});

module.exports = {
  ...safe,
  enable: () => {}, // Placeholder for enabling colors
  disable: () => {}, // Placeholder for disabling colors
  setTheme(theme) {
    for (const key in theme) {
      if (Object.prototype.hasOwnProperty.call(theme, key)) {
        const styles = theme[key].split(' ');
        String.prototype[key] = this.styles(styles);
      }
    }
  },
  styles(styles) {
    return function (str) {
      return styles.reduce((acc, cur) => applyStyle(module.exports[cur], acc), str);
    };
  },
};

// Usage example for safe usage
const colors = require('@colors/colors/safe');
console.log(colors.red('This is red text'));
