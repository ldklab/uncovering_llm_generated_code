const isColorSupported = !process.env.NO_COLOR && (process.env.FORCE_COLOR || process.stdout.isTTY);

const createColors = ({ useColor = isColorSupported } = {}) => {
  const enable = useColor;

  const styles = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39],
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
    bgWhiteBright: [107, 49],
  };

  const applyStyle = (start, end, str) => {
    return enable ? `\x1b[${start}m${str}\x1b[${end}m` : str;
  };

  return Object.entries(styles).reduce((acc, [style, codes]) => {
    acc[style] = (str) => applyStyle(codes[0], codes[1], str);
    return acc;
  }, {});
};

const colors = createColors();

const { blue, bold, underline } = colors;

console.log(
  blue("I'm blue"),
  bold(blue("da ba dee")),
  underline(bold(blue("da ba daa")))
);

console.log(`
  There's a ${underline(blue("house"))},
  With a ${bold(blue("window"))},
  And a ${blue("corvette")}
  And everything is blue
`);

console.log(bold(`I'm ${blue(`da ba ${underline("dee")} da ba`)} daa`));

module.exports = {
  ...colors,
  createColors,
  isColorSupported
};
