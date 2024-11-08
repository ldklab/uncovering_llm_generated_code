'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const createColors = () => {
  const colors = { enabled: true, visible: true, styles: {}, keys: {} };

  if ('FORCE_COLOR' in process.env) {
    colors.enabled = process.env.FORCE_COLOR !== '0';
  }

  const createStyle = (name, codes) => {
    const open = `\u001b[${codes[0]}m`;
    const close = `\u001b[${codes[1]}m`;
    const regex = new RegExp(`\\u001b\\[${codes[1]}m`, 'g');

    const style = {
      open,
      close,
      regex,
      wrap: (text, newline) => {
        const replaced = text.includes(close) ? text.replace(regex, close + open) : text;
        const wrapped = open + replaced + close;
        return newline ? wrapped.replace(/\r*\n/g, `${close}$&${open}`) : wrapped;
      }
    };

    colors.styles[name] = style;
    const colorMethod = input => style.wrap(input, input.includes('\n'));
    Object.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get: () => colorMethod
    });
    return style;
  };

  const defineStyle = (name, codes, type) => {
    createStyle(name, codes);
    colors.keys[type] = colors.keys[type] || [];
    colors.keys[type].push(name);
  };

  // Define all styles
  defineStyle('reset', [0, 0], 'modifier');
  defineStyle('bold', [1, 22], 'modifier');
  defineStyle('dim', [2, 22], 'modifier');
  defineStyle('italic', [3, 23], 'modifier');
  defineStyle('underline', [4, 24], 'modifier');
  defineStyle('inverse', [7, 27], 'modifier');
  defineStyle('hidden', [8, 28], 'modifier');
  defineStyle('strikethrough', [9, 29], 'modifier');

  defineStyle('black', [30, 39], 'color');
  defineStyle('red', [31, 39], 'color');
  defineStyle('green', [32, 39], 'color');
  defineStyle('yellow', [33, 39], 'color');
  defineStyle('blue', [34, 39], 'color');
  defineStyle('magenta', [35, 39], 'color');
  defineStyle('cyan', [36, 39], 'color');
  defineStyle('white', [37, 39], 'color');
  defineStyle('gray', [90, 39], 'color');
  defineStyle('grey', [90, 39], 'color');

  defineStyle('bgBlack', [40, 49], 'bg');
  defineStyle('bgRed', [41, 49], 'bg');
  defineStyle('bgGreen', [42, 49], 'bg');
  defineStyle('bgYellow', [43, 49], 'bg');
  defineStyle('bgBlue', [44, 49], 'bg');
  defineStyle('bgMagenta', [45, 49], 'bg');
  defineStyle('bgCyan', [46, 49], 'bg');
  defineStyle('bgWhite', [47, 49], 'bg');

  defineStyle('blackBright', [90, 39], 'bright');
  defineStyle('redBright', [91, 39], 'bright');
  defineStyle('greenBright', [92, 39], 'bright');
  defineStyle('yellowBright', [93, 39], 'bright');
  defineStyle('blueBright', [94, 39], 'bright');
  defineStyle('magentaBright', [95, 39], 'bright');
  defineStyle('cyanBright', [96, 39], 'bright');
  defineStyle('whiteBright', [97, 39], 'bright');

  defineStyle('bgBlackBright', [100, 49], 'bgBright');
  defineStyle('bgRedBright', [101, 49], 'bgBright');
  defineStyle('bgGreenBright', [102, 49], 'bgBright');
  defineStyle('bgYellowBright', [103, 49], 'bgBright');
  defineStyle('bgBlueBright', [104, 49], 'bgBright');
  defineStyle('bgMagentaBright', [105, 49], 'bgBright');
  defineStyle('bgCyanBright', [106, 49], 'bgBright');
  defineStyle('bgWhiteBright', [107, 49], 'bgBright');

  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = string => {
    colors.ansiRegex.lastIndex = 0;
    return typeof string === 'string' && string !== '' && colors.ansiRegex.test(string);
  };

  colors.alias = (name, color) => {
    if (typeof color !== 'function' && !colors[color]) {
      throw new TypeError('Alias must be a function or a defined color name');
    }
    colors[name] = typeof color === 'string' ? colors[color] : color;
  };

  colors.alias('unstyle', text => typeof text === 'string' ? text.replace(ANSI_REGEX, '') : '');
  colors.noop = str => str;

  return colors;
};

module.exports = createColors();
module.exports.create = createColors;
