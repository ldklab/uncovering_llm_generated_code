const isColorSupported = !process.env.NO_COLOR && (process.env.FORCE_COLOR || process.stdout.isTTY);

const createColors = ({ useColor = isColorSupported } = {}) => {
  const enable = useColor;
  
  const styles = {
    reset: [0, 0],

    // Modifiers
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],

    // Colors
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],

    // Bright Colors
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39],

    // Background Colors
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],

    // Bright Background Colors
    bgBlackBright: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49],
  };

  const applyStyle = (start, end, str) => (enable ? `\x1b[${start}m${str}\x1b[${end}m` : str);

  return Object.keys(styles).reduce((acc, style) => {
    const code = styles[style];
    acc[style] = str => applyStyle(code[0], code[1], str);
    return acc;
  }, {});
};

const colors = createColors();

const { blue, bold, underline } = colors;

// Example usage
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
