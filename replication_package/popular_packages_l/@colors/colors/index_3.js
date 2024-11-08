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
    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],
  },
};

function applyANSIStyle(style, str) {
  if (!style) return str;
  const open = `\x1b[${style[0]}m`;
  const close = `\x1b[${style[1]}m`;
  const closeRe = new RegExp(`\\x1b\\[${style[1]}m`, 'g');
  return open + str.replace(closeRe, open) + close;
}

const safeMethods = {};
Object.keys(styles.modifiers).forEach((modifier) => {
  Object.defineProperty(String.prototype, modifier, {
    get() {
      return applyANSIStyle(styles.modifiers[modifier], this);
    },
  });
  safeMethods[modifier] = (str) => applyANSIStyle(styles.modifiers[modifier], str);
});

Object.keys(styles.colors).forEach((color) => {
  Object.defineProperty(String.prototype, color, {
    get() {
      return applyANSIStyle(styles.colors[color], this);
    },
  });
  safeMethods[color] = (str) => applyANSIStyle(styles.colors[color], str);
});

Object.keys(styles.bgColors).forEach((bgColor) => {
  Object.defineProperty(String.prototype, bgColor, {
    get() {
      return applyANSIStyle(styles.bgColors[bgColor], this);
    },
  });
  safeMethods[bgColor] = (str) => applyANSIStyle(styles.bgColors[bgColor], str);
});

module.exports = {
  ...safeMethods,
  enable: () => {}, 
  disable: () => {}, 
  setTheme(theme) {
    for (const key in theme) {
      if (Object.prototype.hasOwnProperty.call(theme, key)) {
        const styles = theme[key].split(' ');
        String.prototype[key] = this.composeStyles(styles);
      }
    }
  },
  composeStyles(styles) {
    return function (str) {
      return styles.reduce((acc, cur) => applyANSIStyle(module.exports[cur], acc), str);
    };
  },
};

// Usage example for safe usage
const colors = require('@colors/colors/safe');
console.log(colors.red('This is red text'));
