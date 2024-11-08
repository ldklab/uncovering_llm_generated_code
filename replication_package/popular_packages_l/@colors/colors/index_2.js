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

function applyAnsiStyle(style, text) {
  if (!style) return text;
  const [openCode, closeCode] = style;
  const open = `\x1b[${openCode}m`;
  const close = `\x1b[${closeCode}m`;
  const closeRe = new RegExp(`\\x1b\\[${closeCode}m`, 'g');
  return open + text.replace(closeRe, open) + close;
}

const StringExtensions = (function() {
  Object.entries(styles.modifiers).forEach(([style, code]) => {
    Object.defineProperty(String.prototype, style, {
      get() {
        return applyAnsiStyle(code, this);
      },
    });
  });

  Object.entries(styles.colors).forEach(([color, code]) => {
    Object.defineProperty(String.prototype, color, {
      get() {
        return applyAnsiStyle(code, this);
      },
    });
  });

  Object.entries(styles.bgColors).forEach(([bgColor, code]) => {
    Object.defineProperty(String.prototype, bgColor, {
      get() {
        return applyAnsiStyle(code, this);
      },
    });
  });
})();

const safeMethods = {};

Object.entries(styles.modifiers).forEach(([style, code]) => {
  safeMethods[style] = (text) => applyAnsiStyle(code, text);
});

Object.entries(styles.colors).forEach(([color, code]) => {
  safeMethods[color] = (text) => applyAnsiStyle(code, text);
});

Object.entries(styles.bgColors).forEach(([bgColor, code]) => {
  safeMethods[bgColor] = (text) => applyAnsiStyle(code, text);
});

module.exports = {
  ...safeMethods,
  enable() {
    // TODO: Implement enabling colors
  },
  disable() {
    // TODO: Implement disabling colors
  },
  setTheme(theme) {
    for (const [key, value] of Object.entries(theme)) {
      const styleSeq = value.split(' ');
      Object.defineProperty(String.prototype, key, {
        get() {
          return styleSeq.reduce((acc, style) => applyAnsiStyle(styles[style], acc), this);
        },
      });
    }
  },
  styles(styleSeq) {
    return (text) => styleSeq.reduce((acc, style) => applyAnsiStyle(styles[style], acc), text);
  },
};

// Usage example for safe usage
const colors = require('@colors/colors/safe');
console.log(colors.red('This is red text'));
