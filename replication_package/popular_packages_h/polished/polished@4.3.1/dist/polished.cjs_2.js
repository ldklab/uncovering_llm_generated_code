'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extend = require('@babel/runtime/helpers/extends');
var assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var inheritsLoose = require('@babel/runtime/helpers/inheritsLoose');
var wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
var taggedTemplateLiteralLoose = require('@babel/runtime/helpers/taggedTemplateLiteralLoose');

function importDefault(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var extend__default = /*#__PURE__*/importDefault(extend);
var assertThisInitialized__default = /*#__PURE__*/importDefault(assertThisInitialized);
var inheritsLoose__default = /*#__PURE__*/importDefault(inheritsLoose);
var wrapNativeSuper__default = /*#__PURE__*/importDefault(wrapNativeSuper);
var taggedTemplateLiteralLoose__default = /*#__PURE__*/importDefault(taggedTemplateLiteralLoose);

function getLastArgument() {
  var argumentsLength = arguments.length - 1;
  return argumentsLength < 0 || arguments.length <= argumentsLength ? undefined : arguments[argumentsLength];
}

function negateValue(a) {
  return -a;
}

function addValues(a, b) {
  return a + b;
}

function subtractValues(a, b) {
  return a - b;
}

function multiplyValues(a, b) {
  return a * b;
}

function divideValues(a, b) {
  return a / b;
}

function computeMax() {
  return Math.max.apply(Math, arguments);
}

function computeMin() {
  return Math.min.apply(Math, arguments);
}

function arrayFromArgs() {
  return Array.of.apply(Array, arguments);
}

const defaultFunctions = {
  symbols: {
    '*': {
      infix: {
        symbol: '*',
        func: multiplyValues,
        notation: 'infix',
        precedence: 4,
        isRightToLeft: false,
        argCount: 2
      },
      symbol: '*',
      regSymbol: '\\*'
    },
    '/': {
      infix: {
        symbol: '/',
        func: divideValues,
        notation: 'infix',
        precedence: 4,
        isRightToLeft: false,
        argCount: 2
      },
      symbol: '/',
      regSymbol: '/'
    },
    '+': {
      infix: {
        symbol: '+',
        func: addValues,
        notation: 'infix',
        precedence: 2,
        isRightToLeft: false,
        argCount: 2
      },
      prefix: {
        symbol: '+',
        func: getLastArgument,
        notation: 'prefix',
        precedence: 3,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: '+',
      regSymbol: '\\+'
    },
    '-': {
      infix: {
        symbol: '-',
        func: subtractValues,
        notation: 'infix',
        precedence: 2,
        isRightToLeft: false,
        argCount: 2
      },
      prefix: {
        symbol: '-',
        func: negateValue,
        notation: 'prefix',
        precedence: 3,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: '-',
      regSymbol: '-'
    },
    ',': {
      infix: {
        symbol: ',',
        func: arrayFromArgs,
        notation: 'infix',
        precedence: 1,
        isRightToLeft: false,
        argCount: 2
      },
      symbol: ',',
      regSymbol: ','
    },
    '(': {
      prefix: {
        symbol: '(',
        func: getLastArgument,
        notation: 'prefix',
        precedence: 0,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: '(',
      regSymbol: '\\('
    },
    ')': {
      postfix: {
        symbol: ')',
        func: undefined,
        notation: 'postfix',
        precedence: 0,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: ')',
      regSymbol: '\\)'
    },
    min: {
      func: {
        symbol: 'min',
        func: computeMin,
        notation: 'func',
        precedence: 0,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: 'min',
      regSymbol: 'min\\b'
    },
    max: {
      func: {
        symbol: 'max',
        func: computeMax,
        notation: 'func',
        precedence: 0,
        isRightToLeft: false,
        argCount: 1
      },
      symbol: 'max',
      regSymbol: 'max\\b'
    }
  }
};

const mergedFunctions = defaultFunctions;

// Extracted from styled-components styling
/**
 * Parses error messages and associates them with error codes
 * @private
 */
const ERRORS = {
  "1": "Invalid arguments to hsl: use numbers e.g. hsl(360, 0.75, 0.4) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75 }).\n\n",
  "2": "Invalid arguments to hsla: use numbers e.g. hsla(360, 0.75, 0.4, 0.7) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75, alpha: 0.7 }).\n\n",
  // Error structures continue...
};

/**
 * Simple sprintf equivalent
 * @private
 */
function formatString() {
  for (var argumentsCount = arguments.length, args = new Array(argumentsCount), index = 0; index < argumentsCount; index++) {
    args[index] = arguments[index];
  }
  var message = args[0];
  var replacements = [];
  for (var counter = 1; counter < args.length; counter += 1) {
    replacements.push(args[counter]);
  }
  replacements.forEach(function (replacement) {
    message = message.replace(/%[a-z]/, replacement);
  });
  return message;
}

/**
 * Generates an error file for development environments or a URL link for production environments
 * @private
 */
var PolishedError = /*#__PURE__*/function (_Error) {
  inheritsLoose__default["default"](PolishedError, _Error);
  function PolishedError(code) {
    var _this;
    if (process.env.NODE_ENV === 'production') {
      _this = _Error.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + code + " for more details.") || this;
    } else {
      for (var argsCount = arguments.length, argumentsList = new Array(argsCount > 1 ? argsCount - 1 : 0), argIndex = 1; argIndex < argsCount; argIndex++) {
        argumentsList[argIndex - 1] = arguments[argIndex];
      }
      _this = _Error.call(this, formatString.apply(void 0, [ERRORS[code]].concat(argumentsList))) || this;
    }
    return assertThisInitialized__default["default"](_this);
  }
  return PolishedError;
}( /*#__PURE__*/wrapNativeSuper__default["default"](Error));

var unwantedUnitRegex = /((?!\w)a|na|hc|mc|dg|me[r]?|xe|ni(?![a-zA-Z])|mm|cp|tp|xp|q(?!s)|hv|xamv|nimv|wv|sm|s(?!\D|$)|ged|darg?|nrut)/g;

// Integrates additional operations on top of default ones.
function integrateSymbolMaps(extraSymbols) {
  const symbolMapExtension = {};
  symbolMapExtension.symbols = extraSymbols ? extend__default["default"]({}, mergedFunctions.symbols, extraSymbols.symbols) : extend__default["default"]({}, mergedFunctions.symbols);
  return symbolMapExtension;
}

function execute(operators, operands) {
  let operation = operators.pop();
  operands.push(operation.func.apply(operation, [].concat.apply([], operands.splice(-operation.argCount))));
  return operation.precedence;
}

function evaluate(expression, extraSymbols) {
  let computedSymbols = integrateSymbolMaps(extraSymbols);
  let matching;
  let operatorStack = [computedSymbols.symbols['('].prefix];
  let operandStack = [];
  let regexPattern = new RegExp("\\d+(?:\\.\\d+)?|" + Object.keys(computedSymbols.symbols).map(function (key) {
    return computedSymbols.symbols[key];
  }).sort(function (a, b) {
    return b.symbol.length - a.symbol.length;
  }).map(function (symbolValue) {
    return symbolValue.regSymbol;
  }).join('|') + "|(\\S)", 'g');
  regexPattern.lastIndex = 0;

  let followingValue = false;
  do {
    matching = regexPattern.exec(expression);
    let regexExtract = matching || [')', undefined],
      currentToken = regexExtract[0],
      invalidToken = regexExtract[1];
    let invalidNumberOrSymbol = computedSymbols.symbols[currentToken];
    let invalidNewValue = invalidNumberOrSymbol && !invalidNumberOrSymbol.prefix && !invalidNumberOrSymbol.func;
    let invalidBeforeValue = !invalidNumberOrSymbol || !invalidNumberOrSymbol.postfix && !invalidNumberOrSymbol.infix;

    if (invalidToken || (followingValue ? invalidBeforeValue : invalidNewValue)) {
      throw new PolishedError(37, matching ? matching.index : expression.length, expression);
    }
    if (followingValue) {
      let currentOperation = invalidNumberOrSymbol.postfix || invalidNumberOrSymbol.infix;
      do {
        let previousOperation = operatorStack[operatorStack.length - 1];
        if ((currentOperation.precedence - previousOperation.precedence || previousOperation.isRightToLeft) > 0) break;
      } while (execute(operatorStack, operandStack));
      followingValue = currentOperation.notation === 'postfix';
      if (currentOperation.symbol !== ')') {
        operatorStack.push(currentOperation);
        if (followingValue) execute(operatorStack, operandStack);
      }
    } else if (invalidNumberOrSymbol) {
      operatorStack.push(invalidNumberOrSymbol.prefix || invalidNumberOrSymbol.func);
      if (invalidNumberOrSymbol.func) {
        matching = regexPattern.exec(expression);
        if (!matching || matching[0] !== '(') {
          throw new PolishedError(38, matching ? matching.index : expression.length, expression);
        }
      }
    } else {
      operandStack.push(+currentToken);
      followingValue = true;
    }
  } while (matching && operatorStack.length);

  if (operatorStack.length) {
    throw new PolishedError(39, matching ? matching.index : expression.length, expression);
  } else if (matching) {
    throw new PolishedError(40, matching ? matching.index : expression.length, expression);
  } else {
    return operandStack.pop();
  }
}
function reverseStr(str) {
  return str.split('').reverse().join('');
}

/**
 * Helper for performing arithmetic with CSS Units. Accepts a formula as a string. All values in the formula must have the same unit (or be unitless). Allows for complex formulas involving addition, subtraction, multiplication, division, and operations like min, max, and use of parentheses.
 *
 *In mixed unit scenarios, where one unit is a [relative length unit](https://developer.mozilla.org/en-US/docs/Web/CSS/length#Relative_length_units), consider [CSS Calc](https://developer.mozilla.org/en-US/docs/Web/CSS/calc).
 *
 *Note: Caution advised when passing user-defined values to the `math` utility.
 * @example
 * // Styles as object usage
 * const styles = {
 *   fontSize: math('12rem + 8rem'),
 *   fontSize: math('(12px + 2px) * 3'),
 *   fontSize: math('3px^2 + sqrt(4)'),
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   fontSize: ${math('12rem + 8rem')};
 *   fontSize: ${math('(12px + 2px) * 3')};
 *   fontSize: ${math('3px^2 + sqrt(4)')};
 * `
 *
 * // CSS as JS Output
 *
 * div: {
 *   fontSize: '20rem',
 *   fontSize: '42px',
 *   fontSize: '11px',
 * }
 */
function math(formula, extraSymbols) {
  let reversedFormula = reverseStr(formula);
  let formulaMatch = reversedFormula.match(unwantedUnitRegex);

  if (formulaMatch && !formulaMatch.every(function (unitValue) {
    return unitValue === formulaMatch[0];
  })) {
    throw new PolishedError(41);
  }
  let cleanFormula = reverseStr(reversedFormula.replace(unwantedUnitRegex, ''));
  return "" + evaluate(cleanFormula, extraSymbols) + (formulaMatch ? reverseStr(formulaMatch[0]) : '');
}

const cssVarMatch = /--[\S]*/g;

/**
 * Fetches specific CSS variable value from :root scope, returning a defaultValue if specified.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'background': cssVar('--background-color'),
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   background: ${cssVar('--background-color')};
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   'background': 'red'
 * }
 */
function cssVar(cssVariable, providedDefaultValue) {
  if (!cssVariable || !cssVariable.match(cssVarMatch)) {
    throw new PolishedError(73);
  }
  let variableValue;
  if (typeof document !== 'undefined' && document.documentElement !== null) {
    variableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
  }

  if (variableValue) {
    return variableValue.trim();
  } else if (providedDefaultValue) {
    return providedDefaultValue;
  }
  throw new PolishedError(74);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var positionMapping = ['Top', 'Right', 'Bottom', 'Left'];
function makeProperty(property, position) {
  if (!property) return position.toLowerCase();
  var splitProperty = property.split('-');
  if (splitProperty.length > 1) {
    splitProperty.splice(1, 0, position);
    return splitProperty.reduce(function (accumulator, value) {
      return "" + accumulator + capitalizeFirstLetter(value);
    });
  }
  var joinedProperty = property.replace(/([a-z])([A-Z])/g, "$1" + position + "$2");
  return property === joinedProperty ? "" + property + position : joinedProperty;
}

function createStyles(property, providedValues) {
  var styleObject = {};
  for (var idx = 0; idx < providedValues.length; idx += 1) {
    if (providedValues[idx] || providedValues[idx] === 0) {
      styleObject[makeProperty(property, positionMapping[idx])] = providedValues[idx];
    }
  }
  return styleObject;
}

/**
 * Enables shorthand properties for directional use with attributes. Accepts properties (hyphenated or camelCased) and up to four values mapping to top, right, bottom, and left, respectively. An empty string yields only the directional properties; a null value ignores the specific directional values.
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...directionalProperty('padding', '12px', '24px', '36px', '48px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${directionalProperty('padding', '12px', '24px', '36px', '48px')}
 * `
 *
 * // CSS as JS Output
 *
 * div {
 *   'paddingTop': '12px',
 *   'paddingRight': '24px',
 *   'paddingBottom': '36px',
 *   'paddingLeft': '48px'
 * }
 */
function directionalProperty(property) {
  for (var argumentsLength = arguments.length, argValues = new Array(argumentsLength > 1 ? argumentsLength - 1 : 0), idx = 1; idx < argumentsLength; idx++) {
    argValues[idx - 1] = arguments[idx];
  }
  var firstValue = argValues[0],
      _argValues$ = argValues[1],
      secondValue = _argValues$ === void 0 ? firstValue : _argValues$,
      _argValues$2 = argValues[2],
      thirdValue = _argValues$2 === void 0 ? firstValue : _argValues$2,
      _argValues$3 = argValues[3],
      fourthValue = _argValues$3 === void 0 ? secondValue : _argValues$3;
  var valueWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];
  return createStyles(property, valueWithDefaults);
}

/**
 * Checks if a string ends with a certain suffix
 * @private
 */
function ensureEndsWith(string, suffix) {
  return string.substr(-suffix.length) === suffix;
}

var cssParserRegex1 = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

/**
 * Returns a css value without its unit.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   '--dimension': stripUnit('100px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   --dimension: ${stripUnit('100px')};
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   '--dimension': 100
 * }
 */
function stripUnit(value) {
  if (typeof value !== 'string') return value;
  var matchedValue = value.match(cssParserRegex1);
  return matchedValue ? parseFloat(value) : value;
}

/**
 * Constructs a factory function as a pixel-to-x converter
 * @private
 */
var pixelConversionFactory = function pixelConversionFactory(unit) {
  return function (pixelValue, baseValue) {
    if (baseValue === void 0) {
      baseValue = '16px';
    }
    var pxVal = pixelValue;
    var baseVal = baseValue;
    if (typeof pixelValue === 'string') {
      if (!ensureEndsWith(pixelValue, 'px')) {
        throw new PolishedError(69, unit, pixelValue);
      }
      pxVal = stripUnit(pixelValue);
    }
    if (typeof baseValue === 'string') {
      if (!ensureEndsWith(baseValue, 'px')) {
        throw new PolishedError(70, unit, baseValue);
      }
      baseVal = stripUnit(baseValue);
    }
    if (typeof pxVal === 'string') {
      throw new PolishedError(71, pixelValue, unit);
    }
    if (typeof baseVal === 'string') {
      throw new PolishedError(72, baseValue, unit);
    }
    return "" + pxVal / baseVal + unit;
  };
};
var pxconv = pixelConversionFactory;

/**
 * Convert pixel value to ems. Defaults to a base value of 16px, but can be overridden by passing a
 * second argument to the function.
 * @function
 * @param {string|number} pixelValue
 * @param {string|number} [baseValue='16px']
 * @example
 * // Styles as object usage
 * const styles = {
 *   'height': em('16px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   height: ${em('16px')}
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   'height': '1em'
 * }
 */
var em = pxconv('em');
var emExtended = em;

var cssParserRegex = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

/**
 * Returns a given CSS value along with its unit in an array form.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   '--dimension': getValueAndUnit('100px')[0],
 *   '--unit': getValueAndUnit('100px')[1],
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   --dimension: ${getValueAndUnit('100px')[0]};
 *   --unit: ${getValueAndUnit('100px')[1]};
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   '--dimension': 100,
 *   '--unit': 'px',
 * }
 */
function getValueAndUnit(value) {
  if (typeof value !== 'string') return [value, ''];
  var matchedValue = value.match(cssParserRegex);
  if (matchedValue) return [parseFloat(value), matchedValue[2]];
  return [value, undefined];
}

/**
 * Helper for managing !important specificity in style blocks generated from polished modules. Specify the rule or rules to precisely target specific rules.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...important(cover())
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${important(cover())}
 * `
 *
 * // CSS as JS Output
 *
 * div: {
 *   'position': 'absolute !important',
 *   'top': '0 !important',
 *   'right: '0 !important',
 *   'bottom': '0 !important',
 *   'left: '0 !important'
 * }
 */
function important(styleBlock, selectedRules) {
  if (typeof styleBlock !== 'object' || styleBlock === null) {
    throw new PolishedError(75, typeof styleBlock);
  }
  var modifiedStyleBlock = {};
  Object.keys(styleBlock).forEach(function (key) {
    if (typeof styleBlock[key] === 'object' && styleBlock[key] !== null) {
      modifiedStyleBlock[key] = important(styleBlock[key], selectedRules);
    } else if (!selectedRules || selectedRules && (selectedRules === key || selectedRules.indexOf(key) >= 0)) {
      modifiedStyleBlock[key] = styleBlock[key] + " !important";
    } else {
      modifiedStyleBlock[key] = styleBlock[key];
    }
  });
  return modifiedStyleBlock;
}

var ratioMap = {
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
function retrieveRatio(ratioName) {
  return ratioMap[ratioName];
}

/**
 * Ensure project consistency with measurements and spatial relationships using incremented em or rem values through a defined scale. Contains predefined common scales.
 * @example
 * // Styles as object usage
 * const styles = {
 *    // Increment two steps up the preset scale
 *   'fontSize': modularScale(2)
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *    // Increment two steps up the preset scale
 *   fontSize: ${modularScale(2)}
 * `
 *
 * // CSS as JS Output
 *
 * element {
 *   'fontSize': '1.77689em'
 * }
 */
function modularScale(steps, base, ratio) {
  if (base === void 0) {
    base = '1em';
  }
  if (ratio === void 0) {
    ratio = 1.333;
  }
  if (typeof steps !== 'number') {
    throw new PolishedError(42);
  }
  if (typeof ratio === 'string' && !ratioMap[ratio]) {
    throw new PolishedError(43);
  }
  var unitBase = typeof base === 'string' ? getValueAndUnit(base) : [base, ''],
    validBase = unitBase[0],
    unit = unitBase[1];
  var realRatioValue = typeof ratio === 'string' ? retrieveRatio(ratio) : ratio;
  if (typeof validBase === 'string') {
    throw new PolishedError(44, base);
  }
  return "" + validBase * Math.pow(realRatioValue, steps) + (unit || '');
}

/**
 * Convert pixel values to rems. Defaults to a base value of 16px, but it can be overridden by supplying a second argument.
 * @function
 * @param {string|number} pixelValue
 * @param {string|number} [baseValue='16px']
 * @example
 * // Styles as object usage
 * const styles = {
 *   'height': rem('16px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   height: ${rem('16px')}
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   'height': '1rem'
 * }
 */
var rem = pxconv('rem');
var remExtended = rem;

const defaultFontPx = 16;
function mapBase(baseValue) {
  var decomposedValue = getValueAndUnit(baseValue);
  if (decomposedValue[1] === 'px') {
    return parseFloat(baseValue);
  }
  if (decomposedValue[1] === '%') {
    return parseFloat(baseValue) / 100 * defaultFontPx;
  }
  throw new PolishedError(78, decomposedValue[1]);
}
function retrieveDocBase() {
  if (typeof document !== 'undefined' && document.documentElement !== null) {
    var rootFontSize = getComputedStyle(document.documentElement).fontSize;
    return rootFontSize ? mapBase(rootFontSize) : defaultFontPx;
  }
  return defaultFontPx;
}

/**
 * Convert rem values back to px. Defaults to the font-size from the root element (if set in % or px). Otherwise, the default is 16px. You can override this default by providing a custom base value in % or px.
 * @example
 * // Styles as object usage
 * const styles = {
 *   'height': remToPx('1.6rem')
 *   'height': remToPx('1.6rem', '10px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   height: ${remToPx('1.6rem')}
 *   height: ${remToPx('1.6rem', '10px')}
 * `
 *
 * // CSS in JS Output
 *
 * element {
 *   'height': '25.6px',
 *   'height': '16px',
 * }
 */
function remToPx(value, baseValue) {
  var valueComponents = getValueAndUnit(value);
  if (valueComponents[1] !== 'rem' && valueComponents[1] !== '') {
    throw new PolishedError(77, valueComponents[1]);
  }
  const newBaseValue = baseValue ? mapBase(baseValue) : retrieveDocBase();
  return valueComponents[0] * newBaseValue + "px";
}

const easingFunctionsMap1 = {
  back: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
  circ: 'cubic-bezier(0.600,  0.040, 0.980, 0.335)',
  cubic: 'cubic-bezier(0.550,  0.055, 0.675, 0.190)',
  expo: 'cubic-bezier(0.950,  0.050, 0.795, 0.035)',
  quad: 'cubic-bezier(0.550,  0.085, 0.680, 0.530)',
  quart: 'cubic-bezier(0.895,  0.030, 0.685, 0.220)',
  quint: 'cubic-bezier(0.755,  0.050, 0.855, 0.060)',
  sine: 'cubic-bezier(0.470,  0.000, 0.745, 0.715)'
};

/**
 * Converts common easing functions into strings: (github.com/jaukia/easie).
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'transitionTimingFunction': easeIn('quad')
 * }
 *
 * // styled-components usage
 *  const div = styled.div`
 *   transitionTimingFunction: ${easeIn('quad')};
 * `
 *
 * // CSS as JS Output
 *
 * 'div': {
 *   'transitionTimingFunction': 'cubic-bezier(0.550,  0.085, 0.680, 0.530)',
 * }
 */
function easeIn(easingName) {
  return easingFunctionsMap1[easingName.toLowerCase().trim()];
}

const easingFunctionsMap2 = {
  back: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  circ: 'cubic-bezier(0.785,  0.135, 0.150, 0.860)',
  cubic: 'cubic-bezier(0.645,  0.045, 0.355, 1.000)',
  expo: 'cubic-bezier(1.000,  0.000, 0.000, 1.000)',
  quad: 'cubic-bezier(0.455,  0.030, 0.515, 0.955)',
  quart: 'cubic-bezier(0.770,  0.000, 0.175, 1.000)',
  quint: 'cubic-bezier(0.860,  0.000, 0.070, 1.000)',
  sine: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)'
};

/**
 * Converts common easing functions into strings: (github.com/jaukia/easie).
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'transitionTimingFunction': easeInOut('quad')
 * }
 *
 * // styled-components usage
 *  const div = styled.div`
 *   transitionTimingFunction: ${easeInOut('quad')};
 * `
 *
 * // CSS as JS Output
 *
 * 'div': {
 *   'transitionTimingFunction': 'cubic-bezier(0.455,  0.030, 0.515, 0.955)',
 * }
 */
function easeInOut(easingName) {
  return easingFunctionsMap2[easingName.toLowerCase().trim()];
}

const easingFunctionsMap3 = {
  back: 'cubic-bezier(0.175,  0.885, 0.320, 1.275)',
  cubic: 'cubic-bezier(0.215,  0.610, 0.355, 1.000)',
  circ: 'cubic-bezier(0.075,  0.820, 0.165, 1.000)',
  expo: 'cubic-bezier(0.190,  1.000, 0.220, 1.000)',
  quad: 'cubic-bezier(0.250,  0.460, 0.450, 0.940)',
  quart: 'cubic-bezier(0.165,  0.840, 0.440, 1.000)',
  quint: 'cubic-bezier(0.230,  1.000, 0.320, 1.000)',
  sine: 'cubic-bezier(0.390,  0.575, 0.565, 1.000)'
};

/**
 * Converts common easing functions into strings: (github.com/jaukia/easie).
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'transitionTimingFunction': easeOut('quad')
 * }
 *
 * // styled-components usage
 *  const div = styled.div`
 *   transitionTimingFunction: ${easeOut('quad')};
 * `
 *
 * // CSS as JS Output
 *
 * 'div': {
 *   'transitionTimingFunction': 'cubic-bezier(0.250,  0.460, 0.450, 0.940)',
 * }
 */
function easeOut(easingName) {
  return easingFunctionsMap3[easingName.toLowerCase().trim()];
}

/**
 * Produces a CSS calc formula for linearly interpolating a property between two provided sizes. Optionally accepts minScreen (default: '320px') and maxScreen (default: '1200px') constraints.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   fontSize: between('20px', '100px', '400px', '1000px'),
 *   fontSize: between('20px', '100px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   fontSize: ${between('20px', '100px', '400px', '1000px')};
 *   fontSize: ${between('20px', '100px')}
 * `
 *
 * // CSS as JS Output
 *
 * h1: {
 *   'fontSize': 'calc(-33.33333333333334px + 13.333333333333334vw)',
 *   'fontSize': 'calc(-9.090909090909093px + 9.090909090909092vw)'
 * }
 */
function between(fromSize, toSize, minScreen, maxScreen) {
  if (minScreen === void 0) {
    minScreen = '320px';
  }
  if (maxScreen === void 0) {
    maxScreen = '1200px';
  }
  const fromUnit = getValueAndUnit(fromSize),
    fromValue = fromUnit[0],
    fromSizeUnit = fromUnit[1];
  const toUnit = getValueAndUnit(toSize),
    toValue = toUnit[0],
    toSizeUnit = toUnit[1];
  const minScreenUnit = getValueAndUnit(minScreen),
    minScreenValue = minScreenUnit[0],
    minScreenUnitName = minScreenUnit[1];
  const maxScreenUnit = getValueAndUnit(maxScreen),
    maxScreenValue = maxScreenUnit[0],
    maxScreenUnitName = maxScreenUnit[1];
  if (typeof minScreenValue !== 'number' || typeof maxScreenValue !== 'number' || !minScreenUnitName || !maxScreenUnitName || minScreenUnitName !== maxScreenUnitName) {
    throw new PolishedError(47);
  }
  if (typeof fromValue !== 'number' || typeof toValue !== 'number' || fromSizeUnit !== toSizeUnit) {
    throw new PolishedError(48);
  }
  if (fromSizeUnit !== minScreenUnitName || toSizeUnit !== maxScreenUnitName) {
    throw new PolishedError(76);
  }
  const slope = (fromValue - toValue) / (minScreenValue - maxScreenValue);
  const origin = toValue - slope * maxScreenValue;
  return "calc(" + origin.toFixed(2) + (fromSizeUnit || '') + " + " + (100 * slope).toFixed(2) + "vw)";
}

/**
 * CSS for containment of a float (adapted from CSSMojo).
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *    ...clearFix(),
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${clearFix()}
 * `
 *
 * // CSS as JS Output
 *
 * '&::after': {
 *   'clear': 'both',
 *   'content': '""',
 *   'display': 'table'
 * }
 */
function clearFix(parentSelector) {
  if (parentSelector === void 0) {
    parentSelector = '&';
  }
  const psuedoSelector = parentSelector + "::after";
  return {
    [psuedoSelector]: {
      clear: 'both',
      content: '""',
      display: 'table'
    },
  };
}

/**
 * CSS to present a full-cover area. Accepts an optional offset parameter acting as "padding".
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...cover()
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${cover()}
 * `
 *
 * // CSS as JS Output
 *
 * div: {
 *   'position': 'absolute',
 *   'top': '0',
 *   'right: '0',
 *   'bottom': '0',
 *   'left: '0'
 * }
 */
function cover(offset) {
  if (offset === void 0) {
    offset = 0;
  }
  return {
    position: 'absolute',
    top: offset,
    right: offset,
    bottom: offset,
    left: offset
  };
}

/**
 * CSS to trim text with ellipsis; supporting options like max-width and lines before truncating.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...ellipsis('250px')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${ellipsis('250px')}
 * `
 *
 * // CSS as JS Output
 *
 * div: {
 *   'display': 'inline-block',
 *   'maxWidth': '250px',
 *   'overflow': 'hidden',
 *   'textOverflow': 'ellipsis',
 *   'whiteSpace': 'nowrap',
 *   'wordWrap': 'normal'
 * }
 */
function ellipsis(maxWidth, totalLines) {
  if (totalLines === void 0) {
    totalLines = 1;
  }
  const basicStyles = {
    display: 'inline-block',
    maxWidth: maxWidth || '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal'
  };
  return totalLines > 1 ? extend__default["default"]({}, basicStyles, {
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: totalLines,
    display: '-webkit-box',
    whiteSpace: 'normal'
  }) : basicStyles;
}

function forEach(arrayLikeForm, callback) { 
  for (var index = 0, arrayForm = arrayLikeForm || []; index < arrayForm.length; index += 1) {
    callback(arrayForm[index], index);
  }
}
/**
 * Generates media queries for resizing property based on fromSize and toSize. Optionally pass minScreen (defaults to '320px') and maxScreen (defaults to '1200px') to define interpolation limits.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...fluidRange(
 *    {
 *        prop: 'padding',
 *        fromSize: '20px',
 *        toSize: '100px',
 *      },
 *      '400px',
 *      '1000px',
 *    )
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${fluidRange(
 *      {
 *        prop: 'padding',
 *        fromSize: '20px',
 *        toSize: '100px',
 *      },
 *      '400px',
 *      '1000px',
 *    )}
 * `
 *
 * // CSS as JS Output
 *
 * div: {
 *   "@media (min-width: 1000px)": Object {
 *     "padding": "100px",
 *   },
 *   "@media (min-width: 400px)": Object {
 *     "padding": "calc(-33.33333333333334px + 13.333333333333334vw)",
 *   },
 *   "padding": "20px",
 * }
 */
function fluidRange(cssProp, minScreen, maxScreen) {
  if (minScreen === void 0) {
    minScreen = '320px';
  }
  if (maxScreen === void 0) {
    maxScreen = '1200px';
  }
  if (!Array.isArray(cssProp) && typeof cssProp !== 'object' || cssProp === null) {
    throw new PolishedError(49);
  }
  if (Array.isArray(cssProp)) {
    const mediaQueries = {};
    let fallbacks = {};
    forEach(cssProp, function(obj) {
      if (!obj.prop || !obj.fromSize || !obj.toSize) {
        throw new PolishedError(50);
      }
      fallbacks[obj.prop] = obj.fromSize;
      mediaQueries["@media (min-width: " + minScreen + ")"] = extend__default["default"]({}, mediaQueries["@media (min-width: " + minScreen + ")"], {
        [obj.prop]: between(obj.fromSize, obj.toSize, minScreen, maxScreen)
      });
      mediaQueries["@media (min-width: " + maxScreen + ")"] = extend__default["default"]({}, mediaQueries["@media (min-width: " + maxScreen + ")"], {
        [obj.prop]: obj.toSize
      });
    });
    return extend__default["default"]({}, fallbacks, mediaQueries);
  } else {
    if (!cssProp.prop || !cssProp.fromSize || !cssProp.toSize) {
      throw new PolishedError(51);
    }
    return {
      [cssProp.prop]: cssProp.fromSize,
      [`@media (min-width: ${minScreen})`]: {
        [cssProp.prop]: between(cssProp.fromSize, cssProp.toSize, minScreen, maxScreen),
      },
      [`@media (min-width: ${maxScreen})`]: {
        [cssProp.prop]: cssProp.toSize,
      },
    };
  }
}

var dataURIPattern = /^\s*data:([a-z]+\/[a-z-]+(;[a-z-]+=[a-z-]+)?)?(;charset=[a-z0-9-]+)?(;base64)?,[a-z0-9!$&',()*+,;=\-._~:@/?%\s]*\s*$/i;
var formatHintMapping = {
  woff: 'woff',
  woff2: 'woff2',
  ttf: 'truetype',
  otf: 'opentype',
  eot: 'embedded-opentype',
  svg: 'svg',
  svgz: 'svg'
};
function getFormatHint(format, providedFormatHint) {
  if (!providedFormatHint) return '';
  return ` format("${formatHintMapping[format]}")`;
}

function checkIfDataURI(resourcePath) {
  return !!resourcePath.replace(/\s+/g, ' ').match(dataURIPattern);
}

function createFileReferences(resourcePath, fileFormats, formatHint) {
  if (checkIfDataURI(resourcePath)) {
    return `url("${resourcePath}")` + getFormatHint(fileFormats[0], formatHint);
  }
  const fileReferences = fileFormats.map(function (format) {
    return `url("${resourcePath}.${format}")` + getFormatHint(format, formatHint);
  });
  return fileReferences.join(', ');
}

function createLocalReferences(localFonts) {
  const localReferences = localFonts.map(function (font) {
    return `local("${font}")`;
  });
  return localReferences.join(', ');
}

function createSrc(resourcePath, localFonts, fileFormats, formatHint) {
  const fontReferences = [];
  if (localFonts) fontReferences.push(createLocalReferences(localFonts));
  if (resourcePath) {
    fontReferences.push(createFileReferences(resourcePath, fileFormats, formatHint));
  }
  return fontReferences.join(', ');
}

/**
 * CSS for a @font-face declaration. Defaults to check for local copies of the font on the user's machine. You can disable this by passing `null` to localFonts.
 *
 * @example
 * // Styles as object basic usage
 * const styles = {
 *    ...fontFace({
 *      'fontFamily': 'Sans-Pro',
 *      'fontFilePath': 'path/to/file'
 *    })
 * }
 *
 * // styled-components basic usage
 * const GlobalStyle = createGlobalStyle`${
 *   fontFace({
 *     'fontFamily': 'Sans-Pro',
 *     'fontFilePath': 'path/to/file'
 *   }
 * )}`
 *
 * // CSS as JS Output
 *
 * '@font-face': {
 *   'fontFamily': 'Sans-Pro',
 *   'src': 'url("path/to/file.eot"), url("path/to/file.woff2"), url("path/to/file.woff"), url("path/to/file.ttf"), url("path/to/file.svg")',
 * }
 */

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
  const fontDeclaration = {
    '@font-face': {
      fontFamily: fontFamily,
      src: createSrc(fontFilePath, localFonts, fileFormats, formatHint),
      unicodeRange: unicodeRange,
      fontStretch: fontStretch,
      fontStyle: fontStyle,
      fontVariant: fontVariant,
      fontWeight: fontWeight,
      fontDisplay: fontDisplay,
      fontVariationSettings: fontVariationSettings,
      fontFeatureSettings: fontFeatureSettings,
    }
  };

  return JSON.parse(JSON.stringify(fontDeclaration));
}

/**
 * CSS to render background images while remaining accessible to search engines.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'backgroundImage': 'url(logo.png)',
 *   ...hideText(),
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   backgroundImage: url(logo.png);
 *   ${hideText()};
 * `
 *
 * // CSS in JS Output
 *
 * 'div': {
 *   'backgroundImage': 'url(logo.png)',
 *   'textIndent': '101%',
 *   'overflow': 'hidden',
 *   'whiteSpace': 'nowrap',
 * }
 */
function hideText() {
  return {
    textIndent: '101%',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  };
}

/**
 * CSS to ensure visual hiding of content while maintaining screen reader accessibility.
 * Adapted from [HTML5 Boilerplate](https://github.com/h5bp/html5-boilerplate/blob/9a176f57af1cfe8ec70300da4621fb9b07e5fa31/src/css/main.css#L121)
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...hideVisually(),
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${hideVisually()};
 * `
 *
 * // CSS as JS Output
 *
 * 'div': {
 *   'border': '0',
 *   'clip': 'rect(0 0 0 0)',
 *   'height': '1px',
 *   'margin': '-1px',
 *   'overflow': 'hidden',
 *   'padding': '0',
 *   'position': 'absolute',
 *   'whiteSpace': 'nowrap',
 *   'width': '1px',
 * }
 */
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

/**
 * Generates a media query targeting HiDPI devices.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *  [hiDPI(1.5)]: {
 *    width: 200px;
 *  }
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${hiDPI(1.5)} {
 *     width: 200px;
 *   }
 * `
 *
 * // CSS as JS Output
 *
 * '@media only screen and (-webkit-min-device-pixel-ratio: 1.5),
 *  only screen and (min--moz-device-pixel-ratio: 1.5),
 *  only screen and (-o-min-device-pixel-ratio: 1.5/1),
 *  only screen and (min-resolution: 144dpi),
 *  only screen and (min-resolution: 1.5dppx)': {
 *   'width': '200px',
 * }
 */
function hiDPI(ratio) {
  if (ratio === void 0) {
    ratio = 1.3;
  }
  return "\n    @media only screen and (-webkit-min-device-pixel-ratio: " + ratio + "),\n    only screen and (min--moz-device-pixel-ratio: " + ratio + "),\n    only screen and (-o-min-device-pixel-ratio: " + ratio + "/1),\n    only screen and (min-resolution: " + Math.round(ratio * 96) + "dpi),\n    only screen and (min-resolution: " + ratio + "dppx)\n  ";
}

function createGradientValue(template, ...substitutions) {
  let gradientForm = '';
  for (let index = 0; index < template.length; index += 1) {
    gradientForm += template[index];
    if (index === substitutions.length - 1 && substitutions[index]) {
      const validValues = substitutions.filter(function (substitute) {
        return !!substitute;
      });
      if (validValues.length > 1) {
        gradientForm = gradientForm.slice(0, -1);
        gradientForm += ", " + substitutions[index];
      } else if (validValues.length === 1) {
        gradientForm += "" + substitutions[index];
      }
    } else if (substitutions[index]) {
      gradientForm += substitutions[index] + " ";
    }
  }
  return gradientForm.trim();
}

var _template = taggedTemplateLiteralLoose__default["default"](["linear-gradient(", "", ")"]);
/**
 * CSS to establish a linear gradient; also establishes a fallback background-color. The fallback defaults to the initial color-stop or is set explicitly via a parameter.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...linearGradient({
        colorStops: ['#00FFFF 0%', 'rgba(0, 0, 255, 0) 50%', '#0000FF 95%'],
        toDirection: 'to top right',
        fallback: '#FFF',
      })
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${linearGradient({
        colorStops: ['#00FFFF 0%', 'rgba(0, 0, 255, 0) 50%', '#0000FF 95%'],
        toDirection: 'to top right',
        fallback: '#FFF',
      })}
 *`
 *
 * // CSS as JS Output
 *
 * div: {
 *   'backgroundColor': '#FFF',
 *   'backgroundImage': 'linear-gradient(to top right, #00FFFF 0%, rgba(0, 0, 255, 0) 50%, #0000FF 95%)',
 * }
 */
function linearGradient({
  colorStops,
  fallback,
  toDirection = '',
}) {
  if (!colorStops || colorStops.length < 2) {
    throw new PolishedError(56);
  }
  return {
    backgroundColor: fallback || colorStops[0].replace(/,\s+/g, ',').split(' ')[0].replace(/,(?=\S)/g, ', '),
    backgroundImage: createGradientValue(_template, toDirection, colorStops.join(', ').replace(/,(?=\S)/g, ', '))
  };
}

/**
 * CSS to ensure normalization across browsers (normalize.css v8.0.1 | MIT License).
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *    ...normalize(),
 * }
 *
 * // styled-components usage
 * const GlobalStyle = createGlobalStyle`${normalize()}`
 *
 * // CSS as JS Output
 *
 * html {
 *   lineHeight: 1.15,
 *   textSizeAdjust: 100%,
 * }
 * ... (continued)
 */
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
    "b,\n    strong": {
      fontWeight: 'bolder'
    },
    "code,\n    kbd,\n    samp": {
      fontFamily: 'monospace, monospace',
      fontSize: '1em'
    },
    small: {
      fontSize: '80%'
    },
    "sub,\n    sup": {
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
    },
    'abbr[title]': {
      textDecoration: 'underline dotted'
    }
  }];
}

var _templateOrientation = taggedTemplateLiteralLoose__default["default"](["radial-gradient(", "", "", "", ")"]);
/**
 * CSS to define a radial gradient; also defines a fallback color as the initial color-stop or explicitly set it.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...radialGradient({
 *     colorStops: ['#00FFFF 0%', 'rgba(0, 0, 255, 0) 50%', '#0000FF 95%'],
 *     extent: 'farthest-corner at 45px 45px',
 *     position: 'center',
 *     shape: 'ellipse',
 *   })
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${radialGradient({
 *     colorStops: ['#00FFFF 0%', 'rgba(0, 0, 255, 0) 50%', '#0000FF 95%'],
 *     extent: 'farthest-corner at 45px 45px',
 *     position: 'center',
 *     shape: 'ellipse',
 *   })}
 *`
 *
 * // CSS as JS Output
 *
 * div: {
 *   'backgroundColor': '#00FFFF',
 *   'backgroundImage': 'radial-gradient(center ellipse farthest-corner at 45px 45px, #00FFFF 0%, rgba(0, 0, 255, 0) 50%, #0000FF 95%)',
 * }
 */
function radialGradient({
  colorStops,
  extent = '',
  fallback,
  position = '',
  shape = ''
}) {
  if (!colorStops || colorStops.length < 2) {
    throw new PolishedError(57);
  }
  return {
    backgroundColor: fallback || colorStops[0].split(' ')[0],
    backgroundImage: createGradientValue(_templateOrientation, position, shape, extent, colorStops.join(', '))
  };
}

/**
 * Supports retina background image along with standard ones. Retina backgrounds get rendered under a HiDPI media query with a default _2x.png suffix.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *  ...retinaImage('my-img')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${retinaImage('my-img')}
 * `
 *
 * // CSS as JS Output
 * div {
 *   backgroundImage: 'url(my-img.png)',
 *   '@media only screen and (-webkit-min-device-pixel-ratio: 1.3),
 *    only screen and (min--moz-device-pixel-ratio: 1.3),
 *    only screen and (-o-min-device-pixel-ratio: 1.3/1),
 *    only screen and (min-resolution: 144dpi),
 *    only screen and (min-resolution: 1.5dppx)': {
 *     backgroundImage: 'url(my-img_2x.png)',
 *   }
 * }
 */
function retinaImage(imageName, backgroundSizeSetting, extensionVal, retinaName, retinaSuffixValue) {
  if (extensionVal === void 0) {
    extensionVal = 'png';
  }
  if (retinaSuffixValue === void 0) {
    retinaSuffixValue = '_2x';
  }
  if (!imageName) {
    throw new PolishedError(58);
  }
  let fileExtension = extensionVal.replace(/^\./, '');
  const calculatedRetinaName = retinaName ? `${retinaName}.${fileExtension}` : `${imageName}${retinaSuffixValue}.${fileExtension}`;
  return {
    backgroundImage: `url(${imageName}.${fileExtension})`,
    [hiDPI()]: extend__default["default"]({
      backgroundImage: `url(${calculatedRetinaName})`,
    }, backgroundSizeSetting ? {
      backgroundSize: backgroundSizeSetting,
    } : {}),
  };
}

const functionMappings = {
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

/**
 * Retrieving timing function string representation from commonly used easing functions: (github.com/jaukia/easie).
 *
 * @deprecated - Will be phased out in v5; prefer `easeIn`, `easeOut`, `easeInOut`.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   'transitionTimingFunction': timingFunctions('easeInQuad')
 * }
 *
 * // styled-components usage
 *  const div = styled.div`
 *   transitionTimingFunction: ${timingFunctions('easeInQuad')};
 * `
 *
 * // CSS as JS Output
 *
 * 'div': {
 *   'transitionTimingFunction': 'cubic-bezier(0.550,  0.085, 0.680, 0.530)',
 * }
 */
function timingFunctions(easingFunction) {
  return functionMappings[easingFunction];
}

function determineBorderWidth(direction, height, width) {
  let fullWidth = `${width[0]}${width[1] || ''}`;
  let halfWidth = `${width[0] / 2}${width[1] || ''}`;
  let fullHeight = `${height[0]}${height[1] || ''}`;
  let halfHeight = `${height[0] / 2}${height[1] || ''}`;
  switch (direction) {
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
}

function determineBorderColor(direction, foregroundColor) {
  switch (direction) {
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
}

/**
 * CSS to represent triangle with any pointing direction with an optional background color.
 *
 * @example
 * // Styles as object usage
 *
 * const styles = {
 *   ...triangle({ pointingDirection: 'right', width: '100px', height: '100px', foregroundColor: 'red' })
 * }
 *
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${triangle({ pointingDirection: 'right', width: '100px', height: '100px', foregroundColor: 'red' })}
 *
 *
 * // CSS as JS Output
 *
 * div: {
 *  'borderColor': 'transparent transparent transparent red',
 *  'borderStyle': 'solid',
 *  'borderWidth': '50px 0 50px 100px',
 *  'height': '0',
 *  'width': '0',
 * }
 */
function triangle({
  pointingDirection,
  height,
  width,
  foregroundColor,
  backgroundColor = 'transparent'
}) {
  const widthAndUnit = getValueAndUnit(width);
  const heightAndUnit = getValueAndUnit(height);
  if (isNaN(heightAndUnit[0]) || isNaN(widthAndUnit[0])) {
    throw new PolishedError(60);
  }
  return extend__default["default"]({
    width: '0',
    height: '0',
    borderColor: backgroundColor
  }, determineBorderColor(pointingDirection, foregroundColor), {
    borderStyle: 'solid',
    borderWidth: determineBorderWidth(pointingDirection, heightAndUnit, widthAndUnit)
  });
}

/**
 * Ensures easy change of the `wordWrap` property.
 *
 * @example
 * // Styles as object usage
 * const styles = {
 *   ...wordWrap('break-word')
 * }
 *
 * // styled-components usage
 * const div = styled.div`
 *   ${wordWrap('break-word')}
 * `
 *
 * // CSS as JS Output
 *
 * const styles = {
 *   overflowWrap: 'break-word',
 *   wordWrap: 'break-word',
 *   wordBreak: 'break-all',
 * }
 */
function wordWrap(wrapType) {
  if (wrapType === void 0) {
    wrapType = 'break-word';
  }
  const wordBreakType = wrapType === 'break-word' ? 'break-all' : wrapType;
  return {
    overflowWrap: wrapType,
    wordWrap: wrapType,
    wordBreak: wordBreakType
  };
}

function convertColorToInt(color) {
  return Math.round(color * 255);
}

function toIntConversion(red, green, blue) {
  return `${convertColorToInt(red)},${convertColorToInt(green)},${convertColorToInt(blue)}`;
}

function hslToRgb(hue, saturation, lightness, colorConverter) {
  if (colorConverter === void 0) {
    colorConverter = toIntConversion;
  }
  if (saturation === 0) {
    return colorConverter(lightness, lightness, lightness);
  }
  var huePrime = ((hue % 360 + 360) % 360) / 60;
  var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  var secondaryComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
  var red = 0, green = 0, blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondaryComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondaryComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondaryComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondaryComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondaryComponent;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = secondaryComponent;
  }
  const lightMod = lightness - chroma / 2;
  const finalRed = red + lightMod;
  const finalGreen = green + lightMod;
  const finalBlue = blue + lightMod;
  return colorConverter(finalRed, finalGreen, finalBlue);
}

const colorMap = {
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
  lightgoldenrodyellow: '