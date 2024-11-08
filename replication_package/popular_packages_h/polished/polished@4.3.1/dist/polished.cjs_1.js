'use strict';

const { default: _extends } = require('@babel/runtime/helpers/extends');
const { default: _assertThisInitialized } = require('@babel/runtime/helpers/assertThisInitialized');
const { default: _inheritsLoose } = require('@babel/runtime/helpers/inheritsLoose');
const { default: _wrapNativeSuper } = require('@babel/runtime/helpers/wrapNativeSuper');
const { default: _taggedTemplateLiteralLoose } = require('@babel/runtime/helpers/taggedTemplateLiteralLoose');

// Mathematical functions for CSS calculations
function last() {
  return arguments.length ? arguments[arguments.length - 1] : undefined;
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

function max() {
  return Math.max(...arguments);
}

function min() {
  return Math.min(...arguments);
}

function comma() {
  return Array.from(arguments);
}

const defaultSymbols = {
  symbols: {
    '*': { infix: { symbol: '*', f: multiplication, notation: 'infix', precedence: 4, rightToLeft: 0, argCount: 2 }, symbol: '*', regSymbol: '\\*' },
    '/': { infix: { symbol: '/', f: division, notation: 'infix', precedence: 4, rightToLeft: 0, argCount: 2 }, symbol: '/', regSymbol: '/' },
    '+': { infix: { symbol: '+', f: addition, notation: 'infix', precedence: 2, rightToLeft: 0, argCount: 2 }, prefix: { symbol: '+', f: last, notation: 'prefix', precedence: 3, rightToLeft: 0, argCount: 1 }, symbol: '+', regSymbol: '\\+' },
    '-': { infix: { symbol: '-', f: subtraction, notation: 'infix', precedence: 2, rightToLeft: 0, argCount: 2 }, prefix: { symbol: '-', f: negation, notation: 'prefix', precedence: 3, rightToLeft: 0, argCount: 1 }, symbol: '-', regSymbol: '-' },
    ',': { infix: { symbol: ',', f: comma, notation: 'infix', precedence: 1, rightToLeft: 0, argCount: 2 }, symbol: ',', regSymbol: ',' },
    '(': { prefix: { symbol: '(', f: last, notation: 'prefix', precedence: 0, rightToLeft: 0, argCount: 1 }, symbol: '(', regSymbol: '\\(' },
    ')': { postfix: { symbol: ')', f: undefined, notation: 'postfix', precedence: 0, rightToLeft: 0, argCount: 1 }, symbol: ')', regSymbol: '\\)' },
    min: { func: { symbol: 'min', f: min, notation: 'func', precedence: 0, rightToLeft: 0, argCount: 1 }, symbol: 'min', regSymbol: 'min\\b' },
    max: { func: { symbol: 'max', f: max, notation: 'func', precedence: 0, rightToLeft: 0, argCount: 1 }, symbol: 'max', regSymbol: 'max\\b' }
  }
};

const defaultSymbolMap = defaultSymbols;

// Error Definitions
const ERRORS = {
  "1": "Passed invalid arguments to hsl, please pass multiple numbers or an object.",
  "2": "Passed invalid arguments to hsla, please pass multiple numbers or an object.",
  "3": "Passed an incorrect argument to a color function, please pass a string representation of a color.",
  "4": "Couldn't generate valid rgb string from %s, it returned %s.",
  "5": "Couldn't parse the color string.",
  "6": "Passed invalid arguments to rgb, please pass multiple numbers or an object.",
  "7": "Passed invalid arguments to rgba, please pass multiple numbers or an object.",
  "8": "Passed invalid argument to toColorString, please pass a color object.",
  // more error messages...
};

// Error handling class
function format() {
  let args = Array.prototype.slice.call(arguments);
  let str = args[0];
  args.slice(1).forEach(subs => {
    str = str.replace(/%[a-z]/, subs);
  });
  return str;
}

class PolishedError extends (_wrapNativeSuper(Error)) {
  constructor(code, ...args) {
    super(process.env.NODE_ENV === 'production' ? 
        `Error see documentation:` : 
        format(ERRORS[code], ...args));
    return _assertThisInitialized(this);
  }
}

// CSS Unit Handling
const unitRegExp = /((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g;

function mergeSymbolMaps(additionalSymbols) {
  return {
    symbols: additionalSymbols ? _extends({}, defaultSymbolMap.symbols, additionalSymbols.symbols) : _extends({}, defaultSymbolMap.symbols)
  };
}

function exec(operators, values) {
  let op = operators.pop();
  values.push(op.f(...values.splice(-op.argCount)));
  return op.precedence;
}

function calculate(expression, additionalSymbols) {
  const symbolMap = mergeSymbolMaps(additionalSymbols);
  const operators = [symbolMap.symbols['('].prefix];
  const values = [];
  let pattern = new RegExp("\\d+(?:\\.\\d+)?|" + 
    Object.keys(symbolMap.symbols)
      .map(key => symbolMap.symbols[key])
      .sort((a, b) => b.symbol.length - a.symbol.length)
      .map(val => val.regSymbol)
      .join('|') + 
    "|(\\S)", 'g');

  pattern.lastIndex = 0; 
  let match, afterValue = false;

  do {
    match = pattern.exec(expression);
    let [token, bad] = match || [')', undefined];
    const notNumber = symbolMap.symbols[token];
    const notNewValue = notNumber && !notNumber.prefix && !notNumber.func;
    const notAfterValue = !notNumber || (!notNumber.postfix && !notNumber.infix);

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
  return `${calculate(cleanFormula, additionalSymbols)}` + (formulaMatch ? reverseString(formulaMatch[0]) : '');
}

const cssVariableRegex = /--[\S]*/g;

function cssVar(cssVariable, defaultValue) {
  if (!cssVariable || !cssVariable.match(cssVariableRegex)) {
    throw new PolishedError(73);
  }
  let variableValue;

  if (typeof document !== 'undefined' && document.documentElement !==null) {
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
  var firstValue = values[0],
    secondValue = values[1] || firstValue,
    thirdValue = values[2] || firstValue,
    fourthValue = values[3] || secondValue;
  const valuesWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];
  return generateStyles(property, valuesWithDefaults);
}

function endsWith(string, suffix) {
  return string.substr(-suffix.length) === suffix;
}

const cssRegex1 = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

function stripUnit(value) {
  if (typeof value !== 'string') return value;
  const matchedValue = value.match(cssRegex1);
  return matchedValue ? parseFloat(value) : value;
}

function pxtoFactory(to) {
  return function (pxval, base = '16px') {
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
    return `${newPxval / newBase}${to}`;
  };
}

const pixelsto = pxtoFactory;

const em = pixelsto('em');

const cssRegex2 = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

function getValueAndUnit(value) {
  if (typeof value !== 'string') return [value, ''];
  const matchedValue = value.match(cssRegex2);
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
    } else if (!rules || (rules && (rules === key || rules.indexOf(key) >= 0))) {
      newStyleBlock[key] = styleBlock[key] + " !important";
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

const rem = pixelsto('rem');

const defaultFontSize = 16;

function convertBase(base) {
  const deconstructedValue = getValueAndUnit(base);
  if (deconstructedValue[1] === 'px') {
    return parseFloat(base);
  }
  if (deconstructedValue[1] === '%') {
    return parseFloat(base) / 100 * defaultFontSize;
  }
  throw new PolishedError(78, deconstructedValue[1]);
}

function getBaseFromDoc() {
  if (typeof document !== 'undefined' && document.documentElement !== null) {
    const rootFontSize = getComputedStyle(document.documentElement).fontSize;
    return rootFontSize ? convertBase(rootFontSize) : defaultFontSize;
  }
  return defaultFontSize;
}

function remToPx(value, base) {
  const deconstructedValue = getValueAndUnit(value);

  if (deconstructedValue[1] !== 'rem' && deconstructedValue[1] !== '') {
    throw new PolishedError(77, deconstructedValue[1]);
  }

  const newBase = base ? convertBase(base) : getBaseFromDoc();
  return `${deconstructedValue[0] * newBase}px`;
}

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

function easeIn(functionName) {
  return functionsMap[functionName.toLowerCase().trim()];
}

const functionsMap2 = {
  back: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  circ: 'cubic-bezier(0.785,  0.135, 0.150, 0.860)',
  cubic: 'cubic-bezier(0.645,  0.045, 0.355, 1.000)',
  expo: 'cubic-bezier(1.000,  0.000, 0.000, 1.000)',
  quad: 'cubic-bezier(0.455,  0.030, 0.515, 0.955)',
  quart: 'cubic-bezier(0.770,  0.000, 0.175, 1.000)',
  quint: 'cubic-bezier(0.860,  0.000, 0.070, 1.000)',
  sine: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)'
};

function easeInOut(functionName) {
  return functionsMap2[functionName.toLowerCase().trim()];
}

const functionsMap3 = {
  back: 'cubic-bezier(0.175,  0.885, 0.320, 1.275)',
  cubic: 'cubic-bezier(0.215,  0.610, 0.355, 1.000)',
  circ: 'cubic-bezier(0.075,  0.820, 0.165, 1.000)',
  expo: 'cubic-bezier(0.190,  1.000, 0.220, 1.000)',
  quad: 'cubic-bezier(0.250,  0.460, 0.450, 0.940)',
  quart: 'cubic-bezier(0.165,  0.840, 0.440, 1.000)',
  quint: 'cubic-bezier(0.230,  1.000, 0.320, 1.000)',
  sine: 'cubic-bezier(0.390,  0.575, 0.565, 1.000)'
};

function easeOut(functionName) {
  return functionsMap3[functionName.toLowerCase().trim()];
}

function between(fromSize, toSize, minScreen = '320px', maxScreen = '1200px') {
  const unitlessFromSize = parseFloat(fromSize.match(cssRegex2)[1]);
  const fromSizeUnit = fromSize.match(cssRegex2)[2];
  const unitlessToSize = parseFloat(toSize.match(cssRegex2)[1]);
  const toSizeUnit = toSize.match(cssRegex2)[2];
  
  const unitlessMinScreen = parseFloat(minScreen.match(cssRegex2)[1]);
  const minScreenUnit = minScreen.match(cssRegex2)[2];
  const unitlessMaxScreen = parseFloat(maxScreen.match(cssRegex2)[1]);
  const maxScreenUnit = maxScreen.match(cssRegex2)[2];

  if (minScreenUnit !== maxScreenUnit || fromSizeUnit !== toSizeUnit) {
    throw new PolishedError(47);
  }
  const slope = (unitlessFromSize - unitlessToSize) / (unitlessMinScreen - unitlessMaxScreen);
  const base = unitlessToSize - slope * unitlessMaxScreen;
  return `calc(${base.toFixed(2)}${fromSizeUnit || ''} + ${(100 * slope).toFixed(2)}vw)`;
}

function clearFix(parent = '&') {
  const pseudoSelector = `${parent}::after`;
  return {
    [pseudoSelector]: {
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

function ellipsis(width, lines = 1) {
  const styles = {
    display: 'inline-block',
    maxWidth: width || '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal'
  };
  return lines > 1 ? _extends({}, styles, {
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    display: '-webkit-box',
    whiteSpace: 'normal'
  }) : styles;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  let it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);

  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    let i = 0;
    return function () {
      if (i >= o.length) return { done: true };
      return { done: false, value: o[i++] };
    };
  }

  throw new TypeError("Invalid attempt to iterate non-iterable instance. In order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  let n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (let i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}

function fluidRange(cssProp, minScreen = '320px', maxScreen = '1200px') {
  if (!Array.isArray(cssProp) && typeof cssProp !== 'object' || cssProp === null) {
    throw new PolishedError(49);
  }

  if (Array.isArray(cssProp)) {
    const mediaQueries = {};
    const fallbacks = {};
    for (let _iterator = _createForOfIteratorHelperLoose(cssProp), _step; !(_step = _iterator()).done;) {
      let obj = _step.value;
      if (!obj.prop || !obj.fromSize || !obj.toSize) {
        throw new PolishedError(50);
      }
      fallbacks[obj.prop] = obj.fromSize;
      mediaQueries[`@media (min-width: ${minScreen})`] = _extends({}, mediaQueries[`@media (min-width: ${minScreen})`], { [obj.prop]: between(obj.fromSize, obj.toSize, minScreen, maxScreen) });
      mediaQueries[`@media (min-width: ${maxScreen})`] = _extends({}, mediaQueries[`@media (min-width: ${maxScreen})`], { [obj.prop]: obj.toSize });
    }
    return _extends({}, fallbacks, mediaQueries);
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
  return !!fontFilePath.replace(/\s+/g, ' ').match(dataURIRegex);
}

function generateFileReferences(fontFilePath, fileFormats, formatHint) {
  if (isDataURI(fontFilePath)) {
    return `url("${fontFilePath}")${generateFormatHint(fileFormats[0], formatHint)}`;
  }
  const fileFontReferences = fileFormats.map(format => `url("${fontFilePath}.${format}")${generateFormatHint(format, formatHint)}`);
  return fileFontReferences.join(', ');
}

function generateLocalReferences(localFonts) {
  const localFontReferences = localFonts.map(font => `local("${font}")`);
  return localFontReferences.join(', ');
}

function generateSources(fontFilePath, localFonts, fileFormats, formatHint) {
  const fontReferences = [];
  if (localFonts) fontReferences.push(generateLocalReferences(localFonts));
  if (fontFilePath) {
    fontReferences.push(generateFileReferences(fontFilePath, fileFormats, formatHint));
  }
  return fontReferences.join(', ');
}

function fontFace({ fontFamily, fontFilePath, fontStretch, fontStyle, fontVariant, fontWeight, fileFormats = ['eot', 'woff2', 'woff', 'ttf', 'svg'], formatHint = false, localFonts = [fontFamily], unicodeRange, fontDisplay, fontVariationSettings, fontFeatureSettings }) {
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

  const fontFaceDeclaration = {
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

  return JSON.parse(JSON.stringify(fontFaceDeclaration));
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
      const definedValues = substitutions.filter(substitute => !!substitute);
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
    backgroundColor: fallback || colorStops[0].replace(/,\s+/g, ',').split(' ')[0].replace(/,(?=\S)/g, ', '),
    backgroundImage: constructGradientValue(["linear-gradient(", "", ")"], toDirection, colorStops.join(', ').replace(/,(?=\S)/g, ', '))
  };
}

function normalize() {
  return [{
    html: {
      lineHeight: '1.15',
      textSizeAdjust: '100%'
    },
    body: { margin: '0' },
    main: { display: 'block' },
    h1: { fontSize: '2em', margin: '0.67em 0' },
    hr: { boxSizing: 'content-box', height: '0', overflow: 'visible' },
    pre: { fontFamily: 'monospace, monospace', fontSize: '1em' },
    a: { backgroundColor: 'transparent' },
    'abbr[title]': { borderBottom: 'none', textDecoration: 'underline' },
    "b,\n    strong": { fontWeight: 'bolder' },
    "code,\n    kbd,\n    samp": { fontFamily: 'monospace, monospace', fontSize: '1em' },
    small: { fontSize: '80%' },
    "sub,\n    sup": { fontSize: '75%', lineHeight: '0', position: 'relative', verticalAlign: 'baseline' },
    sub: { bottom: '-0.25em' },
    sup: { top: '-0.5em' },
    img: { borderStyle: 'none' },
    "button,\n    input,\n    optgroup,\n    select,\n    textarea": { fontFamily: 'inherit', fontSize: '100%', lineHeight: '1.15', margin: '0' },
    "button,\n    input": { overflow: 'visible' },
    "button,\n    select": { textTransform: 'none' },
    "button,\n    html [type=\"button\"],\n    [type=\"reset\"],\n    [type=\"submit\"]": { WebkitAppearance: 'button' },
    "button::-moz-focus-inner,\n    [type=\"button\"]::-moz-focus-inner,\n    [type=\"reset\"]::-moz-focus-inner,\n    [type=\"submit\"]::-moz-focus-inner": { borderStyle: 'none', padding: '0' },
    "button:-moz-focusring,\n    [type=\"button\"]:-moz-focusring,\n    [type=\"reset\"]:-moz-focusring,\n    [type=\"submit\"]:-moz-focusring": { outline: '1px dotted ButtonText' },
    fieldset: { padding: '0.35em 0.625em 0.75em' },
    legend: { boxSizing: 'border-box', color: 'inherit', display: 'table', maxWidth: '100%', padding: '0', whiteSpace: 'normal' },
    progress: { verticalAlign: 'baseline' },
    textarea: { overflow: 'auto' },
    "[type=\"checkbox\"],\n    [type=\"radio\"]": { boxSizing: 'border-box', padding: '0' },
    "[type=\"number\"]::-webkit-inner-spin-button,\n    [type=\"number\"]::-webkit-outer-spin-button": { height: 'auto' },
    '[type="search"]': { WebkitAppearance: 'textfield', outlineOffset: '-2px' },
    '[type="search"]::-webkit-search-decoration': { WebkitAppearance: 'none' },
    '::-webkit-file-upload-button': { WebkitAppearance: 'button', font: 'inherit' },
    details: { display: 'block' },
    summary: { display: 'list-item' },
    template: { display: 'none' },
    '[hidden]': { display: 'none' }
  }];
}

function radialGradient({ colorStops, extent = '', fallback, position = '', shape = '' }) {
  if (!colorStops || colorStops.length < 2) {
    throw new PolishedError(57);
  }
  return {
    backgroundColor: fallback || colorStops[0].split(' ')[0],
    backgroundImage: constructGradientValue(["radial-gradient(", "", "", "", ")"], position, shape, extent, colorStops.join(', '))
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
    [hiDPI()]: _extends({
      backgroundImage: `url(${rFilename})`
    }, backgroundSize ? { backgroundSize } : {})
  };
}

/* eslint-disable key-spacing */
const functionsMap4 = {
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
/* eslint-enable key-spacing */

function getTimingFunction(functionName) {
  return functionsMap4[functionName];
}

function timingFunctions(timingFunction) {
  return getTimingFunction(timingFunction);
}

function getBorderWidth(pointingDirection, height, width) {
  const fullWidth = `${width[0]}${width[1] || ''}`;
  const halfWidth = `${width[0] / 2}${width[1] || ''}`;
  const fullHeight = `${height[0]}${height[1] || ''}`;
  const halfHeight = `${height[0] / 2}${height[1] || ''}`;
  
  switch (pointingDirection) {
    case 'top': return `0 ${halfWidth} ${fullHeight} ${halfWidth}`;
    case 'topLeft': return `${fullWidth} ${fullHeight} 0 0`;
    case 'left': return `${halfHeight} ${fullWidth} ${halfHeight} 0`;
    case 'bottomLeft': return `${fullWidth} 0 0 ${fullHeight}`;
    case 'bottom': return `${fullHeight} ${halfWidth} 0 ${halfWidth}`;
    case 'bottomRight': return `0 0 ${fullWidth} ${fullHeight}`;
    case 'right': return `${halfHeight} 0 ${halfHeight} ${fullWidth}`;
    case 'topRight': 
    default: return `0 ${fullWidth} ${fullHeight} 0`;
  }
}

function getBorderColor(pointingDirection, foregroundColor) {
  switch (pointingDirection) {
    case 'top': 
    case 'bottomRight': return { borderBottomColor: foregroundColor };
    case 'right': 
    case 'bottomLeft': return { borderLeftColor: foregroundColor };
    case 'bottom': 
    case 'topLeft': return { borderTopColor: foregroundColor };
    case 'left': 
    case 'topRight': return { borderRightColor: foregroundColor };
    default: throw new PolishedError(59);
  }
}

function triangle({ pointingDirection, height, width, foregroundColor, backgroundColor = 'transparent'}) {
  const widthAndUnit = getValueAndUnit(width);
  const heightAndUnit = getValueAndUnit(height);

  if (isNaN(heightAndUnit[0]) || isNaN(widthAndUnit[0])) {
    throw new PolishedError(60);
  }
  
  return {
    width: '0',
    height: '0',
    borderColor: backgroundColor,
    ...getBorderColor(pointingDirection, foregroundColor),
    borderStyle: 'solid',
    borderWidth: getBorderWidth(pointingDirection, heightAndUnit, widthAndUnit)
  };
}

function wordWrap(wrap = 'break-word') {
  return {
    overflowWrap: wrap,
    wordWrap: wrap,
    wordBreak: wrap === 'break-word' ? 'break-all' : wrap
  };
}

function colorToInt(color) {
  return Math.round(color * 255);
}

function convertToInt(red, green, blue) {
  return `${colorToInt(red)},${colorToInt(green)},${colorToInt(blue)}`;
}

function hslToRgb(hue, saturation, lightness, convert = convertToInt) {
  if (saturation === 0) return convert(lightness, lightness, lightness);
  const huePrime = (hue % 360 + 360) % 360 / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
  let red = 0, green = 0, blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma; green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent; green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma; blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent; blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent; blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma; blue = secondComponent;
  }

  const lightnessModification = lightness - chroma / 2;
  const finalRed = red + lightnessModification;
  const finalGreen = green + lightnessModification;
  const finalBlue = blue + lightnessModification;
  
  return convert(finalRed, finalGreen, finalBlue);
}

const namedColorMap = {
  aliceblue: 'f0f8ff', antiquewhite: 'faebd7', aqua: '00ffff', aquamarine: '7fffd4',
  azure: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '000',
  blanchedalmond: 'ffebcd', blue: '0000ff', blueviolet: '8a2be2', brown: 'a52a2a',
  burlywood: 'deb887', cadetblue: '5f9ea0', chartreuse: '7fff00', chocolate: 'd2691e',
  coral: 'ff7f50', cornflowerblue: '6495ed', cornsilk: 'fff8dc', crimson: 'dc143c',
  cyan: '00ffff', darkblue: '00008b', darkcyan: '008b8b', darkgoldenrod: 'b8860b',
  darkgray: 'a9a9a9', darkgreen: '006400', darkgrey: 'a9a9a9', darkkhaki: 'bdb76b',
  darkmagenta: '8b008b', darkolivegreen: '556b2f', darkorange: 'ff8c00', darkorchid: '9932cc',
  darkred: '8b0000', darksalmon: 'e9967a', darkseagreen: '8fbc8f', darkslateblue: '483d8b',
  darkslategray: '2f4f4f', darkslategrey: '2f4f4f', darkturquoise: '00ced1', darkviolet: '9400d3',
  deeppink: 'ff1493', deepskyblue: '00bfff', dimgray: '696969', dimgrey: '696969',
  dodgerblue: '1e90ff', firebrick: 'b22222', floralwhite: 'fffaf0', forestgreen: '228b22',
  fuchsia: 'ff00ff', gainsboro: 'dcdcdc', ghostwhite: 'f8f8ff', gold: 'ffd700',
  goldenrod: 'daa520', gray: '808080', green: '008000', greenyellow: 'adff2f',
  grey: '808080', honeydew: 'f0fff0', hotpink: 'ff69b4', indianred: 'cd5c5c',
  indigo: '4b0082', ivory: 'fffff0', khaki: 'f0e68c', lavender: 'e6e6fa',
  lavenderblush: 'fff0f5', lawngreen: '7cfc00', lemonchiffon: 'fffacd', lightblue: 'add8e6',
  lightcoral: 'f08080', lightcyan: 'e0ffff', lightgoldenrodyellow: 'fafad2', lightgray: 'd3d3d3',
  lightgreen: '90ee90', lightgrey: 'd3d3d3', lightpink: 'ffb6c1', lightsalmon: 'ffa07a',
  lightseagreen: '20b2aa', lightskyblue: '87cefa', lightslategray: '789', lightslategrey: '789',
  lightsteelblue: 'b0c4de', lightyellow: 'ffffe0', lime: '0f0', limegreen: '32cd32',
  linen: 'faf0e6', magenta: 'f0f', maroon: '800000', mediumaquamarine: '66cdaa',
  mediumblue: '0000cd', mediumorchid: 'ba55d3', mediumpurple: '9370db', mediumseagreen: '3cb371',
  mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a', mediumturquoise: '48d1cc', mediumvioletred: 'c71585',
  midnightblue: '191970', mintcream: 'f5fffa', mistyrose: 'ffe4e1', moccasin: 'ffe4b5',
  navajowhite: 'ffdead', navy: '000080', oldlace: 'fdf5e6', olive: '808000',
  olivedrab: '6b8e23', orange: 'ffa500', orangered: 'ff4500', orchid: 'da70d6',
  palegoldenrod: 'eee8aa', palegreen: '98fb98', paleturquoise: 'afeeee', palevioletred: 'db7093',
  papayawhip: 'ffefd5', peachpuff: 'ffdab9', peru: 'cd853f', pink: 'ffc0cb',
  plum: 'dda0dd', powderblue: 'b0e0e6', purple: '800080', rebeccapurple: '639',
  red: 'f00', rosybrown: 'bc8f8f', royalblue: '4169e1', saddlebrown: '8b4513',
  salmon: 'fa8072', sandybrown: 'f4a460', seagreen: '2e8b57', seashell: 'fff5ee',
  sienna: 'a0522d', silver: 'c0c0c0', skyblue: '87ceeb', slateblue: '6a5acd',
  slategray: '708090', slategrey: '708090', snow: 'fffafa', springgreen: '00ff7f',
  steelblue: '4682b4', tan: 'd2b48c', teal: '008080', thistle: 'd8bfd8',
  tomato: 'ff6347', turquoise: '40e0d0', violet: 'ee82ee', wheat: 'f5deb3',
  white: 'fff', whitesmoke: 'f5f5f5', yellow: 'ff0', yellowgreen: '9acd32'
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
const rgbRegex = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i;
const rgbaRegex = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
const hslRegex = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i;
const hslaRegex = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;

function parseToRgb(color) {
  if (typeof color !== 'string') {
    throw new PolishedError(3);
  }

  const normalizedColor = nameToHex(color);

  if (normalizedColor.match(hexRegex)) {
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[2]}`, 16),
      green: parseInt(`${normalizedColor[3]}${normalizedColor[4]}`, 16),
      blue: parseInt(`${normalizedColor[5]}${normalizedColor[6]}`, 16)
    };
  }

  if (normalizedColor.match(hexRgbaRegex)) {
    const alpha = parseFloat((parseInt(`${normalizedColor[7]}${normalizedColor[8]}`, 16) / 255).toFixed(2));
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[2]}`, 16),
      green: parseInt(`${normalizedColor[3]}${normalizedColor[4]}`, 16),
      blue: parseInt(`${normalizedColor[5]}${normalizedColor[6]}`, 16),
      alpha
    };
  }

  if (normalizedColor.match(reducedHexRegex)) {
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[1]}`, 16),
      green: parseInt(`${normalizedColor[2]}${normalizedColor[2]}`, 16),
      blue: parseInt(`${normalizedColor[3]}${normalizedColor[3]}`, 16)
    };
  }

  if (normalizedColor.match(reducedRgbaHexRegex)) {
    const alpha = parseFloat((parseInt(`${normalizedColor[4]}${normalizedColor[4]}`, 16) / 255).toFixed(2));
    return {
      red: parseInt(`${normalizedColor[1]}${normalizedColor[1]}`, 16),
      green: parseInt(`${normalizedColor[2]}${normalizedColor[2]}`, 16),
      blue: parseInt(`${normalizedColor[3]}${normalizedColor[3]}`, 16),
      alpha
    };
  }

  const rgbMatched = rgbRegex.exec(normalizedColor);
  if (rgbMatched) {
    return {
      red: parseInt(`${rgbMatched[1]}`, 10),
      green: parseInt(`${rgbMatched[2]}`, 10),
      blue: parseInt(`${rgbMatched[3]}`, 10)
    };
  }

  const rgbaMatched = rgbaRegex.exec(normalizedColor.substring(0, 50));
  if (rgbaMatched) {
    return {
      red: parseInt(`${rgbaMatched[1]}`, 10),
      green: parseInt(`${rgbaMatched[2]}`, 10),
      blue: parseInt(`${rgbaMatched[3]}`, 10),
      alpha: parseFloat(`${rgbaMatched[4]}`) > 1 ? parseFloat(`${rgbaMatched[4]}`) / 100 : parseFloat(`${rgbaMatched[4]}`)
    };
  }

  const hslMatched = hslRegex.exec(normalizedColor);
  if (hslMatched) {
    const hue = parseInt(`${hslMatched[1]}`, 10);
    const saturation = parseInt(`${hslMatched[2]}`, 10) / 100;
    const lightness = parseInt(`${hslMatched[3]}`, 10) / 100;
    const rgbColorString = `rgb(${hslToRgb(hue, saturation, lightness)})`;
    return {
      red: parseInt(rgbColorString[4], 10),
      green: parseInt(rgbColorString[6], 10),
      blue: parseInt(rgbColorString[8], 10)
    };
  }

  const hslaMatched = hslaRegex.exec(normalizedColor.substring(0, 50));
  if (hslaMatched) {
    const hue = parseInt(`${hslaMatched[1]}`, 10);
    const saturation = parseInt(`${hslaMatched[2]}`, 10) / 100;
    const lightness = parseInt(`${hslaMatched[3]}`, 10) / 100;
    const rgbColorString = `rgb(${hslToRgb(hue, saturation, lightness)})`;
    return {
      red: parseInt(rgbColorString[4], 10),
      green: parseInt(rgbColorString[6], 10),
      blue: parseInt(rgbColorString[8], 10),
      alpha: parseFloat(hslaMatched[4]) > 1 ? parseFloat(hslaMatched[4]) / 100 : parseFloat(hslaMatched[4])
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
    return color.alpha !== undefined ? 
      { hue: 0, saturation: 0, lightness, alpha: color.alpha } :
      { hue: 0, saturation: 0, lightness };
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
  }
  
  hue *= 60;
  
  return color.alpha !== undefined ? 
    { hue, saturation, lightness, alpha: color.alpha } :
    { hue, saturation, lightness };
}

function parseToHsl(color) {
  return rgbToHsl(parseToRgb(color));
}

function reduceHexValue(value) {
  return value.length === 7 && value[1] === value[2] && value[3] === value[4] && value[5] === value[6] ? 
    `#${value[1]}${value[3]}${value[5]}` : 
    value;
}
const reduceHexValue$1 = reduceHexValue;

function numberToHex(value) {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function colorToHex(color) {
  return numberToHex(Math.round(color * 255));
}

function convertToHex(red, green, blue) {
  return reduceHexValue$1(`#${colorToHex(red)}${colorToHex(green)}${colorToHex(blue)}`);
}

function hslToHex(hue, saturation, lightness) {
  return hslToRgb(hue, saturation, lightness, convertToHex);
}

function hsl(value, saturation, lightness) {
  if (typeof value === 'number' && typeof saturation === 'number' && typeof lightness === 'number') {
    return hslToHex(value, saturation, lightness);
  } else if (typeof value === 'object' && saturation === undefined && lightness === undefined) {
    return hslToHex(value.hue, value.saturation, value.lightness);
  }
  throw new PolishedError(1);
}

function hsla(value, saturation, lightness, alpha) {
  if (typeof value === 'number' && typeof saturation === 'number' && typeof lightness === 'number' && typeof alpha === 'number') {
    return alpha >= 1 ? hslToHex(value, saturation, lightness) : `rgba(${hslToRgb(value, saturation, lightness)},${alpha})`;
  } else if (typeof value === 'object' && saturation === undefined && lightness === undefined && alpha === undefined) {
    return value.alpha >= 1 ? hslToHex(value.hue, value.saturation, value.lightness) : `rgba(${hslToRgb(value.hue, value.saturation, value.lightness)},${value.alpha})`;
  }
  throw new PolishedError(2);
}

function rgb(value, green, blue) {
  if (typeof value === 'number' && typeof green === 'number' && typeof blue === 'number') {
    return reduceHexValue$1(`#${numberToHex(value)}${numberToHex(green)}${numberToHex(blue)}`);
  } else if (typeof value === 'object' && green === undefined && blue === undefined) {
    return reduceHexValue$1(`#${numberToHex(value.red)}${numberToHex(value.green)}${numberToHex(value.blue)}`);
  }
  throw new PolishedError(6);
}

function rgba(firstValue, secondValue, thirdValue, fourthValue) {
  if (typeof firstValue === 'string' && typeof secondValue === 'number') {
    const rgbValue = parseToRgb(firstValue);
    return `rgba(${rgbValue.red},${rgbValue.green},${rgbValue.blue},${secondValue})`;
  } else if (typeof firstValue === 'number' && typeof secondValue === 'number' && typeof thirdValue === 'number' && typeof fourthValue === 'number') {
    return fourthValue >= 1 ? rgb(firstValue, secondValue, thirdValue) : `rgba(${firstValue},${secondValue},${thirdValue},${fourthValue})`;
  } else if (typeof firstValue === 'object' && secondValue === undefined && thirdValue === undefined && fourthValue === undefined) {
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
  return toColorString(_extends({}, hslColor, { hue: hslColor.hue + parseFloat(degree) }));
}

const curriedAdjustHue = curry(adjustHue);

function complement(color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString(_extends({}, hslColor, { hue: (hslColor.hue + 180) % 360 }));
}

function guard(lowerBoundary, upperBoundary, value) {
  return Math.max(lowerBoundary, Math.min(upperBoundary, value));
}

function darken(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString(_extends({}, hslColor, { lightness: guard(0, 1, hslColor.lightness - parseFloat(amount)) }));
}

const curriedDarken = curry(darken);

function desaturate(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString(_extends({}, hslColor, { saturation: guard(0, 1, hslColor.saturation - parseFloat(amount)) }));
}

const curriedDesaturate = curry(desaturate);

function getLuminance(color) {
  if (color === 'transparent') return 0;
  const rgbColor = parseToRgb(color);
  const [r, g, b] = Object.keys(rgbColor).map(key => {
    const channel = rgbColor[key] / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return parseFloat((0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(3));
}

function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  return parseFloat((luminance1 > luminance2 ? (luminance1 + 0.05) / (luminance2 + 0.05) : (luminance2 + 0.05) / (luminance1 + 0.05)).toFixed(2));
}

function grayscale(color) {
  if (color === 'transparent') return color;
  return toColorString(_extends({}, parseToHsl(color), { saturation: 0 }));
}

function hslToColorString(color) {
  if (typeof color === 'object' &&
    typeof color.hue === 'number' &&
    typeof color.saturation === 'number' &&
    typeof color.lightness === 'number') {

    if (color.alpha && typeof color.alpha === 'number') {
      return hsla({ hue: color.hue, saturation: color.saturation, lightness: color.lightness, alpha: color.alpha });
    }
    return hsl({ hue: color.hue, saturation: color.saturation, lightness: color.lightness });
  }
  throw new PolishedError(45);
}

function invert(color) {
  if (color === 'transparent') return color;
  const value = parseToRgb(color);
  return toColorString(_extends({}, value, {
    red: 255 - value.red,
    green: 255 - value.green,
    blue: 255 - value.blue
  }));
}

function lighten(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString(_extends({}, hslColor, { lightness: guard(0, 1, hslColor.lightness + parseFloat(amount)) }));
}

const curriedLighten = curry(lighten);

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
  if (weight === 0) return otherColor;

  const parsedColor1 = parseToRgb(color);
  const color1 = _extends({}, parsedColor1, {
    alpha: typeof parsedColor1.alpha === 'number' ? parsedColor1.alpha : 1
  });

  const parsedColor2 = parseToRgb(otherColor);
  const color2 = _extends({}, parsedColor2, {
    alpha: typeof parsedColor2.alpha === 'number' ? parsedColor2.alpha : 1
  });

  const alphaDelta = color1.alpha - color2.alpha;
  const x = parseFloat(weight) * 2 - 1;
  const y = x * alphaDelta === -1 ? x : x + alphaDelta;
  const z = 1 + x * alphaDelta;
  const weight1 = (y / z + 1) / 2.0;
  const weight2 = 1 - weight1;

  const mixedColor = {
    red: Math.floor(color1.red * weight1 + color2.red * weight2),
    green: Math.floor(color1.green * weight1 + color2.green * weight2),
    blue: Math.floor(color1.blue * weight1 + color2.blue * weight2),
    alpha: color1.alpha * parseFloat(weight) + color2.alpha * (1 - parseFloat(weight))
  };

  return rgba(mixedColor);
}

const curriedMix = curry(mix);

function opacify(amount, color) {
  if (color === 'transparent') return color;

  const parsedColor = parseToRgb(color);
  const alpha = typeof parsedColor.alpha === 'number' ? parsedColor.alpha : 1;
  const colorWithAlpha = _extends({}, parsedColor, { alpha: guard(0, 1, (alpha * 100 + parseFloat(amount) * 100) / 100) });

  return rgba(colorWithAlpha);
}

const curriedOpacify = curry(opacify);

const defaultReturnIfLightColor = '#000';
const defaultReturnIfDarkColor = '#fff';

function readableColor(color, returnIfLightColor = defaultReturnIfLightColor, returnIfDarkColor = defaultReturnIfDarkColor, strict = true) {
  const isColorLight = getLuminance(color) > 0.179;
  const preferredReturnColor = isColorLight ? returnIfLightColor : returnIfDarkColor;

  if (!strict || getContrast(color, preferredReturnColor) >= 4.5) {
    return preferredReturnColor;
  }
  return isColorLight ? defaultReturnIfLightColor : defaultReturnIfDarkColor;
}

function rgbToColorString(color) {
  if (typeof color === 'object' &&
    typeof color.red === 'number' &&
    typeof color.green === 'number' &&
    typeof color.blue === 'number') {

    if (typeof color.alpha === 'number') {
      return rgba({ red: color.red, green: color.green, blue: color.blue, alpha: color.alpha });
    }
    return rgb({ red: color.red, green: color.green, blue: color.blue });
  }
  throw new PolishedError(46);
}

function saturate(amount, color) {
  if (color === 'transparent') return color;
  const hslColor = parseToHsl(color);
  return toColorString(_extends({}, hslColor, { saturation: guard(0, 1, hslColor.saturation + parseFloat(amount)) }));
}

const curriedSaturate = curry(saturate);

function setHue(hue, color) {
  if (color === 'transparent') return color;
  return toColorString(_extends({}, parseToHsl(color), { hue: parseFloat(hue) }));
}

const curriedSetHue = curry(setHue);

function setLightness(lightness, color) {
  if (color === 'transparent') return color;
  return toColorString(_extends({}, parseToHsl(color), { lightness: parseFloat(lightness) }));
}

const curriedSetLightness = curry(setLightness);

function setSaturation(saturation, color) {
  if (color === 'transparent') return color;
  return toColorString(_extends({}, parseToHsl(color), { saturation: parseFloat(saturation) }));
}

const curriedSetSaturation = curry(setSaturation);

function shade(percentage, color) {
  if (color === 'transparent') return color;
  return mix(parseFloat(percentage), 'rgb(0, 0, 0)', color);
}

const curriedShade = curry(shade);

function tint(percentage, color) {
  if (color === 'transparent') return color;
  return mix(parseFloat(percentage), 'rgb(255, 255, 255)', color);
}

const curriedTint = curry(tint);

function transparentize(amount, color) {
  if (color === 'transparent') return color;

  const parsedColor = parseToRgb(color);
  const alpha = typeof parsedColor.alpha === 'number' ? parsedColor.alpha : 1;
  const colorWithAlpha = _extends({}, parsedColor, { alpha: guard(0, 1, +(alpha * 100 - parseFloat(amount) * 100).toFixed(2) / 100) });

  return rgba(colorWithAlpha);
}

const curriedTransparentize = curry(transparentize);

function animation() {
  const args = [...arguments];
  const multiMode = Array.isArray(args[0]);

  if (!multiMode && args.length > 8) {
    throw new PolishedError(64);
  }

  const code = args.map(arg => {
    if (multiMode && !Array.isArray(arg) || !multiMode && Array.isArray(arg)) {
      throw new PolishedError(65);
    }
    if (Array.isArray(arg) && arg.length > 8) {
      throw new PolishedError(66);
    }
    return Array.isArray(arg) ? arg.join(' ') : arg;
  }).join(', ');

  return { animation: code };
}

function backgroundImages() {
  const properties = [...arguments];
  return { backgroundImage: properties.join(',