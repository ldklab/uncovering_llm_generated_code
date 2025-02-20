'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const tty = require('tty');

function createNamespace(e) {
  if (e && e.__esModule) return e;
  const namespace = Object.create(null);
  if (e) {
    Object.keys(e).forEach(key => {
      if (key !== 'default') {
        const descriptor = Object.getOwnPropertyDescriptor(e, key);
        Object.defineProperty(namespace, key, descriptor.get ? descriptor : {
          enumerable: true,
          get: () => e[key]
        });
      }
    });
  }
  namespace["default"] = e;
  return Object.freeze(namespace);
}

const ttyNamespace = createNamespace(tty);

const {
  env = {},
  argv = [],
  platform = "",
} = typeof process === "undefined" ? {} : process;

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const isCompatibleTerminal =
  ttyNamespace && ttyNamespace.isatty && ttyNamespace.isatty(1) && env.TERM && !isDumbTerminal;

const isCI = "CI" in env && ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported = !isDisabled && (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI);

const replaceClose = (
  index, string, close, replace,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));

const clearBleed = (index, string, open, close, replace) =>
  index < 0 ? open + string + close : open + replaceClose(index, string, close, replace) + close;

const filterEmpty = (open, close, replace = open, at = open.length + 1) => string =>
  string !== undefined && string !== "" ? clearBleed(
    ("" + string).indexOf(close, at), string, open, close, replace
  ) : "";

const initColor = (open, close, replace) =>
  filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace);

const styleColors = {
  reset: initColor(0, 0),
  bold: initColor(1, 22, "\x1b[22m\x1b[1m"),
  dim: initColor(2, 22, "\x1b[22m\x1b[2m"),
  italic: initColor(3, 23),
  underline: initColor(4, 24),
  inverse: initColor(7, 27),
  hidden: initColor(8, 28),
  strikethrough: initColor(9, 29),
  black: initColor(30, 39),
  red: initColor(31, 39),
  green: initColor(32, 39),
  yellow: initColor(33, 39),
  blue: initColor(34, 39),
  magenta: initColor(35, 39),
  cyan: initColor(36, 39),
  white: initColor(37, 39),
  gray: initColor(90, 39),
  bgBlack: initColor(40, 49),
  bgRed: initColor(41, 49),
  bgGreen: initColor(42, 49),
  bgYellow: initColor(43, 49),
  bgBlue: initColor(44, 49),
  bgMagenta: initColor(45, 49),
  bgCyan: initColor(46, 49),
  bgWhite: initColor(47, 49),
  blackBright: initColor(90, 39),
  redBright: initColor(91, 39),
  greenBright: initColor(92, 39),
  yellowBright: initColor(93, 39),
  blueBright: initColor(94, 39),
  magentaBright: initColor(95, 39),
  cyanBright: initColor(96, 39),
  whiteBright: initColor(97, 39),
  bgBlackBright: initColor(100, 49),
  bgRedBright: initColor(101, 49),
  bgGreenBright: initColor(102, 49),
  bgYellowBright: initColor(103, 49),
  bgBlueBright: initColor(104, 49),
  bgMagentaBright: initColor(105, 49),
  bgCyanBright: initColor(106, 49),
  bgWhiteBright: initColor(107, 49),
};

const createColors = ({ useColor = isColorSupported } = {}) =>
  useColor
    ? styleColors
    : Object.keys(styleColors).reduce(
        (colors, key) => ({ ...colors, [key]: String }),
        {}
      );

const colors = createColors();

exports.bgBlack = colors.bgBlack;
exports.bgBlackBright = colors.bgBlackBright;
exports.bgBlue = colors.bgBlue;
exports.bgBlueBright = colors.bgBlueBright;
exports.bgCyan = colors.bgCyan;
exports.bgCyanBright = colors.bgCyanBright;
exports.bgGreen = colors.bgGreen;
exports.bgGreenBright = colors.bgGreenBright;
exports.bgMagenta = colors.bgMagenta;
exports.bgMagentaBright = colors.bgMagentaBright;
exports.bgRed = colors.bgRed;
exports.bgRedBright = colors.bgRedBright;
exports.bgWhite = colors.bgWhite;
exports.bgWhiteBright = colors.bgWhiteBright;
exports.bgYellow = colors.bgYellow;
exports.bgYellowBright = colors.bgYellowBright;
exports.black = colors.black;
exports.blackBright = colors.blackBright;
exports.blue = colors.blue;
exports.blueBright = colors.blueBright;
exports.bold = colors.bold;
exports.createColors = createColors;
exports.cyan = colors.cyan;
exports.cyanBright = colors.cyanBright;
exports.dim = colors.dim;
exports.gray = colors.gray;
exports.green = colors.green;
exports.greenBright = colors.greenBright;
exports.hidden = colors.hidden;
exports.inverse = colors.inverse;
exports.isColorSupported = isColorSupported;
exports.italic = colors.italic;
exports.magenta = colors.magenta;
exports.magentaBright = colors.magentaBright;
exports.red = colors.red;
exports.redBright = colors.redBright;
exports.reset = colors.reset;
exports.strikethrough = colors.strikethrough;
exports.underline = colors.underline;
exports.white = colors.white;
exports.whiteBright = colors.whiteBright;
exports.yellow = colors.yellow;
exports.yellowBright = colors.yellowBright;
