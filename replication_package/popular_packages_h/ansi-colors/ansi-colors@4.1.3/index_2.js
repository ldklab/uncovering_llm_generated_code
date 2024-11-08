'use strict';

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const hasColor = () => (typeof process !== 'undefined' ? process.env.FORCE_COLOR !== '0' : false);

function create() {
  const colors = {
    enabled: hasColor(),
    visible: true,
    styles: {},
    keys: {},
  };

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
    for (let n = stack.length - 1; n >= 0; n--) {
      str = wrap(colors.styles[stack[n]], str, nl);
    }
    return str;
  };

  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    colors.keys[type] = colors.keys[type] || [];
    colors.keys[type].push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      get: function() {
        const colorFunc = input => style(input, colorFunc.stack);
        Reflect.setPrototypeOf(colorFunc, colors);
        colorFunc.stack = this.stack ? this.stack.concat(name) : [name];
        return colorFunc;
      },
    });
  };

  const setupStyles = () => {
    const modifiers = [
      ['reset', [0, 0]], ['bold', [1, 22]], ['dim', [2, 22]], ['italic', [3, 23]],
      ['underline', [4, 24]], ['inverse', [7, 27]], ['hidden', [8, 28]], ['strikethrough', [9, 29]]
    ];
    const colorsList = [
      ['black', [30, 39]], ['red', [31, 39]], ['green', [32, 39]], ['yellow', [33, 39]],
      ['blue', [34, 39]], ['magenta', [35, 39]], ['cyan', [36, 39]], ['white', [37, 39]], 
      ['gray', [90, 39]], ['grey', [90, 39]]
    ];
    const bgList = [
      ['bgBlack', [40, 49]], ['bgRed', [41, 49]], ['bgGreen', [42, 49]], ['bgYellow', [43, 49]],
      ['bgBlue', [44, 49]], ['bgMagenta', [45, 49]], ['bgCyan', [46, 49]], ['bgWhite', [47, 49]]
    ];
    const brightList = [
      ['blackBright', [90, 39]], ['redBright', [91, 39]], ['greenBright', [92, 39]],
      ['yellowBright', [93, 39]], ['blueBright', [94, 39]], ['magentaBright', [95, 39]],
      ['cyanBright', [96, 39]], ['whiteBright', [97, 39]]
    ];
    const bgBrightList = [
      ['bgBlackBright', [100, 49]], ['bgRedBright', [101, 49]], ['bgGreenBright', [102, 49]],
      ['bgYellowBright', [103, 49]], ['bgBlueBright', [104, 49]], 
      ['bgMagentaBright', [105, 49]], ['bgCyanBright', [106, 49]], ['bgWhiteBright', [107, 49]]
    ];

    const defineGroup = (group, type) => 
      group.forEach(([name, codes]) => define(name, codes, type));

    defineGroup(modifiers, 'modifier');
    defineGroup(colorsList, 'color');
    defineGroup(bgList, 'bg');
    defineGroup(brightList, 'bright');
    defineGroup(bgBrightList, 'bgBright');
  };

  setupStyles();

  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = colors.hasAnsi = str =>
    typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);

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
      get: function() {
        const colorFunc = input => style(input, colorFunc.stack);
        Reflect.setPrototypeOf(colorFunc, colors);
        colorFunc.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return colorFunc;
      },
    });
  };

  colors.theme = custom => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (const name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  colors.alias('unstyle', str => (typeof str === 'string' ? str.replace(colors.ansiRegex, '') : ''));
  colors.alias('noop', str => str);
  colors.none = colors.clear = colors.noop;
  colors.stripColor = colors.unstyle;
  return colors;
}

module.exports = create();
module.exports.create = create;
