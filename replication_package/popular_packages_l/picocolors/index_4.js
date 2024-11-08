// picocolors.js
const colorEnabled = !process.env.NO_COLOR;

const wrapAnsi = (open, close, text) => colorEnabled ? `${open}${text}${close}` : text;

const createFormatter = (open, close) => text => wrapAnsi(open, close, text);

const ansiCodes = {
  modifiers: {
    reset: [0, 0], bold: [1, 22], dim: [2, 22],
    italic: [3, 23], underline: [4, 24], inverse: [7, 27],
    hidden: [8, 28], strikethrough: [9, 29]
  },
  colors: {
    black: [30, 39], red: [31, 39], green: [32, 39],
    yellow: [33, 39], blue: [34, 39], magenta: [35, 39],
    cyan: [36, 39], white: [37, 39], blackBright: [90, 39],
    redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39],
    blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColors: {
    bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49],
    bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49],
    bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49],
    bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49],
    bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};

const generateFormatters = (codes) => Object.fromEntries(
  Object.entries(codes).map(([name, code]) => [name, createFormatter(`\x1b[${code[0]}m`, `\x1b[${code[1]}m`)])
);

const formatters = {
  ...generateFormatters(ansiCodes.modifiers),
  ...generateFormatters(ansiCodes.colors),
  ...generateFormatters(ansiCodes.bgColors),
};

const configureColors = (enabled) => enabled ? formatters : Object.fromEntries(
  Object.keys(formatters).map(name => [name, str => str])
);

export default { ...formatters, colorEnabled, configureColors };
