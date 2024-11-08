// picocolors.js
const isColorSupported = !process.env.NO_COLOR;

const wrapAnsi = (open, close, txt) => {
  return isColorSupported ? `${open}${txt}${close}` : txt;
};

const formatter = (open, close) => txt => wrapAnsi(open, close, txt);

const codes = {
  modifier: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    blackBright: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgBlackBright: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};

const applyCodes = codeObj => {
  return Object.fromEntries(
    Object.entries(codeObj)
      .map(([name, [open, close]]) => [name, formatter(`\x1b[${open}m`, `\x1b[${close}m`)])
  );
};

const colors = {
  ...applyCodes(codes.modifier),
  ...applyCodes(codes.color),
  ...applyCodes(codes.bgColor),
};

const createColors = enabled => {
  return enabled ? colors : Object.fromEntries(Object.keys(colors).map(name => [name, s => s]));
};

export default { ...colors, isColorSupported, createColors };
