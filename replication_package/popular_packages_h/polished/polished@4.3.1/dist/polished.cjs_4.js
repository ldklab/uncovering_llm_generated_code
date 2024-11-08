'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { default: _extends } = require('@babel/runtime/helpers/extends');
const { default: _assertThisInitialized } = require('@babel/runtime/helpers/assertThisInitialized');
const { default: _inheritsLoose } = require('@babel/runtime/helpers/inheritsLoose');
const { default: _wrapNativeSuper } = require('@babel/runtime/helpers/wrapNativeSuper');
const { default: _taggedTemplateLiteralLoose } = require('@babel/runtime/helpers/taggedTemplateLiteralLoose');

function last(...args) {
  return args?.[args.length - 1];
}

function negation(a) {
  return -a;
}

function addition(a, b) {
  return a + b;
}

function subtraction(a, b) {
  return a - b;
}

function multiplication(a, b) {
  return a * b;
}

function division(a, b) {
  return a / b;
}

function max(...args) {
  return Math.max(...args);
}

function min(...args) {
  return Math.min(...args);
}

function comma(...args) {
  return Array.of(...args);
}

const defaultSymbols = {
  symbols: {
    '*': {
      infix: {
        symbol: '*',
        f: multiplication,
        notation: 'infix',
        precedence: 4,
        rightToLeft: 0,
        argCount: 2,
      },
      symbol: '*',
      regSymbol: '\\*',
    },
    '/': {
      infix: {
        symbol: '/',
        f: division,
        notation: 'infix',
        precedence: 4,
        rightToLeft: 0,
        argCount: 2,
      },
      symbol: '/',
      regSymbol: '/',
    },
    '+': {
      infix: {
        symbol: '+',
        f: addition,
        notation: 'infix',
        precedence: 2,
        rightToLeft: 0,
        argCount: 2,
      },
      prefix: {
        symbol: '+',
        f: last,
        notation: 'prefix',
        precedence: 3,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: '+',
      regSymbol: '\\+',
    },
    '-': {
      infix: {
        symbol: '-',
        f: subtraction,
        notation: 'infix',
        precedence: 2,
        rightToLeft: 0,
        argCount: 2,
      },
      prefix: {
        symbol: '-',
        f: negation,
        notation: 'prefix',
        precedence: 3,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: '-',
      regSymbol: '-',
    },
    ',': {
      infix: {
        symbol: ',',
        f: comma,
        notation: 'infix',
        precedence: 1,
        rightToLeft: 0,
        argCount: 2,
      },
      symbol: ',',
      regSymbol: ',',
    },
    '(': {
      prefix: {
        symbol: '(',
        f: last,
        notation: 'prefix',
        precedence: 0,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: '(',
      regSymbol: '\\(',
    },
    ')': {
      postfix: {
        symbol: ')',
        f: undefined,
        notation: 'postfix',
        precedence: 0,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: ')',
      regSymbol: '\\)',
    },
    min: {
      func: {
        symbol: 'min',
        f: min,
        notation: 'func',
        precedence: 0,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: 'min',
      regSymbol: 'min\\b',
    },
    max: {
      func: {
        symbol: 'max',
        f: max,
        notation: 'func',
        precedence: 0,
        rightToLeft: 0,
        argCount: 1,
      },
      symbol: 'max',
      regSymbol: 'max\\b',
    }
  }
};

class PolishedError extends _wrapNativeSuper(Error) {
  constructor(code, ...args) {
    let message;
    if (process.env.NODE_ENV === 'production') {
      message = `An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#${code} for more information.`;
    } else {
      message = format(ERRORS[code], ...args);
    }
    super(message);
    return _assertThisInitialized(this);
  }
}

function exec(operators, values) {
  const op = operators.pop();
  values.push(op.f(...values.splice(-op.argCount)));
  return op.precedence;
}

function calculate(expression, additionalSymbols) {
  const symbolMap = mergeSymbolMaps(additionalSymbols);
  const operators = [symbolMap.symbols['('].prefix];
  let values = [];
  const pattern = new RegExp("\\d+(?:\\.\\d+)?|"
    + Object.keys(symbolMap.symbols).map(key => symbolMap.symbols[key])
      .sort((a, b) => b.symbol.length - a.symbol.length)
      .map(val => val.regSymbol).join('|') + "|(\\S)", 'g');
  let match;
  let afterValue = false;

  do {
    match = pattern.exec(expression);
    const [token, bad] = match || [')', undefined];
    const notNumber = symbolMap.symbols[token];
    const notAfterValue = !notNumber || !notNumber.postfix && !notNumber.infix;
    if (bad || (afterValue ? notAfterValue : !notNumber || (!notNumber.prefix && !notNumber.func))) {
      throw new PolishedError(37, match ? match.index : expression.length, expression);
    }
    if (afterValue) {
      const curr = notNumber.postfix || notNumber.infix;
      while ((curr.precedence - operators[operators.length - 1].precedence || operators[operators.length - 1].rightToLeft) <= 0 &&
        exec(operators, values));
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

function math(formula, additionalSymbols) {
  const reversedFormula = reverseString(formula);
  const formulaMatch = reversedFormula.match(unitRegExp);

  if (formulaMatch && !formulaMatch.every(unit => unit === formulaMatch[0])) {
    throw new PolishedError(41);
  }
  const cleanFormula = reverseString(reversedFormula.replace(unitRegExp, ''));
  return `${calculate(cleanFormula, additionalSymbols)}${formulaMatch ? reverseString(formulaMatch[0]) : ''}`;
}

exports.adjustHue = curriedAdjustHue;
exports.animation = animation;
exports.backgroundImages = backgroundImages;
exports.backgrounds = backgrounds;
exports.between = between;
exports.border = border;
exports.borderColor = borderColor;
exports.borderRadius = borderRadius;
exports.borderStyle = borderStyle;
exports.borderWidth = borderWidth;
exports.buttons = buttons;
exports.clearFix = clearFix;
exports.complement = complement;
exports.cover = cover;
exports.cssVar = cssVar;
exports.darken = curriedDarken;
exports.desaturate = curriedDesaturate;
exports.directionalProperty = directionalProperty;
exports.easeIn = easeIn;
exports.easeInOut = easeInOut;
exports.easeOut = easeOut;
exports.ellipsis = ellipsis;
exports.em = em;
exports.fluidRange = fluidRange;
exports.fontFace = fontFace;
exports.getContrast = getContrast;
exports.getLuminance = getLuminance;
exports.getValueAndUnit = getValueAndUnit;
exports.grayscale = grayscale;
exports.hiDPI = hiDPI;
exports.hideText = hideText;
exports.hideVisually = hideVisually;
exports.hsl = hsl;
exports.hslToColorString = hslToColorString;
exports.hsla = hsla;
exports.important = important;
exports.invert = invert;
exports.lighten = curriedLighten;
exports.linearGradient = linearGradient;
exports.margin = margin;
exports.math = math;
exports.meetsContrastGuidelines = meetsContrastGuidelines;
exports.mix = mix;
exports.modularScale = modularScale;
exports.normalize = normalize;
exports.opacify = curriedOpacify;
exports.padding = padding;
exports.parseToHsl = parseToHsl;
exports.parseToRgb = parseToRgb;
exports.position = position;
exports.radialGradient = radialGradient;
exports.readableColor = readableColor;
exports.rem = rem;
exports.remToPx = remToPx;
exports.retinaImage = retinaImage;
exports.rgb = rgb;
exports.rgbToColorString = rgbToColorString;
exports.rgba = rgba;
exports.saturate = curriedSaturate;
exports.setHue = curriedSetHue;
exports.setLightness = curriedSetLightness;
exports.setSaturation = curriedSetSaturation;
exports.shade = curriedShade;
exports.size = size;
exports.stripUnit = stripUnit;
exports.textInputs = textInputs;
exports.timingFunctions = timingFunctions;
exports.tint = curriedTint;
exports.toColorString = toColorString;
exports.transitions = transitions;
exports.transparentize = curriedTransparentize;
exports.triangle = triangle;
exports.wordWrap = wordWrap;
