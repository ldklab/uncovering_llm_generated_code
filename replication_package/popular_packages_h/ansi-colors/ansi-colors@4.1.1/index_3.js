'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
const identity = val => val;

const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const createColorManager = () => {
  const colors = { enabled: true, visible: true, styles: {}, keys: {} };

  if ('FORCE_COLOR' in process.env) {
    colors.enabled = process.env.FORCE_COLOR !== '0';
  }

  const ansi = style => {
    style.open = `\u001b[${style.codes[0]}m`;
    style.close = `\u001b[${style.codes[1]}m`;
    style.regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g');

    style.wrap = (input, newline) => {
      if (input.includes(style.close)) {
        input = input.replace(style.regex, style.close + style.open);
      }
      let output = style.open + input + style.close;
      return newline ? output.replace(/\r*\n/g, `${style.close}$&${style.open}`) : output;
    };

    return style;
  };

  const wrap = (style, input, newline) => {
    return typeof style === 'function' ? style(input) : style.wrap(input, newline);
  };

  const style = (input, stack) => {
    if (input === '' || input == null) return '';
    if (colors.enabled === false) return input;
    if (colors.visible === false) return '';
    let str = '' + input;
    let nl = str.includes('\n');
    let n = stack.length;
    if (n > 0 && stack.includes('unstyle')) {
      stack = [...new Set(['unstyle', ...stack])].reverse();
    }
    while (n-- > 0) str = wrap(colors.styles[stack[n]], str, nl);
    return str;
  };

  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    let keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        let color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };

  const modifiers = [
    { name: 'reset', codes: [0, 0] },
    { name: 'bold', codes: [1, 22] },
    { name: 'dim', codes: [2, 22] },
    { name: 'italic', codes: [3, 23] },
    { name: 'underline', codes: [4, 24] },
    { name: 'inverse', codes: [7, 27] },
    { name: 'hidden', codes: [8, 28] },
    { name: 'strikethrough', codes: [9, 29] }
  ];

  const colorsPrimary = [
    { name: 'black', codes: [30, 39] },
    { name: 'red', codes: [31, 39] },
    { name: 'green', codes: [32, 39] },
    { name: 'yellow', codes: [33, 39] },
    { name: 'blue', codes: [34, 39] },
    { name: 'magenta', codes: [35, 39] },
    { name: 'cyan', codes: [36, 39] },
    { name: 'white', codes: [37, 39] },
    { name: 'gray', codes: [90, 39] },
    { name: 'grey', codes: [90, 39] }
  ];

  const bgColors = [
    { name: 'bgBlack', codes: [40, 49] },
    { name: 'bgRed', codes: [41, 49] },
    { name: 'bgGreen', codes: [42, 49] },
    { name: 'bgYellow', codes: [43, 49] },
    { name: 'bgBlue', codes: [44, 49] },
    { name: 'bgMagenta', codes: [45, 49] },
    { name: 'bgCyan', codes: [46, 49] },
    { name: 'bgWhite', codes: [47, 49] }
  ];

  const brightColors = [
    { name: 'blackBright', codes: [90, 39] },
    { name: 'redBright', codes: [91, 39] },
    { name: 'greenBright', codes: [92, 39] },
    { name: 'yellowBright', codes: [93, 39] },
    { name: 'blueBright', codes: [94, 39] },
    { name: 'magentaBright', codes: [95, 39] },
    { name: 'cyanBright', codes: [96, 39] },
    { name: 'whiteBright', codes: [97, 39] }
  ];

  const bgBrightColors = [
    { name: 'bgBlackBright', codes: [100, 49] },
    { name: 'bgRedBright', codes: [101, 49] },
    { name: 'bgGreenBright', codes: [102, 49] },
    { name: 'bgYellowBright', codes: [103, 49] },
    { name: 'bgBlueBright', codes: [104, 49] },
    { name: 'bgMagentaBright', codes: [105, 49] },
    { name: 'bgCyanBright', codes: [106, 49] },
    { name: 'bgWhiteBright', codes: [107, 49] }
  ];

  modifiers.forEach(m => define(m.name, m.codes, 'modifier'));
  colorsPrimary.forEach(c => define(c.name, c.codes, 'color'));
  bgColors.forEach(c => define(c.name, c.codes, 'bg'));
  brightColors.forEach(c => define(c.name, c.codes, 'bright'));
  bgBrightColors.forEach(c => define(c.name, c.codes, 'bgBright'));

  colors.ansiRegex = ANSI_REGEX;

  colors.hasColor = colors.hasAnsi = str => {
    colors.ansiRegex.lastIndex = 0;
    return typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);
  };

  colors.alias = (name, color) => {
    let fn = typeof color === 'string' ? colors[color] : color;

    if (typeof fn !== 'function') {
      throw new TypeError('Expected alias to be the name of an existing color (string) or a function');
    }

    if (!fn.stack) {
      Reflect.defineProperty(fn, 'name', { value: name });
      colors.styles[name] = fn;
      fn.stack = [name];
    }

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        let color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return color;
      }
    });
  };

  colors.theme = custom => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (let name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  colors.alias('unstyle', str => {
    if (typeof str === 'string' && str !== '') {
      colors.ansiRegex.lastIndex = 0;
      return str.replace(colors.ansiRegex, '');
    }
    return '';
  });

  colors.alias('noop', str => str);
  colors.none = colors.clear = colors.noop;
  colors.stripColor = colors.unstyle;
  colors.symbols = require('./symbols');
  colors.define = define;

  return colors;
};

module.exports = createColorManager();
module.exports.create = createColorManager;
