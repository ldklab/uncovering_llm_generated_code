'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const hasColor = () => typeof process !== 'undefined' && process.env.FORCE_COLOR !== '0';

const create = () => {
  const colors = {
    enabled: hasColor(),
    visible: true,
    styles: {},
    keys: {}
  };

  const ansi = style => {
    const open = `\u001b[${style.codes[0]}m`;
    const close = `\u001b[${style.codes[1]}m`;
    const regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g');
    style.open = open;
    style.close = close;
    style.regex = regex;

    style.wrap = (input, newline) => {
      if (input.includes(close)) input = input.replace(regex, close + open);
      let output = open + input + close;
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    
    return style;
  };

  const wrap = (style, input, newline) => typeof style === 'function' ? style(input) : style.wrap(input, newline);

  const style = (input, stack) => {
    if (input === '' || input == null || colors.enabled === false || colors.visible === false) return input || '';
    let str = '' + input;
    const nl = str.includes('\n');
    const uniqueStack = [...new Set(stack.includes('unstyle') ? ['unstyle', ...stack] : stack)].reverse();
    for (const name of uniqueStack) str = wrap(colors.styles[name], str, nl);
    return str;
  };

  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    const keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        const color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };

  ['reset', 'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden', 'strikethrough'].forEach((name, index) => {
    define(name, [index, index === 0 ? 0 : 20 + index], 'modifier');
  });

  [['black', 30], ['red', 31], ['green', 32], ['yellow', 33], ['blue', 34], ['magenta', 35], ['cyan', 36], ['white', 37], ['gray', 90], ['grey', 90]].forEach(([name, code]) => {
    define(name, [code, 39], 'color');
  });

  ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite'].forEach((name, index) => {
    define(name, [40 + index, 49], 'bg');
  });

  ['blackBright', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'].forEach((name, index) => {
    define(name, [90 + index, 39], 'bright');
  });

  ['bgBlackBright', 'bgRedBright', 'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright'].forEach((name, index) => {
    define(name, [100 + index, 49], 'bgBright');
  });

  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = colors.hasAnsi = str => {
    colors.ansiRegex.lastIndex = 0;
    return typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);
  };

  colors.alias = (name, color) => {
    const fn = typeof color === 'string' ? colors[color] : color;

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
        const color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return color;
      }
    });
  };

  colors.theme = custom => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (const name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  colors.alias('unstyle', str => (typeof str === 'string' && str) ? str.replace(colors.ansiRegex, '') : '');
  colors.alias('noop', str => str);
  colors.none = colors.clear = colors.noop;
  colors.stripColor = colors.unstyle;
  colors.symbols = require('./symbols');
  colors.define = define;

  return colors;
};

module.exports = create();
module.exports.create = create;
