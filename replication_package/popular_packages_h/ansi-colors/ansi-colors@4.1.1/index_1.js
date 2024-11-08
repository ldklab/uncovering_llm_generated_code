'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const createColors = () => {
  const colors = { enabled: true, visible: true, styles: {}, keys: {} };

  if ('FORCE_COLOR' in process.env) {
    colors.enabled = process.env.FORCE_COLOR !== '0';
  }

  const ansi = ({ codes }) => {
    let open = `\u001b[${codes[0]}m`, close = `\u001b[${codes[1]}m`;
    let regex = new RegExp(`\\u001b\\[${codes[1]}m`, 'g');
    const wrap = (input, newline) => {
      if (input.includes(close)) input = input.replace(regex, close + open);
      let output = open + input + close;
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    return { open, close, regex, wrap };
  };

  const applyStyle = (input, stack) => {
    if (!input || colors.enabled === false || colors.visible === false) return '';
    let str = '' + input;
    let nl = str.includes('\n');
    for (let i = stack.length - 1; i >= 0; i--) {
      str = colors.styles[stack[i]].wrap(str, nl);
    }
    return str;
  };

  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ codes });
    colors.keys[type] = colors.keys[type] || [];
    colors.keys[type].push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get() {
        let color = input => applyStyle(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };

  define('reset', [0, 0], 'modifier');
  define('bold', [1, 22], 'modifier');
  define('dim', [2, 22], 'modifier');
  define('italic', [3, 23], 'modifier');
  define('underline', [4, 24], 'modifier');
  define('inverse', [7, 27], 'modifier');
  define('hidden', [8, 28], 'modifier');
  define('strikethrough', [9, 29], 'modifier');

  define('black', [30, 39], 'color');
  define('red', [31, 39], 'color');
  define('green', [32, 39], 'color');
  define('yellow', [33, 39], 'color');
  define('blue', [34, 39], 'color');
  define('magenta', [35, 39], 'color');
  define('cyan', [36, 39], 'color');
  define('white', [37, 39], 'color');
  define('gray', [90, 39], 'color');
  define('grey', [90, 39], 'color');

  define('bgBlack', [40, 49], 'bg');
  define('bgRed', [41, 49], 'bg');
  define('bgGreen', [42, 49], 'bg');
  define('bgYellow', [43, 49], 'bg');
  define('bgBlue', [44, 49], 'bg');
  define('bgMagenta', [45, 49], 'bg');
  define('bgCyan', [46, 49], 'bg');
  define('bgWhite', [47, 49], 'bg');

  define('blackBright', [90, 39], 'bright');
  define('redBright', [91, 39], 'bright');
  define('greenBright', [92, 39], 'bright');
  define('yellowBright', [93, 39], 'bright');
  define('blueBright', [94, 39], 'bright');
  define('magentaBright', [95, 39], 'bright');
  define('cyanBright', [96, 39], 'bright');
  define('whiteBright', [97, 39], 'bright');

  define('bgBlackBright', [100, 49], 'bgBright');
  define('bgRedBright', [101, 49], 'bgBright');
  define('bgGreenBright', [102, 49], 'bgBright');
  define('bgYellowBright', [103, 49], 'bgBright');
  define('bgBlueBright', [104, 49], 'bgBright');
  define('bgMagentaBright', [105, 49], 'bgBright');
  define('bgCyanBright', [106, 49], 'bgBright');
  define('bgWhiteBright', [107, 49], 'bgBright');

  colors.hasColor = str => typeof str === 'string' && str !== '' && ANSI_REGEX.test(str);

  colors.alias = (name, fn) => {
    if (typeof fn === 'string') fn = colors[fn];
    if (typeof fn !== 'function') throw new TypeError('Expected alias to be the name of an existing color (string) or a function');
    
    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get() {
        let color = input => applyStyle(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });

    if (!fn.stack) {
      fn.stack = [name];
      colors.styles[name] = fn;
    }
  };

  colors.theme = theme => {
    if (!isObject(theme)) throw new TypeError('Expected theme to be an object');
    for (const name of Object.keys(theme)) {
      colors.alias(name, theme[name]);
    }
    return colors;
  };

  colors.alias('unstyle', str => typeof str === 'string' ? str.replace(ANSI_REGEX, '') : '');
  colors.alias('noop', str => str);
  colors.none = colors.clear = colors.noop;
  colors.stripColor = colors.unstyle;
  colors.symbols = require('./symbols');
  colors.define = define;

  return colors;
};

module.exports = createColors();
module.exports.create = createColors;
