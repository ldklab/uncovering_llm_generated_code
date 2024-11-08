let enabled =
  !("NO_COLOR" in process.env) &&
  ("FORCE_COLOR" in process.env ||
    process.platform === "win32" ||
    (process.stdout != null &&
      process.stdout.isTTY &&
      process.env.TERM &&
      process.env.TERM !== "dumb"));

const styleText = (open, close, searchRegex, replaceValue) => (text) =>
  enabled
    ? open +
      (text.includes(close.slice(2))
        ? text.replace(searchRegex, replaceValue)
        : text) +
      close
    : text;

const applyStyle = (open, close) => {
  return styleText(
    `\x1b[${open}m`,
    `\x1b[${close}m`,
    new RegExp(`\\x1b\\[${close}m`, "g"),
    `\x1b[${open}m`
  );
};

exports.options = Object.defineProperty({}, "enabled", {
  get: () => enabled,
  set: (value) => (enabled = value),
});

exports.reset = applyStyle(0, 0);
exports.bold = styleText("\x1b[1m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[1m");
exports.dim = styleText("\x1b[2m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[2m");
exports.italic = applyStyle(3, 23);
exports.underline = applyStyle(4, 24);
exports.inverse = applyStyle(7, 27);
exports.hidden = applyStyle(8, 28);
exports.strikethrough = applyStyle(9, 29);

exports.black = applyStyle(30, 39);
exports.red = applyStyle(31, 39);
exports.green = applyStyle(32, 39);
exports.yellow = applyStyle(33, 39);
exports.blue = applyStyle(34, 39);
exports.magenta = applyStyle(35, 39);
exports.cyan = applyStyle(36, 39);
exports.white = applyStyle(37, 39);
exports.gray = applyStyle(90, 39);

exports.bgBlack = applyStyle(40, 49);
exports.bgRed = applyStyle(41, 49);
exports.bgGreen = applyStyle(42, 49);
exports.bgYellow = applyStyle(43, 49);
exports.bgBlue = applyStyle(44, 49);
exports.bgMagenta = applyStyle(45, 49);
exports.bgCyan = applyStyle(46, 49);
exports.bgWhite = applyStyle(47, 49);

exports.blackBright = applyStyle(90, 39);
exports.redBright = applyStyle(91, 39);
exports.greenBright = applyStyle(92, 39);
exports.yellowBright = applyStyle(93, 39);
exports.blueBright = applyStyle(94, 39);
exports.magentaBright = applyStyle(95, 39);
exports.cyanBright = applyStyle(96, 39);
exports.whiteBright = applyStyle(97, 39);

exports.bgBlackBright = applyStyle(100, 49);
exports.bgRedBright = applyStyle(101, 49);
exports.bgGreenBright = applyStyle(102, 49);
exports.bgYellowBright = applyStyle(103, 49);
exports.bgBlueBright = applyStyle(104, 49);
exports.bgMagentaBright = applyStyle(105, 49);
exports.bgCyanBright = applyStyle(106, 49);
exports.bgWhiteBright = applyStyle(107, 49);
