'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _extends = require('@babel/runtime/helpers/extends');
const _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
const _inheritsLoose = require('@babel/runtime/helpers/inheritsLoose');
const _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
const _taggedTemplateLiteralLoose = require('@babel/runtime/helpers/taggedTemplateLiteralLoose');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

const _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);
const _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
const _inheritsLoose__default = /*#__PURE__*/_interopDefaultLegacy(_inheritsLoose);
const _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultLegacy(_wrapNativeSuper);
const _taggedTemplateLiteralLoose__default = /*#__PURE__*/_interopDefaultLegacy(_taggedTemplateLiteralLoose);

function getLastArgument() {
  const index = arguments.length - 1;
  return index < 0 ? undefined : arguments[index];
}

function negate(value) {
  return -value;
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function maximum() {
  return Math.max(...arguments);
}

function minimum() {
  return Math.min(...arguments);
}

function joinWithComma() {
  return Array.from(arguments);
}

const defaultSymbols = {
  symbols: {
    '*': { infix: { symbol: '*', f: multiply, precedence: 4, argCount: 2 }, regSymbol: '\\*' },
    '/': { infix: { symbol: '/', f: divide, precedence: 4, argCount: 2 }, regSymbol: '/' },
    '+': { 
      infix: { symbol: '+', f: add, precedence: 2, argCount: 2 },
      prefix: { symbol: '+', f: getLastArgument, precedence: 3, argCount: 1 },
      regSymbol: '\\+'
    },
    '-': { 
      infix: { symbol: '-', f: subtract, precedence: 2, argCount: 2 },
      prefix: { symbol: '-', f: negate, precedence: 3, argCount: 1 },
      regSymbol: '-'
    },
    ',': { 
      infix: { symbol: ',', f: joinWithComma, precedence: 1, argCount: 2 }, 
      regSymbol: ','
    },
    '(': { prefix: { symbol: '(', f: getLastArgument, precedence: 0, argCount: 1 }, regSymbol: '\\(' },
    ')': { postfix: { symbol: ')', precedence: 0, argCount: 1 }, regSymbol: '\\)' },
    min: { func: { symbol: 'min', f: minimum, precedence: 0, argCount: 1 }, regSymbol: 'min\\b' },
    max: { func: { symbol: 'max', f: maximum, precedence: 0, argCount: 1 }, regSymbol: 'max\\b' }
  }
};

const ERRORS = {
  "1": "Passed invalid arguments to hsl, please pass multiple numbers e.g. hsl(360, 0.75, 0.4) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75 }).",
  "2": "Passed invalid arguments to hsla, please pass multiple numbers e.g. hsla(360, 0.75, 0.4, 0.7) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75, alpha: 0.7 }).",
  "3": "Passed an incorrect argument to a color function, please pass a string representation of a color.",
  "4": "Couldn't generate valid rgb string from %s, it returned %s.",
  "5": "Couldn't parse the color string. Please provide the color as a string in hex, rgb, rgba, hsl or hsla notation.",
  "6": "Passed invalid arguments to rgb, please pass multiple numbers e.g. rgb(255, 205, 100) or an object e.g. rgb({ red: 255, green: 205, blue: 100 }).",
  "7": "Passed invalid arguments to rgba, please pass multiple numbers e.g. rgb(255, 205, 100, 0.75) or an object e.g. rgb({ red: 255, green: 205, blue: 100, alpha: 0.75 }).",
  "8": "Passed invalid argument to toColorString, please pass a RgbColor, RgbaColor, HslColor or HslaColor object.",
  "9": "Please provide a number of steps to the modularScale helper.",
  "10": "Please pass a number or one of the predefined scales to the modularScale helper as the ratio.",
  "11": "Invalid value passed as base to modularScale, expected number or em string but got \"%s\"",
  "12": "Expected a string ending in \"px\" or a number passed as the first argument to %s(), got \"%s\" instead.",
  "13": "Expected a string ending in \"px\" or a number passed as the second argument to %s(), got \"%s\" instead.",
  "14": "Passed invalid pixel value (\"%s\") to %s(), please pass a value like \"12px\" or 12.",
  "15": "Passed invalid base value (\"%s\") to %s(), please pass a value like \"12px\" or 12.",
  "16": "You must provide a template to this method.",
  "17": "You passed an unsupported selector state to this method.",
  "18": "minScreen and maxScreen must be provided as stringified numbers with the same units.",
  "19": "fromSize and toSize must be provided as stringified numbers with the same units.",
  "20": "expects either an array of objects or a single object with the properties prop, fromSize, and toSize.",
  "21": "expects the objects in the first argument array to have the properties `prop`, `fromSize`, and `toSize`.",
  "22": "expects the first argument object to have the properties `prop`, `fromSize`, and `toSize`.",
  "23": "fontFace expects a name of a font-family.",
  "24": "fontFace expects either the path to the font file(s) or a name of a local copy.",
  "25": "fontFace expects localFonts to be an array.",
  "26": "fontFace expects fileFormats to be an array.",
  "27": "radialGradient requries at least 2 color-stops to properly render.",
  "28": "Please supply a filename to retinaImage() as the first argument.",
  "29": "Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.",
  "30": "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.",
  "31": "The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation",
  "32": "To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s')",
  "33": "The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation",
  "34": "borderRadius expects a radius value as a string or number as the second argument.",
  "35": "borderRadius expects one of \"top\", \"bottom\", \"left\" or \"right\" as the first argument.",
  "36": "Property must be a string value.",
  "37": "Syntax Error at %s.",
  "38": "Formula contains a function that needs parentheses at %s.",
  "39": "Formula is missing closing parenthesis at %s.",
  "40": "Formula has too many closing parentheses at %s.",
  "41": "All values in a formula must have the same unit or be unitless.",
  "42": "Please provide a number of steps to the modularScale helper.",
  "43": "Please pass a number or one of the predefined scales to the modularScale helper as the ratio.",
  "44": "Invalid value passed as base to modularScale, expected number or em/rem string but got %s.",
  "45": "Passed invalid argument to hslToColorString, please pass a HslColor or HslaColor object.",
  "46": "Passed invalid argument to rgbToColorString, please pass a RgbColor or RgbaColor object.",
  "47": "minScreen and maxScreen must be provided as stringified numbers with the same units.",
  "48": "fromSize and toSize must be provided as stringified numbers with the same units.",
  "49": "Expects either an array of objects or a single object with the properties prop, fromSize, and toSize.",
  "50": "Expects the objects in the first argument array to have the properties prop, fromSize, and toSize.",
  "51": "Expects the first argument object to have the properties prop, fromSize, and toSize.",
  "52": "fontFace expects either the path to the font file(s) or a name of a local copy.",
  "53": "fontFace expects localFonts to be an array.",
  "54": "fontFace expects fileFormats to be an array.",
  "55": "fontFace expects a name of a font-family.",
  "56": "linearGradient requries at least 2 color-stops to properly render.",
  "57": "radialGradient requries at least 2 color-stops to properly render.",
  "58": "Please supply a filename to retinaImage() as the first argument.",
  "59": "Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.",
  "60": "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.",
  "61": "Property must be a string value.",
  "62": "borderRadius expects a radius value as a string or number as the second argument.",
  "63": "borderRadius expects one of \"top\", \"bottom\", \"left\" or \"right\" as the first argument.",
  "64": "The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation.",
  "65": "To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s').",
  "66": "The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation.",
  "67": "You must provide a template to this method.",
  "68": "You passed an unsupported selector state to this method.",
  "69": "Expected a string ending in \"px\" or a number passed as the first argument to %s(), got %s instead.",
  "70": "Expected a string ending in \"px\" or a number passed as the second argument to %s(), got %s instead.",
  "71": "Passed invalid pixel value %s to %s(), please pass a value like \"12px\" or 12.",
  "72": "Passed invalid base value %s to %s(), please pass a value like \"12px\" or 12.",
  "73": "Please provide a valid CSS variable.",
  "74": "CSS variable not found and no default was provided.",
  "75": "important requires a valid style object, got a %s instead.",
  "76": "fromSize and toSize must be provided as stringified numbers with the same units as minScreen and maxScreen."
};

function format() {
  for (let args = new Array(arguments.length), i = 0; i < arguments.length; i++) {
    args[i] = arguments[i];
  }
  
  let a = args[0];
  const b = [];

  for (let c = 1; c < args.length; c++) {
    b.push(args[c]);
  }

  b.forEach(d => {
    a = a.replace(/%[a-z]/, d);
  });
  
  return a;
}

class PolishedError extends /*#__PURE__*/_wrapNativeSuper__default['default'](Error) {
  constructor(code, ...args) {
    const message = process.env.NODE_ENV === 'production'
      ? `An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#${code} for more information.`
      : format(ERRORS[code], ...args);
    super(message);
    return _assertThisInitialized__default['default'](this);
  }
}

const unitRegExp = /((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g;

function mergeSymbolMaps(additionalSymbols) {
  return {
    symbols: additionalSymbols 
      ? _extends__default['default']({}, defaultSymbols.symbols, additionalSymbols.symbols) 
      : _extends__default['default']({}, defaultSymbols.symbols)
  };
}

function exec(operators, values) {
  const op = operators.pop();
  values.push(op.f(...values.splice(-op.argCount)));
  return op.precedence;
}

function calculate(expression, additionalSymbols) {
  const symbolMap = mergeSymbolMaps(additionalSymbols);
  let match;
  const operators = [symbolMap.symbols['('].prefix];
  const values = [];
  const pattern = new RegExp(
    "\\d+(?:\\.\\d+)?|" +
    Object.keys(symbolMap.symbols)
      .map(key => symbolMap.symbols[key])
      .sort((a, b) => b.symbol.length - a.symbol.length)
      .map(val => val.regSymbol)
      .join('|') +
    "|(\\S)", 
    'g'
  );
  
  pattern.lastIndex = 0;

  let afterValue = false;

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
      const curr = notNumber.postfix || notNumber.infix;

      do {
        const prev = operators[operators.length - 1];
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

        if (!match || match[0] !== '(') {
          throw new PolishedError(38, match ? match.index : expression.length, expression);
        }
      }
    } else {
      values.push(+token);
      afterValue = true;
    }
  } while (match && operators.length);

  if (operators.length) {
    throw new PolishedError(39, match ? match.index : expression.length, expression);
  } else if (match) {
    throw new PolishedError(40, match ? match.index : expression.length, expression);
  } else {
    return values.pop();
  }
}

function reverseString(str) {
  return str.split('').reverse().join('');
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

const cssVariableRegex = /--[\S]*/g;

function cssVar(cssVariable, defaultValue) {
  if (!cssVariable || !cssVariable.match(cssVariableRegex)) {
    throw new PolishedError(73);
  }

  let variableValue;
  
  if (typeof document !== 'undefined' && document.documentElement !== null) {
    variableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
  }

  if (variableValue) {
    return variableValue.trim();
  } else if (defaultValue) {
    return defaultValue;
  }

  throw new PolishedError(74);
}

function capitalizeString(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const positionMap = ['Top', 'Right', 'Bottom', 'Left'];

function generateProperty(property, position) {
  if (!property) return position.toLowerCase();
  const splitProperty = property.split('-');

  if (splitProperty.length > 1) {
    splitProperty.splice(1, 0, position);
    return splitProperty.reduce((acc, val) => `${acc}${capitalizeString(val)}`);
  }

  const joinedProperty = property.replace(/([a-z])([A-Z])/g, `$1${position}$2`);
  return property === joinedProperty ? `${property}${position}` : joinedProperty;
}

function generateStyles(property, valuesWithDefaults) {
  const styles = {};

  for (let i = 0; i < valuesWithDefaults.length; i++) {
    if (valuesWithDefaults[i] || valuesWithDefaults[i] === 0) {
      styles[generateProperty(property, positionMap[i])] = valuesWithDefaults[i];
    }
  }

  return styles;
}

function directionalProperty(property, ...values) {
  const [firstValue, secondValue = firstValue, thirdValue = firstValue, fourthValue = secondValue] = values;
  const valuesWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];
  return generateStyles(property, valuesWithDefaults);
}

function endsWith(string, suffix) {
  return string.substr(-suffix.length) === suffix;
}

const cssRegex = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

function stripUnit(value) {
  if (typeof value !== 'string') return value;
  const matchedValue = value.match(cssRegex);
  return matchedValue ? parseFloat(value) : value;
}

const pxtoFactory = to => (pxval, base = '16px') => {
  let newPxval = pxval;
  let newBase = base;

  if (typeof pxval === 'string') {
    if (!endsWith(pxval, 'px')) {
      throw new PolishedError(69, to, pxval);
    }

    newPxval = stripUnit(pxval);
  }

  if (typeof base === 'string') {
    if (!endsWith(base, 'px')) {
      throw new PolishedError(70, to, base);
    }

    newBase = stripUnit(base);
  }

  if (typeof newPxval === 'string') {
    throw new PolishedError(71, pxval, to);
  }

  if (typeof newBase === 'string') {
    throw new PolishedError(72, base, to);
  }

  return `${newPxval / newBase + to}`;
};

const em = /*#__PURE__*/pxtoFactory('em');

const cssRegexForValueAndUnit = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

function getValueAndUnit(value) {
  if (typeof value !== 'string') return [value, ''];
  const matchedValue = value.match(cssRegexForValueAndUnit);
  if (matchedValue) return [parseFloat(value), matchedValue[2]];
  return [value, undefined];
}

function important(styleBlock, rules) {
  if (typeof styleBlock !== 'object' || styleBlock === null) {
    throw new PolishedError(75, typeof styleBlock);
  }

  const newStyleBlock = {};
  Object.keys(styleBlock).forEach(key => {
    if (typeof styleBlock[key] === 'object' && styleBlock[key] !== null) {
      newStyleBlock[key] = important(styleBlock[key], rules);
    } else if (!rules || (rules === key || rules.indexOf(key) >= 0)) {
      newStyleBlock[key] = `${styleBlock[key]} !important`;
    } else {
      newStyleBlock[key] = styleBlock[key];
    }
  });
  return newStyleBlock;
}

const ratioNames = {
  minorSecond: 1.067,
  majorSecond: 1.125,
  minorThird: 1.2,
  majorThird: 1.25,
  perfectFourth: 1.333,
  augFourth: 1.414,
  perfectFifth: 1.5,
  minorSixth: 1.6,
  goldenSection: 1.618,
  majorSixth: 1.667,
  minorSeventh: 1.778,
  majorSeventh: 1.875,
  octave: 2,
  majorTenth: 2.5,
  majorEleventh: 2.667,
  majorTwelfth: 3,
  doubleOctave: 4
};

function getRatio(ratioName) {
  return ratioNames[ratioName];
}

function modularScale(steps, base = '1em', ratio = 1.333) {
  if (typeof steps !== 'number') {
    throw new PolishedError(42);
  }

  if (typeof ratio === 'string' && !ratioNames[ratio]) {
    throw new PolishedError(43);
  }

  const [realBase, unit] = typeof base === 'string' ? getValueAndUnit(base) : [base, ''];
  const realRatio = typeof ratio === 'string' ? getRatio(ratio) : ratio;

  if (typeof realBase === 'string') {
    throw new PolishedError(44, base);
  }

  return `${realBase * Math.pow(realRatio, steps)}${unit || ''}`;
}

const rem = /*#__PURE__*/pxtoFactory('rem');

function easeIn(functionName) {
  const functionsMap = {
    back: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
    circ: 'cubic-bezier(0.600,  0.040, 0.980, 0.335)',
    cubic: 'cubic-bezier(0.550,  0.055, 0.675, 0.190)',
    expo: 'cubic-bezier(0.950,  0.050, 0.795, 0.035)',
    quad: 'cubic-bezier(0.550,  0.085, 0.680, 0.530)',
    quart: 'cubic-bezier(0.895,  0.030, 0.685, 0.220)',
    quint: 'cubic-bezier(0.755,  0.050, 0.855, 0.060)',
    sine: 'cubic-bezier(0.470,  0.000, 0.745, 0.715)'
  };
  return functionsMap[functionName.toLowerCase().trim()];
}

function easeInOut(functionName) {
  const functionsMap = {
    back: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
    circ: 'cubic-bezier(0.785,  0.135, 0.150, 0.860)',
    cubic: 'cubic-bezier(0.645,  0.045, 0.355, 1.000)',
    expo: 'cubic-bezier(1.000,  0.000, 0.000, 1.000)',
    quad: 'cubic-bezier(0.455,  0.030, 0.515, 0.955)',
    quart: 'cubic-bezier(0.770,  0.000, 0.175, 1.000)',
    quint: 'cubic-bezier(0.860,  0.000, 0.070, 1.000)',
    sine: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)'
  };
  return functionsMap[functionName.toLowerCase().trim()];
}

function easeOut(functionName) {
  const functionsMap = {
    back: 'cubic-bezier(0.175,  0.885, 0.320, 1.275)',
    cubic: 'cubic-bezier(0.215,  0.610, 0.355, 1.000)',
    circ: 'cubic-bezier(0.075,  0.820, 0.165, 1.000)',
    expo: 'cubic-bezier(0.190,  1.000, 0.220, 1.000)',
    quad: 'cubic-bezier(0.250,  0.460, 0.450, 0.940)',
    quart: 'cubic-bezier(0.165,  0.840, 0.440, 1.000)',
    quint: 'cubic-bezier(0.230,  1.000, 0.320, 1.000)',
    sine: 'cubic-bezier(0.390,  0.575, 0.565, 1.000)'
  };
  return functionsMap[functionName.toLowerCase().trim()];
}

function between(fromSize, toSize, minScreen = '320px', maxScreen = '1200px') {
  const [unitlessFromSize, fromSizeUnit] = getValueAndUnit(fromSize);
  const [unitlessToSize, toSizeUnit] = getValueAndUnit(toSize);
  const [unitlessMinScreen, minScreenUnit] = getValueAndUnit(minScreen);
  const [unitlessMaxScreen, maxScreenUnit] = getValueAndUnit(maxScreen);

  if (typeof unitlessMinScreen !== 'number' || typeof unitlessMaxScreen !== 'number' || minScreenUnit !== maxScreenUnit || !minScreenUnit || !maxScreenUnit || fromSizeUnit !== toSizeUnit) {
    throw new PolishedError(47);
  }

  const slope = (unitlessFromSize - unitlessToSize) / (unitlessMinScreen - unitlessMaxScreen);
  const base = unitlessToSize - slope * unitlessMaxScreen;
  return `calc(${base.toFixed(2)}${fromSizeUnit || ''} + ${(100 * slope).toFixed(2)}vw)`;
}

function clearFix(parent = '&') {
  return {
    [`${parent}::after`]: {
      clear: 'both',
      content: '""',
      display: 'table'
    }
  };
}

function cover(offset = 0) {
  return {
    position: 'absolute',
    top: offset,
    right: offset,
    bottom: offset,
    left: offset
  };
}

function ellipsis(width = '100%', lines = 1) {
  const styles = {
    display: 'inline-block',
    maxWidth: width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal'
  };
  return lines > 1 ? _extends__default['default']({}, styles, {
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    display: '-webkit-box',
    whiteSpace: 'normal'
  }) : styles;
}

function fluidRange(cssProp, minScreen = '320px', maxScreen = '1200px') {
  if (!Array.isArray(cssProp) && typeof cssProp !== 'object' || cssProp === null) {
    throw new PolishedError(49);
  }

  if (Array.isArray(cssProp)) {
    const mediaQueries = {};
    const fallbacks = {};

    for (let obj of cssProp) {
      if (!obj.prop || !obj.fromSize || !obj.toSize) {
        throw new PolishedError(50);
      }
      fallbacks[obj.prop] = obj.fromSize;
      mediaQueries[`@media (min-width: ${minScreen})`] = _extends__default['default']({}, mediaQueries[`@media (min-width: ${minScreen})`], { [obj.prop]: between(obj.fromSize, obj.toSize, minScreen, maxScreen) });
      mediaQueries[`@media (min-width: ${maxScreen})`] = _extends__default['default']({}, mediaQueries[`@media (min-width: ${maxScreen})`], { [obj.prop]: obj.toSize });
    }

    return _extends__default['default']({}, fallbacks, mediaQueries);
  } else {
    if (!cssProp.prop || !cssProp.fromSize || !cssProp.toSize) {
      throw new PolishedError(51);
    }
    return {
      [cssProp.prop]: cssProp.fromSize,
      [`@media (min-width: ${minScreen})`]: { [cssProp.prop]: between(cssProp.fromSize, cssProp.toSize, minScreen, maxScreen) },
      [`@media (min-width: ${maxScreen})`]: { [cssProp.prop]: cssProp.toSize }
    };
  }
}

const dataURIRegex = /^\s*data:([a-z]+\/[a-z-]+(;[a-z-]+=[a-z-]+)?)?(;charset=[a-z0-9-]+)?(;base64)?,[a-z0-9!$&',()*+,;=\-._~:@/?%\s]*\s*$/i;
const formatHintMap = {
  woff: 'woff',
  woff2: 'woff2',
  ttf: 'truetype',
  otf: 'opentype',
  eot: 'embedded-opentype',
  svg: 'svg',
  svgz: 'svg'
};

function generateFormatHint(format, formatHint) {
  return formatHint ? ` format("${formatHintMap[format]}")` : '';
}

function isDataURI(fontFilePath) {
  return dataURIRegex.test(fontFilePath);
}

function generateFileReferences(fontFilePath, fileFormats, formatHint) {
  if (isDataURI(fontFilePath)) {
    return `url("${fontFilePath}")${generateFormatHint(fileFormats[0], formatHint)}`;
  }

  return fileFormats.map(format => `url("${fontFilePath}.${format}")${generateFormatHint(format, formatHint)}`).join(', ');
}

function generateLocalReferences(localFonts) {
  return localFonts.map(font => `local("${font}")`).join(', ');
}

function generateSources(fontFilePath, localFonts, fileFormats, formatHint) {
  const fontReferences = [];
  if (localFonts) fontReferences.push(generateLocalReferences(localFonts));

  if (fontFilePath) {
    fontReferences.push(generateFileReferences(fontFilePath, fileFormats, formatHint));
  }

  return fontReferences.join(', ');
}

function fontFace({
  fontFamily,
  fontFilePath,
  fontStretch,
  fontStyle,
  fontVariant,
  fontWeight,
  fileFormats = ['eot', 'woff2', 'woff', 'ttf', 'svg'],
  formatHint = false,
  localFonts = [fontFamily],
  unicodeRange,
  fontDisplay,
  fontVariationSettings,
  fontFeatureSettings
}) {
  if (!fontFamily) throw new PolishedError(55);

  if (!fontFilePath && !localFonts) {
    throw new PolishedError(52);
  }

  if (localFonts && !Array.isArray(localFonts)) {
    throw new PolishedError(53);
  }

  if (!Array.isArray(fileFormats)) {
    throw new PolishedError(54);
  }

  const fontFaceDecl = {
    '@font-face': {
      fontFamily,
      src: generateSources(fontFilePath, localFonts, fileFormats, formatHint),
      unicodeRange,
      fontStretch,
      fontStyle,
      fontVariant,
      fontWeight,
      fontDisplay,
      fontVariationSettings,
      fontFeatureSettings
    }
  };

  return JSON.parse(JSON.stringify(fontFaceDecl));
}

function hideText() {
  return {
    textIndent: '101%',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  };
}

function hideVisually() {
  return {
    border: '0',
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px'
  };
}

function hiDPI(ratio = 1.3) {
  return `
    @media only screen and (-webkit-min-device-pixel-ratio: ${ratio}),
    only screen and (min--moz-device-pixel-ratio: ${ratio}),
    only screen and (-o-min-device-pixel-ratio: ${ratio}/1),
    only screen and (min-resolution: ${Math.round(ratio * 96)}dpi),
    only screen and (min-resolution: ${ratio}dppx)
  `;
}

function constructGradientValue(literals, ...substitutions) {
  let template = '';

  for (let i = 0; i < literals.length; i++) {
    template += literals[i];

    if (i === substitutions.length - 1 && substitutions[i]) {
      const definedValues = substitutions.filter(Boolean);

      if (definedValues.length > 1) {
        template = template.slice(0, -1);
        template += `, ${substitutions[i]}`;
      } else if (definedValues.length === 1) {
        template += `${substitutions[i]}`;
      }
    } else if (substitutions[i]) {
      template += `${substitutions[i]} `;
    }
  }

  return template.trim();
}

function linearGradient({ colorStops, fallback, toDirection = '' }) {
  if (!colorStops || colorStops.length < 2) {
    throw new PolishedError(56);
  }

  return {
    backgroundColor: fallback || colorStops[0].split(' ')[0],
    backgroundImage: constructGradientValue`${toDirection} ${colorStops.join(', ').replace(/,(?=\S)/g, ', ')}`
  };
}

function normalize() {
  return [{
    html: {
      lineHeight: '1.15',
      textSizeAdjust: '100%'
    },
    body: {
      margin: '0'
    },
    main: {
      display: 'block'
    },
    h1: {
      fontSize: '2em',
      margin: '0.67em 0'
    },
    hr: {
      boxSizing: 'content-box',
      height: '0',
      overflow: 'visible'
    },
    pre: {
      fontFamily: 'monospace, monospace',
      fontSize: '1em'
    },
    a: {
      backgroundColor: 'transparent'
    },
    'abbr[title]': {
      borderBottom: 'none',
      textDecoration: 'underline'
    },
    'b,\n    strong': {
      fontWeight: 'bolder'
    },
    'code,\n    kbd,\n    samp': {
      fontFamily: 'monospace, monospace',
      fontSize: '1em'
    },
    small: {
      fontSize: '80%'
    },
    'sub,\n    sup': {
      fontSize: '75%',
      lineHeight: '0',
      position: 'relative',
      verticalAlign: 'baseline'
    },
    sub: {
      bottom: '-0.25em'
    },
    sup: {
      top: '-0.5em'
    },
    img: {
      borderStyle: 'none'
    },
    "button,\n    input,\n    optgroup,\n    select,\n    textarea": {
      fontFamily: 'inherit',
      fontSize: '100%',
      lineHeight: '1.15',
      margin: '0'
    },
    "button,\n    input": {
      overflow: 'visible'
    },
    "button,\n    select": {
      textTransform: 'none'
    },
    "button,\n    html [type=\"button\"],\n    [type=\"reset\"],\n    [type=\"submit\"]": {
      WebkitAppearance: 'button'
    },
    "button::-moz-focus-inner,\n    [type=\"button\"]::-moz-focus-inner,\n    [type=\"reset\"]::-moz-focus-inner,\n    [type=\"submit\"]::-moz-focus-inner": {
      borderStyle: 'none',
      padding: '0'
    },
    "button:-moz-focusring,\n    [type=\"button\"]:-moz-focusring,\n    [type=\"reset\"]:-moz-focusring,\n    [type=\"submit\"]:-moz-focusring": {
      outline: '1px dotted ButtonText'
    },
    fieldset: {
      padding: '0.35em 0.625em 0.75em'
    },
    legend: {
      boxSizing: 'border-box',
      color: 'inherit',
      display: 'table',
      maxWidth: '100%',
      padding: '0',
      whiteSpace: 'normal'
    },
    progress: {
      verticalAlign: 'baseline'
    },
    textarea: {
      overflow: 'auto'
    },
    "[type=\"checkbox\"],\n    [type=\"radio\"]": {
      boxSizing: 'border-box',
      padding: '0'
    },
    "[type=\"number\"]::-webkit-inner-spin-button,\n    [type=\"number\"]::-webkit-outer-spin-button": {
      height: 'auto'
    },
    '[type="search"]': {
      WebkitAppearance: 'textfield',
      outlineOffset: '-2px'
    },
    '[type="search"]::-webkit-search-decoration': {
      WebkitAppearance: 'none'
    },
    '::-webkit-file-upload-button': {
      WebkitAppearance: 'button',
      font: 'inherit'
    },
    details: {
      display: 'block'
    },
    summary: {
      display: 'list-item'
    },
    template: {
      display: 'none'
    },
    '[hidden]': {
      display: 'none'
    }
  }];
}

function radialGradient({ colorStops, extent = '', fallback, position = '', shape = '' }) {
  if (!colorStops || colorStops.length < 2) {
    throw new PolishedError(57);
  }

  return {
    backgroundColor: fallback || colorStops[0].split(' ')[0],
    backgroundImage: constructGradientValue`radial-gradient(${position} ${shape} ${extent} ${colorStops.join(', ')})`
  };
}

function retinaImage(filename, backgroundSize, extension = 'png', retinaFilename, retinaSuffix = '_2x') {
  if (!filename) {
    throw new PolishedError(58);
  }

  const ext = extension.replace(/^\./, '');
  const rFilename = retinaFilename ? `${retinaFilename}.${ext}` : `${filename}${retinaSuffix}.${ext}`;
  return {
    backgroundImage: `url(${filename}.${ext})`,
    [hiDPI()]: {
      backgroundImage: `url(${rFilename})`,
      ...(backgroundSize ? { backgroundSize } : {})
    }
  };
}

const functionsForTiming = {
  easeInBack: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
  easeInCirc: 'cubic-bezier(0.600,  0.040, 0.980, 0.335)',
  easeInCubic: 'cubic-bezier(0.550,  0.055, 0.675, 0.190)',
  easeInExpo: 'cubic-bezier(0.950,  0.050, 0.795, 0.035)',
  easeInQuad: 'cubic-bezier(0.550,  0.085, 0.680, 0.530)',
  easeInQuart: 'cubic-bezier(0.895,  0.030, 0.685, 0.220)',
  easeInQuint: 'cubic-bezier(0.755,  0.050, 0.855, 0.060)',
  easeInSine: 'cubic-bezier(0.470,  0.000, 0.745, 0.715)',
  easeOutBack: 'cubic-bezier(0.175,  0.885, 0.320, 1.275)',
  easeOutCubic: 'cubic-bezier(0.215,  0.610, 0.355, 1.000)',
  easeOutCirc: 'cubic-bezier(0.075,  0.820, 0.165, 1.000)',
  easeOutExpo: 'cubic-bezier(0.190,  1.000, 0.220, 1.000)',
  easeOutQuad: 'cubic-bezier(0.250,  0.460, 0.450, 0.940)',
  easeOutQuart: 'cubic-bezier(0.165,  0.840, 0.440, 1.000)',
  easeOutQuint: 'cubic-bezier(0.230,  1.000, 0.320, 1.000)',
  easeOutSine: 'cubic-bezier(0.390,  0.575, 0.565, 1.000)',
  easeInOutBack: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  easeInOutCirc: 'cubic-bezier(0.785,  0.135, 0.150, 0.860)',
  easeInOutCubic: 'cubic-bezier(0.645,  0.045, 0.355, 1.000)',
  easeInOutExpo: 'cubic-bezier(1.000,  0.000, 0.000, 1.000)',
  easeInOutQuad: 'cubic-bezier(0.455,  0.030, 0.515, 0.955)',
  easeInOutQuart: 'cubic-bezier(0.770,  0.000, 0.175, 1.000)',
  easeInOutQuint: 'cubic-bezier(0.860,  0.000, 0.070, 1.000)',
  easeInOutSine: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)'
};

function getTimingFunction(functionName) {
  return functionsForTiming[functionName];
}

function timingFunctions(timingFunction) {
  return getTimingFunction(timingFunction);
}

const getBorderWidthValues = (pointingDirection, height, width) => {
  const fullWidth = `${width[0]}${width[1] || ''}`;
  const halfWidth = `${width[0] / 2}${width[1] || ''}`;
  const fullHeight = `${height[0]}${height[1] || ''}`;
  const halfHeight = `${height[0] / 2}${height[1] || ''}`;

  switch (pointingDirection) {
    case 'top':
      return `0 ${halfWidth} ${fullHeight} ${halfWidth}`;
    case 'topLeft':
      return `${fullWidth} ${fullHeight} 0 0`;
    case 'left':
      return `${halfHeight} ${fullWidth} ${halfHeight} 0`;
    case 'bottomLeft':
      return `${fullWidth} 0 0 ${fullHeight}`;
    case 'bottom':
      return `${fullHeight} ${halfWidth} 0 ${halfWidth}`;
    case 'bottomRight':
      return `0 0 ${fullWidth} ${fullHeight}`;
    case 'right':
      return `${halfHeight} 0 ${halfHeight} ${fullWidth}`;
    case 'topRight':
    default:
      return `0 ${fullWidth} ${fullHeight} 0`;
  }
};

const getBorderColorForTriangle = (pointingDirection, foregroundColor) => {
  switch (pointingDirection) {
    case 'top':
    case 'bottomRight':
      return { borderBottomColor: foregroundColor };
    case 'right':
    case 'bottomLeft':
      return { borderLeftColor: foregroundColor };
    case 'bottom':
    case 'topLeft':
      return { borderTopColor: foregroundColor };
    case 'left':
    case 'topRight':
      return { borderRightColor: foregroundColor };
    default:
      throw new PolishedError(59);
  }
};

function triangle({ pointingDirection, height, width, foregroundColor, backgroundColor = 'transparent' }) {
  const widthAndUnit = getValueAndUnit(width);
  const heightAndUnit = getValueAndUnit(height);

  if (isNaN(heightAndUnit[0]) || isNaN(widthAndUnit[0])) {
    throw new PolishedError(60);
  }

  return {
    width: '0',
    height: '0',
    borderColor: backgroundColor,
    ...getBorderColorForTriangle(pointingDirection, foregroundColor),
    borderStyle: 'solid',
    borderWidth: getBorderWidthValues(pointingDirection, heightAndUnit, widthAndUnit)
  };
}

function wordWrap(wrap = 'break-word') {
  const wordBreak = wrap === 'break-word' ? 'break-all' : wrap;
  return {
    overflowWrap: wrap,
    wordWrap: wrap,
    wordBreak: wordBreak
  };
}

function colorToInt(color) {
  return Math.round(color * 255);
}

function convertToInt(red, green, blue) {
  return `${colorToInt(red)},${colorToInt(green)},${colorToInt(blue)}`;
}

function hslToRgb(hue, saturation, lightness, convert = convertToInt) {
  if (saturation === 0) {
    return convert(lightness, lightness, lightness);
  }

  const huePrime = (hue % 360 + 360) % 360 / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = secondComponent;
  }

  const lightnessModification = lightness - chroma / 2;
  const finalRed = red + lightnessModification;
  const finalGreen = green + lightnessModification;
  const finalBlue = blue + lightnessModification;
  return convert(finalRed, finalGreen, finalBlue);
}

const namedColorMap = {
  aliceblue: 'f0f8ff',
  antiquewhite: 'faebd7',
  aqua: '00ffff',
  aquamarine: '7fffd4',
  azure: 'f0ffff',
  beige: 'f5f5dc',
  bisque: 'ffe4c4',
  black: '000',
  blanchedalmond: 'ffebcd',
  blue: '0000ff',
  blueviolet: '8a2be2',
  brown: 'a52a2a',
  burlywood: 'deb887',
  cadetblue: '5f9ea0',
  chartreuse: '7fff00',
  chocolate: 'd2691e',
  coral: 'ff7f50',
  cornflowerblue: '6495ed',
  cornsilk: 'fff8dc',
  crimson: 'dc143c',
  cyan: '00ffff',
  darkblue: '00008b',
  darkcyan: '008b8b',
  darkgoldenrod: 'b8860b',
  darkgray: 'a9a9a9',
  darkgreen: '006400',
  darkgrey: 'a9a9a9',
  darkkhaki: 'bdb76b',
  darkmagenta: '8b008b',
  darkolivegreen: '556b2f',
  darkorange: 'ff8c00',
  darkorchid: '9932cc',
  darkred: '8b0000',
  darksalmon: 'e9967a',
  darkseagreen: '8fbc8f',
  darkslateblue: '483d8b',
  darkslategray: '2f4f4f',
  darkslategrey: '2f4f4f',
  darkturquoise: '00ced1',
  darkviolet: '9400d3',
  deeppink: 'ff1493',
  deepskyblue: '00bfff',
  dimgray: '696969',
  dimgrey: '696969',
  dodgerblue: '1e90ff',
  firebrick: 'b22222',
  floralwhite: 'fffaf0',
  forestgreen: '228b22',
  fuchsia: 'ff00ff',
  gainsboro: 'dcdcdc',
  ghostwhite: 'f8f8ff',
  gold: 'ffd700',
  goldenrod: 'daa520',
  gray: '808080',
  green: '008000',
  greenyellow: 'adff2f',
  grey: '808080',
  honeydew: 'f0fff0',
  hotpink: 'ff69b4',
  indianred: 'cd5c5c',
  indigo: '4b0082',
  ivory: 'fffff0',
  khaki: 'f0e68c',
  lavender: 'e6e6fa',
  lavenderblush: 'fff0f5',
  lawngreen: '7cfc00',
  lemonchiffon: 'fffacd',
  lightblue: 'add8e6',
  lightcoral: 'f08080',
  lightcyan: 'e0ffff',
  lightgoldenrodyellow: 'fafad2',
  lightgray: 'd3d3d3',
  lightgreen: '90ee90',
  lightgrey: 'd3d3d3',
  lightpink: 'ffb6c1',
  lightsalmon: 'ffa07a',
  lightseagreen: '20b2aa',
  lightskyblue: '87cefa',
  lightslategray: '789',
  lightslategrey: '789',
  lightsteelblue: 'b0c4de',
  lightyellow: 'ffffe0',
  lime: '0f0',
  limegreen: '32cd32',
  linen: 'faf0e6',
  magenta: 'f0f',
  maroon: '800000',
  mediumaquamarine: '66cdaa',
  mediumblue: '0000cd',
  mediumorchid: 'ba55d3',
  mediumpurple: '9370db',
  mediumseagreen: '3cb371',
  mediumslateblue: '7b68ee',
  mediumspringgreen: '00fa9a',
  mediumturquoise: '48d1cc',
  mediumvioletred: 'c71585',
  midnightblue: '191970',
  mintcream: 'f5fffa',
  mistyrose: 'ffe4e1',
  moccasin: 'ffe4b5',
  navajowhite: 'ffdead',
  navy: '000080',
  oldlace: 'fdf5e6',
  olive: '808000',
  olivedrab: '6b8e23',
  orange: 'ffa500',
  orangered: 'ff4500',
  orchid: 'da70d6',
  palegoldenrod: 'eee8aa',
  palegreen: '98fb98',
  paleturquoise: 'afeeee',
  palevioletred: 'db7093',
  papayawhip: 'ffefd5',
  peachpuff: 'ffdab9',
  peru: 'cd853f',
  pink: 'ffc0cb',
  plum: 'dda0dd',
  powderblue: 'b0e0e6',
  purple: '800080',
  rebeccapurple: '639',
  red: 'f00',
  rosybrown: 'bc8f8f',
  royalblue: '4169e1',
  saddlebrown: '8b4513',
  salmon: 'fa8072',
  sandybrown: 'f4a460',
  seagreen: '2e8b57',
  seashell: 'fff5ee',
  sienna: 'a0522d',
  silver: 'c0c0c0',
  skyblue: '87ceeb',
  slateblue: '6a5acd',
  slategray: '708090',
  slategrey: '708090',
  snow: 'fffafa',
  springgreen: '00ff7f',
  steelblue: '4682b4',
  tan: 'd2b48c',
  teal: '008080',
  thistle: 'd8bfd8',
  tomato: 'ff6347',
  turquoise: '40e0d0',
  violet: 'ee82ee',
  wheat: 'f5deb3',
  white: 'fff',
  whitesmoke: 'f5f5f5',
  yellow: 'ff0',
  yellowgreen: '9acd32'
};

function nameToHex(color) {
  if (typeof color !== 'string') return color;
  const normalizedColorName = color.toLowerCase();
  return namedColorMap[normalizedColorName] ? `#${namedColorMap[normalizedColorName]}` : color;
}

const hexRegex = /^#[a-fA-F0-9]{6}$/;
const hexRgbaRegex = /^#[a-fA-F0-9]{8}$/;
const reducedHexRegex = /^#[a-fA-F0-9]{3}$/;
const reducedRgbaHexRegex = /^#[a-fA-F0-9]{4}$/;
const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([-+]?[0-9]*[.]?[0-9]+)\s*\)$/i;
const hslRegex = /^hsl\(\s*(\d{0,3}[.]?[0-9]+)\s*,\s*(\d{1,3}[.]?[0-9]?)%\s*,\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i;
const hslaRegex = /^hsla\(\s*(\d{0,3}[.]?[0-9]+)\s*,\s*(\d{1,3}[.]?[0-9]?)%\s*,\s*(\d{1,3}[.]?[0-9]?)%\s*,\s*([-+]?[0-9]*[.]?[0-9]+)\s*\)$/i;

function parseToRgb(color) {
  if (typeof color !== 'string') {
    throw new PolishedError(3);
  }

  const normalizedColor = nameToHex(color);

  if (hexRegex.test(normalizedColor)) {
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[2]}`, 16),
      green: parseInt(`${normalizedColor[3]}${normalizedColor[4]}`, 16),
      blue: parseInt(`${normalizedColor[5]}${normalizedColor[6]}`, 16)
    };
  }

  if (hexRgbaRegex.test(normalizedColor)) {
    const alpha = parseFloat((parseInt(`${normalizedColor[7]}${normalizedColor[8]}`, 16) / 255).toFixed(2));
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[2]}`, 16),
      green: parseInt(`${normalizedColor[3]}${normalizedColor[4]}`, 16),
      blue: parseInt(`${normalizedColor[5]}${normalizedColor[6]}`, 16),
      alpha: alpha
    };
  }

  if (reducedHexRegex.test(normalizedColor)) {
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[1]}`, 16),
      green: parseInt(`${normalizedColor[2]}${normalizedColor[2]}`, 16),
      blue: parseInt(`${normalizedColor[3]}${normalizedColor[3]}`, 16)
    };
  }

  if (reducedRgbaHexRegex.test(normalizedColor)) {
    const alpha = parseFloat((parseInt(`${normalizedColor[4]}${normalizedColor[4]}`, 16) / 255).toFixed(2));
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[1]}`, 16),
      green: parseInt(`${normalizedColor[2]}${normalizedColor[2]}`, 16),
      blue: parseInt(`${normalizedColor[3]}${normalizedColor[3]}`, 16),
      alpha: alpha
    };
  }

  const rgbMatched = rgbRegex.exec(normalizedColor);

  if (rgbMatched) {
    return {
      red: parseInt(rgbMatched[1], 10),
      green: parseInt(rgbMatched[2], 10),
      blue: parseInt(rgbMatched[3], 10)
    };
  }

  const rgbaMatched = rgbaRegex.exec(normalizedColor);

  if (rgbaMatched) {
    return {
      red: parseInt(rgbaMatched[1], 10),
      green: parseInt(rgbaMatched[2], 10),
      blue: parseInt(rgbaMatched[3], 10),
      alpha: parseFloat(rgbaMatched[4])
    };
  }

  const hslMatched = hslRegex.exec(normalizedColor);

  if (hslMatched) {
    const hue = parseInt(hslMatched[1], 10);
    const saturation = parseInt(hslMatched[2], 10) / 100;
    const lightness = parseInt(hslMatched[3], 10) / 100;
    const rgbColorString = `rgb(${hslToRgb(hue, saturation, lightness)})`;
    const hslRgbMatched = rgbRegex.exec(rgbColorString);

    if (!hslRgbMatched) {
      throw new PolishedError(4, normalizedColor, rgbColorString);
    }

    return {
      red: parseInt(hslRgbMatched[1], 10),
      green: parseInt(hslRgbMatched[2], 10),
      blue: parseInt(hslRgbMatched[3], 10)
    };
  }

  const hslaMatched = hslaRegex.exec(normalizedColor);

  if (hslaMatched) {
    const hue = parseInt(hslaMatched[1], 10);
    const saturation = parseInt(hslaMatched[2], 10) / 100;
    const lightness = parseInt(hslaMatched[3], 10) / 100;
    const rgbColorString = `rgb(${hslToRgb(hue, saturation, lightness)})`;
    const hslRgbMatched = rgbRegex.exec(rgbColorString);

    if (!hslRgbMatched) {
      throw new PolishedError(4, normalizedColor, rgbColorString);
    }

    return {
      red: parseInt(hslRgbMatched[1], 10),
      green: parseInt(hslRgbMatched[2], 10),
      blue: parseInt(hslRgbMatched[3], 10),
      alpha: parseFloat(hslaMatched[4])
    };
  }

  throw new PolishedError(5);
}

function rgbToHsl(color) {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    if (color.alpha !== undefined) {
      return { hue: 0, saturation: 0, lightness: lightness, alpha: color.alpha };
    }
    return { hue: 0, saturation: 0, lightness: lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  hue *= 60;

  if (color.alpha !== undefined) {
    return { hue: hue, saturation: saturation, lightness: lightness, alpha: color.alpha };
  }

  return { hue: hue, saturation: saturation, lightness: lightness };
}

function parseToHsl(color) {
  return rgbToHsl(parseToRgb(color));
}

function reduceHexValue(value) {
  if (value.length === 7 && value[1] === value[2] && value[3] === value[4] && value[5] === value[6]) {
    return `#${value[1]}${value[3]}${value[5]}`;
  }
  return value;
}

function numberToHex(value) {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function colorToHex(color) {
  return numberToHex(Math.round(color * 255));
}

function convertToHex(red, green, blue) {
  return reduceHexValue(`#${colorToHex(red)}${colorToHex(green)}${colorToHex(blue)}`);
}

function hslToHex(hue, saturation, lightness) {
  return hslToRgb(hue, saturation, lightness, convertToHex);
}

function hsl(value, saturation, lightness) {
  if (typeof value === 'number' && typeof saturation === 'number' && typeof lightness === 'number') {
    return hslToHex(value, saturation, lightness);
  }
  if (typeof value === 'object' && saturation === undefined && lightness === undefined) {
    return hslToHex(value.hue, value.saturation, value.lightness);
  }

  throw new PolishedError(1);
}

function hsla(value, saturation, lightness, alpha) {
  if (typeof value === 'number' && typeof saturation === 'number' && typeof lightness === 'number' && typeof alpha === 'number') {
    return alpha >= 1 ? hslToHex(value, saturation, lightness) : `rgba(${hslToRgb(value, saturation, lightness)},${alpha})`;
  }
  if (typeof value === 'object' && saturation === undefined && lightness === undefined && alpha === undefined) {
    return value.alpha >= 1 ? hslToHex(value.hue, value.saturation, value.lightness) : `rgba(${hslToRgb(value.hue, value.saturation, value.lightness)},${value.alpha})`;
  }

  throw new PolishedError(2);
}

function rgb(value, green, blue) {
  if (typeof value === 'number' && typeof green === 'number' && typeof blue === 'number') {
    return reduceHexValue(`#${numberToHex(value)}${numberToHex(green)}${numberToHex(blue)}`);
  }
  if (typeof value === 'object' && green === undefined && blue === undefined) {
    return reduceHexValue(`#${numberToHex(value.red)}${numberToHex(value.green)}${numberToHex(value.blue)}`);
  }

  throw new PolishedError(6);
}

function rgba(firstValue, secondValue, thirdValue, fourthValue) {
  if (typeof firstValue === 'string' && typeof secondValue === 'number') {
    const rgbValue = parseToRgb(firstValue);
    return `rgba(${rgbValue.red},${rgbValue.green},${rgbValue.blue},${secondValue})`;
  }
  if (typeof firstValue === 'number' && typeof secondValue === 'number' && typeof thirdValue === 'number' && typeof fourthValue === 'number') {
    return fourthValue >= 1 ? rgb(firstValue, secondValue, thirdValue) : `rgba(${firstValue},${secondValue},${thirdValue},${fourthValue})`;
  }
  if (typeof firstValue === 'object' && secondValue === undefined && thirdValue === undefined && fourthValue === undefined) {
    return firstValue.alpha >= 1 ? rgb(firstValue.red, firstValue.green, firstValue.blue) : `rgba(${firstValue.red},${firstValue.green},${firstValue.blue},${firstValue.alpha})`;
  }

  throw new PolishedError(7);
}

const isRgb = color => typeof color.red === 'number' && typeof color.green === 'number' && typeof color.blue === 'number' && (typeof color.alpha !== 'number' || typeof color.alpha === 'undefined');
const isRgba = color => typeof color.red === 'number' && typeof color.green === 'number' && typeof color.blue === 'number' && typeof color.alpha === 'number';
const isHsl = color => typeof color.hue === 'number' && typeof color.saturation === 'number' && typeof color.lightness === 'number' && (typeof color.alpha !== 'number' || typeof color.alpha === 'undefined');
const isHsla = color => typeof color.hue === 'number' && typeof color.saturation === 'number' && typeof color.lightness === 'number' && typeof color.alpha === 'number';

function toColorString(color) {
  if (typeof color !== 'object') throw new PolishedError(8);
  if (isRgba(color)) return rgba(color);
  if (isRgb(color)) return rgb(color);
  if (isHsla(color)) return hsla(color);
  if (isHsl(color)) return hsl(color);
  throw new PolishedError(8);
}

function curried(f, length, acc) {
  return function fn() {
    const combined = acc.concat(Array.prototype.slice.call(arguments));
    return combined.length >= length ? f.apply(this, combined) : curried(f, length, combined);
  };
}

function curry(f) {
  return curried(f, f.length, []);
}

function adjustHue(degree, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString({ ...hslColor, hue: hslColor.hue + parseFloat(degree) });
}

const curriedAdjustHue = /*#__PURE__*/curry(adjustHue);

function complement(color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString({ ...hslColor, hue: (hslColor.hue + 180) % 360 });
}

function guard(lowerBoundary, upperBoundary, value) {
  return Math.max(lowerBoundary, Math.min(upperBoundary, value));
}

function darken(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString({ ...hslColor, lightness: guard(0, 1, hslColor.lightness - parseFloat(amount)) });
}

const curriedDarken = /*#__PURE__*/curry(darken);

function desaturate(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString({ ...hslColor, saturation: guard(0, 1, hslColor.saturation - parseFloat(amount)) });
}

const curriedDesaturate = /*#__PURE__*/curry(desaturate);

function getLuminance(color) {
  if (color === 'transparent') return 0;
  const { red, green, blue } = parseToRgb(color);
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  
  const L = [r, g, b].map((channel) => {
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return parseFloat((0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2]).toFixed(3));
}

function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  return parseFloat(
    (luminance1 > luminance2 ? (luminance1 + 0.05) / (luminance2 + 0.05) : (luminance2 + 0.05) / (luminance1 + 0.05)).toFixed(2)
  );
}

function grayscale(color) {
  if (color === 'transparent') return color;
  return toColorString({ ...parseToHsl(color), saturation: 0 });
}

function hslToColorString(color) {
  if (typeof color === 'object' && typeof color.hue === 'number' && typeof color.saturation === 'number' && typeof color.lightness === 'number') {
    if (color.alpha && typeof color.alpha === 'number') {
      return hsla({
        hue: color.hue,
        saturation: color.saturation,
        lightness: color.lightness,
        alpha: color.alpha
      });
    }

    return hsl({
      hue: color.hue,
      saturation: color.saturation,
      lightness: color.lightness
    });
  }

  throw new PolishedError(45);
}

function invert(color) {
  if (color === 'transparent') return color;
  const value = parseToRgb(color);
  return toColorString({
    red: 255 - value.red,
    green: 255 - value.green,
    blue: 255 - value.blue,
    ...value
  });
}

function lighten(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString({ ...hslColor, lightness: guard(0, 1, hslColor.lightness + parseFloat(amount)) });
}

const curriedLighten = /*#__PURE__*/curry(lighten);

function meetsContrastGuidelines(color1, color2) {
  const contrastRatio = getContrast(color1, color2);
  return {
    AA: contrastRatio >= 4.5,
    AALarge: contrastRatio >= 3,
    AAA: contrastRatio >= 7,
    AAALarge: contrastRatio >= 4.5
  };
}

function mix(weight, color, otherColor) {
  if (color === 'transparent') return otherColor;
  if (otherColor === 'transparent') return color;

  const parsedColor1 = parseToRgb(color);
  const color1 = { ...parsedColor1, alpha: typeof parsedColor1.alpha === 'number' ? parsedColor1.alpha : 1 };

  const parsedColor2 = parseToRgb(otherColor);
  const color2 = { ...parsedColor2, alpha: typeof parsedColor2.alpha === 'number'