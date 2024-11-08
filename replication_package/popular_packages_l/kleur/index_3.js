// kleur/index.js
const supportsColor = typeof process !== 'undefined' && process.stdout.isTTY && process.env.FORCE_COLOR !== '0';

// ANSI escape codes
const codes = {
  modifiers: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
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
    gray: [90, 39]
  },
  backgrounds: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49]
  }
};

const kleur = {
  enabled: supportsColor
};

const applyStyle = (start, end) => str => kleur.enabled ? `\x1b[${start}m${str}\x1b[${end}m` : str;

Object.entries(codes).forEach(([type, styles]) => {
  Object.entries(styles).forEach(([style, [start, end]]) => {
    kleur[style] = applyStyle(start, end);
  });
});

module.exports = kleur;

kleur.colors = Object.entries(codes.colors).reduce((acc, [color, [start, end]]) => {
  acc[color] = applyStyle(start, end);
  return acc;
}, {});

kleur.backgrounds = Object.entries(codes.backgrounds).reduce((acc, [bg, [start, end]]) => {
  acc[bg] = applyStyle(start, end);
  return acc;
}, {});

kleur.modifiers = Object.entries(codes.modifiers).reduce((acc, [mod, [start, end]]) => {
  acc[mod] = applyStyle(start, end);
  return acc;
}, {});
