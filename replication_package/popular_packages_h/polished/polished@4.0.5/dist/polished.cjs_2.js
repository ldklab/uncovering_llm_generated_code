'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _extends = require('@babel/runtime/helpers/extends');
const _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
const _inheritsLoose = require('@babel/runtime/helpers/inheritsLoose');
const _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { 'default': e };
}

const _extends__default = /*#__PURE__*/ _interopDefaultLegacy(_extends);
const _assertThisInitialized__default = /*#__PURE__*/ _interopDefaultLegacy(_assertThisInitialized);
const _inheritsLoose__default = /*#__PURE__*/ _interopDefaultLegacy(_inheritsLoose);
const _wrapNativeSuper__default = /*#__PURE__*/ _interopDefaultLegacy(_wrapNativeSuper);

const mathUtils = {
  last() {
    const _ref = arguments.length - 1;
    return _ref < 0 || arguments.length <= _ref ? undefined : arguments[_ref];
  },
  negation(a) {
    return -a;
  },
  addition(a, b) {
    return a + b;
  },
  subtraction(a, b) {
    return a - b;
  },
  multiplication(a, b) {
    return a * b;
  },
  division(a, b) {
    return a / b;
  },
  max() {
    return Math.max.apply(Math, arguments);
  },
  min() {
    return Math.min.apply(Math, arguments);
  },
  comma() {
    return Array.of.apply(Array, arguments);
  }
};

const defaultSymbols = {
  symbols: {
    '*': {
      infix: { symbol: '*', f: mathUtils.multiplication, precedence: 4, argCount: 2 },
      symbol: '*', regSymbol: '\\*'
    },
    '/': {
      infix: { symbol: '/', f: mathUtils.division, precedence: 4, argCount: 2 },
      symbol: '/', regSymbol: '/'
    },
    '+': {
      infix: { symbol: '+', f: mathUtils.addition, precedence: 2, argCount: 2 },
      prefix: { symbol: '+', f: mathUtils.last, precedence: 3, argCount: 1 },
      symbol: '+', regSymbol: '\\+'
    },
    '-': {
      infix: { symbol: '-', f: mathUtils.subtraction, precedence: 2, argCount: 2 },
      prefix: { symbol: '-', f: mathUtils.negation, precedence: 3, argCount: 1 },
      symbol: '-', regSymbol: '-'
    },
    ',': {
      infix: { symbol: ',', f: mathUtils.comma, precedence: 1, argCount: 2 },
      symbol: ',', regSymbol: ','
    },
    '(': {
      prefix: { symbol: '(', f: mathUtils.last, precedence: 0, argCount: 1 },
      symbol: '(', regSymbol: '\\('
    },
    ')': {
      postfix: { symbol: ')', notation: 'postfix', precedence: 0, argCount: 1 },
      symbol: ')', regSymbol: '\\)'
    },
    min: {
      func: { symbol: 'min', f: mathUtils.min, notation: 'func', precedence: 0, argCount: 1 },
      symbol: 'min', regSymbol: 'min\\b'
    },
    max: {
      func: { symbol: 'max', f: mathUtils.max, notation: 'func', precedence: 0, argCount: 1 },
      symbol: 'max', regSymbol: 'max\\b'
    }
  }
};

const ERRORS = {
  "1": "Invalid arguments for hsl.",
  "2": "Invalid arguments for hsla.",
  // ... Other error messages ...
  "73": "Invalid CSS variable.",
  "74": "CSS variable not found and no default provided."
};

function format() {
  const args = Array.from(arguments);
  const a = args[0];
  const b = args.slice(1);
  return b.reduce((str, value) => str.replace("%s", value), a);
}

class PolishedError extends /*#__PURE__*/_wrapNativeSuper__default['default'](Error) {
  constructor(code, ...args) {
    if (process.env.NODE_ENV === 'production') {
      super(`Error occurred. See https://github.com/styled-components/polished for more info.`);
    } else {
      super(format(ERRORS[code], ...args));
    }
    this.name = 'PolishedError';
  }
}

const cssVariableRegex = /--[\S]*/g;

function cssVar(cssVariable, defaultValue) {
  if (!cssVariable || !cssVariable.match(cssVariableRegex)) {
    throw new PolishedError(73);
  }
  let variableValue;
  if (typeof document !== 'undefined' && document.documentElement !== null) {
    variableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
  }
  return variableValue ? variableValue.trim() : defaultValue ?? (() => { throw new PolishedError(74); })();
}

function mergeSymbolMaps(additionalSymbols) {
  return {
    symbols: additionalSymbols ? _extends__default['default']({}, defaultSymbols.symbols, additionalSymbols.symbols) : _extends__default['default']({}, defaultSymbols.symbols)
  };
}

function exec(operators, values) {
  const op = operators.pop();
  values.push(op.f.apply(op, values.splice(-op.argCount)));
  return op.precedence;
}

function calculate(expression, additionalSymbols) {
  const symbolMap = mergeSymbolMaps(additionalSymbols);
  const operators = [symbolMap.symbols['('].prefix];
  const values = [];
  const pattern = new RegExp("\\d+(?:\\.\\d+)?|" + Object.keys(symbolMap.symbols).map(key => symbolMap.symbols[key]).sort((a, b) => b.symbol.length - a.symbol.length).map(val => val.regSymbol).join('|') + "|(\\S)", 'g');
  pattern.lastIndex = 0;
  let afterValue = false, match;

  do {
    match = pattern.exec(expression);
    const [token, bad] = match || [')', undefined];
    const notNumber = symbolMap.symbols[token];
    const notNewValue = notNumber && !notNumber.prefix && !notNumber.func;
    const notAfterValue = !notNumber || !notNumber.postfix && !notNumber.infix;

    if (bad || (afterValue ? notAfterValue : notNewValue)) {
      throw new PolishedError(37, match ? match.index : expression.length, expression);
    }

    if (afterValue) {
      let curr = notNumber.postfix || notNumber.infix;
      do {
        let prev = operators[operators.length - 1];
        if ((curr.precedence - prev.precedence || prev.rightToLeft) > 0) break;
      } while (exec(operators, values));
      afterValue = curr.notation === 'postfix';
      if (curr.symbol !== ')') {
        operators.push(curr);
        if (afterValue) exec(operators, values);
      }
    } else if (notNumber) {
      operators.push(notNumber.prefix || notNumber.func);
      if (notNumber.func) {
        match = pattern.exec(expression);
        if (!match || match[0] !== '(') throw new PolishedError(38, match ? match.index : expression.length, expression);
      }
    } else {
      values.push(+token);
      afterValue = true;
    }
  } while (match && operators.length);

  if (operators.length) throw new PolishedError(39, match ? match.index : expression.length, expression);
  if (match) throw new PolishedError(40, match ? match.index : expression.length, expression);

  return values.pop();
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function math(formula, additionalSymbols) {
  const reversedFormula = reverseString(formula);
  const formulaMatch = reversedFormula.match(/((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g);
  
  if (formulaMatch && !formulaMatch.every(unit => unit === formulaMatch[0])) {
    throw new PolishedError(41);
  }
  
  const cleanFormula = reverseString(reversedFormula.replace(/((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g, ''));
  return calculate(cleanFormula, additionalSymbols) + (formulaMatch ? reverseString(formulaMatch[0]) : '');
}

const unitRegExp = /((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g;

const cssUtils = {
  stripUnit(value) {
    if (typeof value !== 'string') return value;
    const matchedValue = value.match(/^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/);
    return matchedValue ? parseFloat(value) : value;
  },
  directionalProperty(property, ...values) {
    const [firstValue, secondValue = firstValue, thirdValue = firstValue, fourthValue = secondValue] = values;
    const valuesWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];
    return positionMap.reduce((acc, position, i) => {
      if (valuesWithDefaults[i] || valuesWithDefaults[i] === 0) {
        acc[generateProperty(property, position)] = valuesWithDefaults[i];
      }
      return acc;
    }, {});
  },
  important(styleBlock, rules) {
    if (typeof styleBlock !== 'object' || styleBlock === null) {
      throw new PolishedError(75, typeof styleBlock);
    }

    return Object.keys(styleBlock).reduce((newStyleBlock, key) => {
      if (typeof styleBlock[key] === 'object' && styleBlock[key] !== null) {
        newStyleBlock[key] = cssUtils.important(styleBlock[key], rules);
      } else if (!rules || rules.includes(key)) {
        newStyleBlock[key] = styleBlock[key] + " !important";
      } else {
        newStyleBlock[key] = styleBlock[key];
      }
      return newStyleBlock;
    }, {});
  }
};

const colorUtils = {
  mix(weight, color, otherColor) {
    if (color === 'transparent') return otherColor;
    if (otherColor === 'transparent') return color;
    if (weight === 0) return otherColor;

    const parsedColor1 = parseToRgb(color);
    const color1 = { ...parsedColor1, alpha: parsedColor1.alpha || 1 };
    const parsedColor2 = parseToRgb(otherColor);
    const color2 = { ...parsedColor2, alpha: parsedColor2.alpha || 1 };

    const alphaDelta = color1.alpha - color2.alpha;
    const x = weight * 2 - 1;
    const y = x * alphaDelta === -1 ? x : x + alphaDelta;
    const z = 1 + x * alphaDelta;
    const weight1 = (y / z + 1) / 2.0;
    const weight2 = 1 - weight1;

    const mixedColor = {
      red: Math.floor(color1.red * weight1 + color2.red * weight2),
      green: Math.floor(color1.green * weight1 + color2.green * weight2),
      blue: Math.floor(color1.blue * weight1 + color2.blue * weight2),
      alpha: color1.alpha * weight + color2.alpha * (1 - weight)
    };

    return rgba(mixedColor);
  }
}

exports.mathUtils = mathUtils;
exports.cssUtils = cssUtils;
exports.colorUtils = colorUtils;
exports.cssVar = cssVar;
exports.PolishedError = PolishedError;
exports.math = math;
