'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

function hasColorSupport() {
  return typeof process !== 'undefined' && process.env.FORCE_COLOR !== '0';
}

function createAnsiColorUtility() {
  const colors = {
    enabled: hasColorSupport(),
    visible: true,
    styles: {},
    keys: {}
  };

  function applyAnsiStyle(style) {
    const open = style.open = `\u001b[${style.codes[0]}m`;
    const close = style.close = `\u001b[${style.codes[1]}m`;
    const regex = style.regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g');
    
    style.wrap = (input, newline) => {
      if (input.includes(close)) {
        input = input.replace(regex, close + open);
      }
      const output = open + input + close;
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    
    return style;
  }

  function wrapStyle(style, input, newline) {
    return typeof style === 'function' ? style(input) : style.wrap(input, newline);
  }

  function styleString(input, stack) {
    if (input === '' || input == null) return '';
    if (!colors.enabled) return input;
    if (!colors.visible) return '';
    
    let str = `${input}`;
    const nl = str.includes('\n');
    let n = stack.length;
    
    if (n > 0 && stack.includes('unstyle')) {
      stack = [...new Set(['unstyle', ...stack])].reverse();
    }
    
    while (n-- > 0) {
      str = wrapStyle(colors.styles[stack[n]], str, nl);
    }
    
    return str;
  }
  
  function defineStyle(name, codes, type) {
    colors.styles[name] = applyAnsiStyle({ name, codes });
    if (!colors.keys[type]) {
      colors.keys[type] = [];
    }
    colors.keys[type].push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get() {
        const colorFunction = input => styleString(input, colorFunction.stack);
        Reflect.setPrototypeOf(colorFunction, colors);
        colorFunction.stack = this.stack ? this.stack.concat(name) : [name];
        return colorFunction;
      }
    });
  }

  // Define default text styles
  [
    ['reset', [0, 0], 'modifier'],
    ['bold', [1, 22], 'modifier'],
    ['dim', [2, 22], 'modifier'],
    ['italic', [3, 23], 'modifier'],
    ['underline', [4, 24], 'modifier'],
    ['inverse', [7, 27], 'modifier'],
    ['hidden', [8, 28], 'modifier'],
    ['strikethrough', [9, 29], 'modifier'],
    // Color styles
    ['black', [30, 39], 'color'],
    ['red', [31, 39], 'color'],
    ['green', [32, 39], 'color'],
    ['yellow', [33, 39], 'color'],
    ['blue', [34, 39], 'color'],
    ['magenta', [35, 39], 'color'],
    ['cyan', [36, 39], 'color'],
    ['white', [37, 39], 'color'],
    ['gray', [90, 39], 'color'],
    ['grey', [90, 39], 'color'],
    // Background colors
    ['bgBlack', [40, 49], 'bg'],
    ['bgRed', [41, 49], 'bg'],
    ['bgGreen', [42, 49], 'bg'],
    ['bgYellow', [43, 49], 'bg'],
    ['bgBlue', [44, 49], 'bg'],
    ['bgMagenta', [45, 49], 'bg'],
    ['bgCyan', [46, 49], 'bg'],
    ['bgWhite', [47, 49], 'bg'],
    // Bright colors
    ['blackBright', [90, 39], 'bright'],
    ['redBright', [91, 39], 'bright'],
    ['greenBright', [92, 39], 'bright'],
    ['yellowBright', [93, 39], 'bright'],
    ['blueBright', [94, 39], 'bright'],
    ['magentaBright', [95, 39], 'bright'],
    ['cyanBright', [96, 39], 'bright'],
    ['whiteBright', [97, 39], 'bright'],
    // Bright background colors
    ['bgBlackBright', [100, 49], 'bgBright'],
    ['bgRedBright', [101, 49], 'bgBright'],
    ['bgGreenBright', [102, 49], 'bgBright'],
    ['bgYellowBright', [103, 49], 'bgBright'],
    ['bgBlueBright', [104, 49], 'bgBright'],
    ['bgMagentaBright', [105, 49], 'bgBright'],
    ['bgCyanBright', [106, 49], 'bgBright'],
    ['bgWhiteBright', [107, 49], 'bgBright']
  ].forEach(([name, codes, type]) => defineStyle(name, codes, type));

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
      get() {
        const colorFunction = input => styleString(input, colorFunction.stack);
        Reflect.setPrototypeOf(colorFunction, colors);
        colorFunction.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return colorFunction;
      }
    });
  };

  colors.theme = custom => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (const name in custom) {
      if (Object.prototype.hasOwnProperty.call(custom, name)) {
        colors.alias(name, custom[name]);
      }
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
  colors.define = defineStyle;
  return colors;
}

module.exports = createAnsiColorUtility();
module.exports.create = createAnsiColorUtility;
