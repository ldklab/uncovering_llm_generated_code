'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const tty = require('tty');

function buildNamespace(module) {
  if (module && module.__esModule) return module;
  const newModule = Object.create(null);
  if (module) {
    Object.keys(module).forEach((key) => {
      if (key !== 'default') {
        const descriptor = Object.getOwnPropertyDescriptor(module, key);
        Object.defineProperty(newModule, key, descriptor.get ? descriptor : {
          enumerable: true,
          get: () => module[key]
        });
      }
    });
  }
  newModule.default = module;
  return Object.freeze(newModule);
}

const ttyNamespace = /*#__PURE__*/buildNamespace(tty);

const {
  env = {},
  argv = [],
  platform = "",
} = process || {};

const noColor = "NO_COLOR" in env || argv.includes("--no-color");
const forceColor = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const compatibleTerminal = ttyNamespace && ttyNamespace.isatty && ttyNamespace.isatty(1) && env.TERM && !isDumbTerminal;
const runningInCI = "CI" in env && ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const colorSupport = !noColor && (forceColor || (isWindows && !isDumbTerminal) || compatibleTerminal || runningInCI);

const replaceClose = (index, string, close, replacement) => {
  const head = string.substring(0, index) + replacement;
  const tail = string.substring(index + close.length);
  const next = tail.indexOf(close);
  return head + (next < 0 ? tail : replaceClose(next, tail, close, replacement));
};

const handleBleed = (index, string, open, close, replacement) => 
  index < 0 ? open + string + close : open + replaceClose(index, string, close, replacement) + close;

const createFilter = (open, close, replacement = open, at = open.length + 1) => (string) => 
  string !== "" && string !== undefined 
    ? handleBleed((""+string).indexOf(close, at), string, open, close, replacement) 
    : "";

const initialize = (open, close, replacement) => createFilter(`\x1b[${open}m`, `\x1b[${close}m`, replacement);

const ansiColors = {
  reset: initialize(0, 0),
  bold: initialize(1, 22, "\x1b[22m\x1b[1m"),
  dim: initialize(2, 22, "\x1b[22m\x1b[2m"),
  italic: initialize(3, 23),
  underline: initialize(4, 24),
  inverse: initialize(7, 27),
  hidden: initialize(8, 28),
  strikethrough: initialize(9, 29),
  black: initialize(30, 39),
  red: initialize(31, 39),
  green: initialize(32, 39),
  yellow: initialize(33, 39),
  blue: initialize(34, 39),
  magenta: initialize(35, 39),
  cyan: initialize(36, 39),
  white: initialize(37, 39),
  gray: initialize(90, 39),
  bgBlack: initialize(40, 49),
  bgRed: initialize(41, 49),
  bgGreen: initialize(42, 49),
  bgYellow: initialize(43, 49),
  bgBlue: initialize(44, 49),
  bgMagenta: initialize(45, 49),
  bgCyan: initialize(46, 49),
  bgWhite: initialize(47, 49),
  blackBright: initialize(90, 39),
  redBright: initialize(91, 39),
  greenBright: initialize(92, 39),
  yellowBright: initialize(93, 39),
  blueBright: initialize(94, 39),
  magentaBright: initialize(95, 39),
  cyanBright: initialize(96, 39),
  whiteBright: initialize(97, 39),
  bgBlackBright: initialize(100, 49),
  bgRedBright: initialize(101, 49),
  bgGreenBright: initialize(102, 49),
  bgYellowBright: initialize(103, 49),
  bgBlueBright: initialize(104, 49),
  bgMagentaBright: initialize(105, 49),
  bgCyanBright: initialize(106, 49),
  bgWhiteBright: initialize(107, 49)
};

const defineColors = ({ useColor = colorSupport } = {}) =>
  useColor ? ansiColors : Object.keys(ansiColors).reduce((accumulatedColors, colorKey) => {
    return { ...accumulatedColors, [colorKey]: String };
  }, {});

const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright
} = defineColors();

exports.bgBlack = bgBlack;
exports.bgBlackBright = bgBlackBright;
exports.bgBlue = bgBlue;
exports.bgBlueBright = bgBlueBright;
exports.bgCyan = bgCyan;
exports.bgCyanBright = bgCyanBright;
exports.bgGreen = bgGreen;
exports.bgGreenBright = bgGreenBright;
exports.bgMagenta = bgMagenta;
exports.bgMagentaBright = bgMagentaBright;
exports.bgRed = bgRed;
exports.bgRedBright = bgRedBright;
exports.bgWhite = bgWhite;
exports.bgWhiteBright = bgWhiteBright;
exports.bgYellow = bgYellow;
exports.bgYellowBright = bgYellowBright;
exports.black = black;
exports.blackBright = blackBright;
exports.blue = blue;
exports.blueBright = blueBright;
exports.bold = bold;
exports.defineColors = defineColors;
exports.cyan = cyan;
exports.cyanBright = cyanBright;
exports.dim = dim;
exports.gray = gray;
exports.green = green;
exports.greenBright = greenBright;
exports.hidden = hidden;
exports.inverse = inverse;
exports.colorSupport = colorSupport;
exports.italic = italic;
exports.magenta = magenta;
exports.magentaBright = magentaBright;
exports.red = red;
exports.redBright = redBright;
exports.reset = reset;
exports.strikethrough = strikethrough;
exports.underline = underline;
exports.white = white;
exports.whiteBright = whiteBright;
exports.yellow = yellow;
exports.yellowBright = yellowBright;
