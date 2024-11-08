// colors.js
'use strict';

const styles = {
  black: ['\x1b[30m', '\x1b[39m'],
  red: ['\x1b[31m', '\x1b[39m'],
  green: ['\x1b[32m', '\x1b[39m'],
  yellow: ['\x1b[33m', '\x1b[39m'],
  blue: ['\x1b[34m', '\x1b[39m'],
  magenta: ['\x1b[35m', '\x1b[39m'],
  cyan: ['\x1b[36m', '\x1b[39m'],
  white: ['\x1b[37m', '\x1b[39m'],
  gray: ['\x1b[90m', '\x1b[39m'],
  grey: ['\x1b[90m', '\x1b[39m'],
  brightRed: ['\x1b[91m', '\x1b[39m'],
  brightGreen: ['\x1b[92m', '\x1b[39m'],
  brightYellow: ['\x1b[93m', '\x1b[39m'],
  brightBlue: ['\x1b[94m', '\x1b[39m'],
  brightMagenta: ['\x1b[95m', '\x1b[39m'],
  brightCyan: ['\x1b[96m', '\x1b[39m'],
  brightWhite: ['\x1b[97m', '\x1b[39m'],
  bgBlack: ['\x1b[40m', '\x1b[49m'],
  bgRed: ['\x1b[41m', '\x1b[49m'],
  bgGreen: ['\x1b[42m', '\x1b[49m'],
  bgYellow: ['\x1b[43m', '\x1b[49m'],
  bgBlue: ['\x1b[44m', '\x1b[49m'],
  bgMagenta: ['\x1b[45m', '\x1b[49m'],
  bgCyan: ['\x1b[46m', '\x1b[49m'],
  bgWhite: ['\x1b[47m', '\x1b[49m'],
  bgGray: ['\x1b[100m', '\x1b[49m'],
  bgGrey: ['\x1b[100m', '\x1b[49m'],
  bgBrightRed: ['\x1b[101m', '\x1b[49m'],
  bgBrightGreen: ['\x1b[102m', '\x1b[49m'],
  bgBrightYellow: ['\x1b[103m', '\x1b[49m'],
  bgBrightBlue: ['\x1b[104m', '\x1b[49m'],
  bgBrightMagenta: ['\x1b[105m', '\x1b[49m'],
  bgBrightCyan: ['\x1b[106m', '\x1b[49m'],
  bgBrightWhite: ['\x1b[107m', '\x1b[49m'],
  reset: ['\x1b[0m', '\x1b[0m'],
  bold: ['\x1b[1m', '\x1b[22m'],
  dim: ['\x1b[2m', '\x1b[22m'],
  italic: ['\x1b[3m', '\x1b[23m'],
  underline: ['\x1b[4m', '\x1b[24m'],
  inverse: ['\x1b[7m', '\x1b[27m'],
  hidden: ['\x1b[8m', '\x1b[28m'],
  strikethrough: ['\x1b[9m', '\x1b[29m'],
};

function applyStyle(style, ...text) {
  return styles[style][0] + text.join(' ') + styles[style][1];
}

function initColors(stringPrototypeExtend = true) {
  if (stringPrototypeExtend) {
    for (const style in styles) {
      Object.defineProperty(String.prototype, style, {
        get: function() {
          return applyStyle(style, this);
        },
      });
    }
  } else {
    const safeColors = {};
    for (const style in styles) {
      safeColors[style] = (...texts) => applyStyle(style, ...texts);
    }
    return safeColors;
  }
}

const colors = initColors();
const safeColors = initColors(false);

let enabled = true;

function enable() {
  enabled = true;
}

function disable() {
  enabled = false;
}

function setTheme(theme) {
  for (const name in theme) {
    const style = theme[name];
    if (typeof style === 'string') {
      styles[name] = styles[style];
    } else if (Array.isArray(style)) {
      styles[name] = style.map(s => styles[s][0]);
    }
  }
}

module.exports = { ...colors, enable, disable, setTheme };
module.exports.safe = { ...safeColors, enable, disable, setTheme };
