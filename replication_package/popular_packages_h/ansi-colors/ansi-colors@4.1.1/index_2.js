'use strict';

const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val); // Check if value is a plain object
const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g; // Regex to match ANSI escape codes

// Function to create the colors object
const create = () => {
  const colors = { enabled: true, visible: true, styles: {}, keys: {} }; // Initialize colors object

  // Check environment variable to force color usage
  if ('FORCE_COLOR' in process.env) {
    colors.enabled = process.env.FORCE_COLOR !== '0';
  }

  // Internal function to create ANSI escape sequences
  const ansi = (style) => {
    style.open = `\u001b[${style.codes[0]}m`; // Opening escape code
    style.close = `\u001b[${style.codes[1]}m`; // Closing escape code
    style.regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g');
    
    style.wrap = (input, newline) => {
      // If input contains the closing code, replace it with the correct sequence
      if (input.includes(style.close)) input = input.replace(style.regex, style.close + style.open);
      let output = style.open + input + style.close;
      return newline ? output.replace(/\r*\n/g, `${style.close}$&${style.open}`) : output;
    };
    return style;
  };

  const wrap = (style, input, newline) => (typeof style === 'function' ? style(input) : style.wrap(input, newline));

  // Function to apply a stack of styles to the input
  const style = (input, stack) => {
    if (input === '' || input == null || colors.enabled === false) return input;
    if (colors.visible === false) return '';
    let str = '' + input;
    let nl = str.includes('\n');
    while (stack.length > 0) str = wrap(colors.styles[stack.pop()], str, nl);
    return str;
  };

  // Function to define a style with ANSI codes
  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes }); // Create and store the style
    (colors.keys[type] ||= []).push(name); // Add the style name to its type category

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get() {
        let color = (input) => style(input, color.stack); // Function to apply the style
        Reflect.setPrototypeOf(color, colors);
        color.stack = (this.stack ? this.stack.concat(name) : [name]);
        return color;
      }
    });
  };

  // Define core text styles
  define('reset', [0, 0], 'modifier');
  define('bold', [1, 22], 'modifier');
  define('dim', [2, 22], 'modifier');
  define('italic', [3, 23], 'modifier');
  define('underline', [4, 24], 'modifier');
  define('inverse', [7, 27], 'modifier');
  define('hidden', [8, 28], 'modifier');
  define('strikethrough', [9, 29], 'modifier');

  // Define text colors
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

  // Define background colors
  define('bgBlack', [40, 49], 'bg');
  define('bgRed', [41, 49], 'bg');
  define('bgGreen', [42, 49], 'bg');
  define('bgYellow', [43, 49], 'bg');
  define('bgBlue', [44, 49], 'bg');
  define('bgMagenta', [45, 49], 'bg');
  define('bgCyan', [46, 49], 'bg');
  define('bgWhite', [47, 49], 'bg');

  // Define bright text colors
  define('blackBright', [90, 39], 'bright');
  define('redBright', [91, 39], 'bright');
  define('greenBright', [92, 39], 'bright');
  define('yellowBright', [93, 39], 'bright');
  define('blueBright', [94, 39], 'bright');
  define('magentaBright', [95, 39], 'bright');
  define('cyanBright', [96, 39], 'bright');
  define('whiteBright', [97, 39], 'bright');

  // Define bright background colors
  define('bgBlackBright', [100, 49], 'bgBright');
  define('bgRedBright', [101, 49], 'bgBright');
  define('bgGreenBright', [102, 49], 'bgBright');
  define('bgYellowBright', [103, 49], 'bgBright');
  define('bgBlueBright', [104, 49], 'bgBright');
  define('bgMagentaBright', [105, 49], 'bgBright');
  define('bgCyanBright', [106, 49], 'bgBright');
  define('bgWhiteBright', [107, 49], 'bgBright');

  // Check if input has ANSI codes
  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = colors.hasAnsi = (str) => {
    colors.ansiRegex.lastIndex = 0;
    return typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);
  };

  // Define aliases for styles and functions
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
      get() {
        let color = (input) => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = (this.stack ? this.stack.concat(fn.stack) : fn.stack);
        return color;
      }
    });
  };

  // Apply a custom theme defined as an object
  colors.theme = (custom) => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (let name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  // Remove ANSI styles from a string
  colors.alias('unstyle', (str) => {
    if (typeof str === 'string' && str !== '') {
      colors.ansiRegex.lastIndex = 0;
      return str.replace(colors.ansiRegex, '');
    }
    return '';
  });

  colors.alias('noop', (str) => str); // No-operation alias
  colors.none = colors.clear = colors.noop;

  colors.stripColor = colors.unstyle;
  return colors;
};

module.exports = create(); // Export initialized colors object
module.exports.create = create; // Export create function for new instances
