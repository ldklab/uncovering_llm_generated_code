let colorEnabled = !("NO_COLOR" in process.env) && 
                   ("FORCE_COLOR" in process.env || 
                    process.platform === "win32" || 
                   (process.stdout !== null && process.stdout.isTTY && process.env.TERM && process.env.TERM !== "dumb"));

const applyStyle = (open, close, search, replace) => (text) => 
  colorEnabled ? open + (~(text += "").indexOf(close, 4) ? text.replace(search, replace) : text) + close : text;

const createStyle = (open, close) => {
  return applyStyle(`\x1b[${open}m`, `\x1b[${close}m`, new RegExp(`\\x1b\\[${close}m`, "g"), `\x1b[${open}m`);
}

exports.options = Object.defineProperty({}, "enabled", {
  get: () => colorEnabled,
  set: (value) => (colorEnabled = value),
});

exports.reset = createStyle(0, 0);
exports.bold = applyStyle("\x1b[1m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[1m");
exports.dim = applyStyle("\x1b[2m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[2m");
exports.italic = createStyle(3, 23);
exports.underline = createStyle(4, 24);
exports.inverse = createStyle(7, 27);
exports.hidden = createStyle(8, 28);
exports.strikethrough = createStyle(9, 29);
exports.black = createStyle(30, 39);
exports.red = createStyle(31, 39);
exports.green = createStyle(32, 39);
exports.yellow = createStyle(33, 39);
exports.blue = createStyle(34, 39);
exports.magenta = createStyle(35, 39);
exports.cyan = createStyle(36, 39);
exports.white = createStyle(37, 39);
exports.gray = createStyle(90, 39);
exports.bgBlack = createStyle(40, 49);
exports.bgRed = createStyle(41, 49);
exports.bgGreen = createStyle(42, 49);
exports.bgYellow = createStyle(43, 49);
exports.bgBlue = createStyle(44, 49);
exports.bgMagenta = createStyle(45, 49);
exports.bgCyan = createStyle(46, 49);
exports.bgWhite = createStyle(47, 49);
exports.blackBright = createStyle(90, 39);
exports.redBright = createStyle(91, 39);
exports.greenBright = createStyle(92, 39);
exports.yellowBright = createStyle(93, 39);
exports.blueBright = createStyle(94, 39);
exports.magentaBright = createStyle(95, 39);
exports.cyanBright = createStyle(96, 39);
exports.whiteBright = createStyle(97, 39);
exports.bgBlackBright = createStyle(100, 49);
exports.bgRedBright = createStyle(101, 49);
exports.bgGreenBright = createStyle(102, 49);
exports.bgYellowBright = createStyle(103, 49);
exports.bgBlueBright = createStyle(104, 49);
exports.bgMagentaBright = createStyle(105, 49);
exports.bgCyanBright = createStyle(106, 49);
exports.bgWhiteBright = createStyle(107, 49);
