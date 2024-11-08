;(function (globalContext) {
  'use strict';

  // Editable Configurations
  const CONFIG = {
    DP: 20, // Max decimal places for division results
    RM: 1, // Rounding mode
    MAX_DP: 1000000, // Max decimals
    MAX_POWER: 1000000, // Max power exponent
    NE: -7, // Exponential notation min exponent
    PE: 21, // Exponential notation max exponent
    STRICT: false // Strict mode for precision loss
  };

  // Error Messages
  const ERRORS = {
    NAME: '[big.js] ',
    INVALID: 'Invalid ',
    DIV_BY_ZERO: 'Division by zero'
  };

  // Helper Constants
  const NUMERIC_REGEX = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
  
  // Prototype for Big objects
  const Proto = {};

  // Create Big constructor
  function createBigConstructor() {
    function Big(value) {
      const instance = this;
      if (!(instance instanceof Big)) {
        return value === undefined ? createBigConstructor() : new Big(value);
      }

      if (value instanceof Big) {
        instance.s = value.s;
        instance.e = value.e;
        instance.c = value.c.slice();
      } else {
        if (typeof value !== 'string') {
          if (Big.strict) {
            throw TypeError(`${ERRORS.INVALID}number`);
          }
          value = value === 0 && 1 / value < 0 ? '-0' : String(value);
        }
        parseNumber(instance, value);
      }
      instance.constructor = Big;
    }

    Big.prototype = Proto;
    Object.assign(Big, CONFIG);
    return Big;
  }

  // Parse input to Big instance
  function parseNumber(instance, input) {
    if (!NUMERIC_REGEX.test(input)) {
      throw Error(`${ERRORS.INVALID}number`);
    }
    var e, i, normalizedLength;
    instance.s = input.charAt(0) === '-' ? (input = input.slice(1), -1) : 1;
    if ((e = input.indexOf('.')) > -1) input = input.replace('.', '');
    if ((i = input.search(/e/i)) > 0) {
      e += +input.slice(i + 1);
      input = input.substring(0, i);
    } else if (e < 0) {
      e = input.length;
    }
    normalizedLength = input.length;
    for (i = 0; i < normalizedLength && input.charAt(i) === '0';) ++i;
    instance.c = [0];
    if (i !== normalizedLength) {
      for (; normalizedLength > 0 && input.charAt(--normalizedLength) === '0';);
      instance.e = e - i - 1;
      for (e = 0; i <= normalizedLength;) instance.c[e++] = +input.charAt(i++);
    }
  }

  // Arithmetic operations like round, add, subtract, etc.
  function round(instance, significantDigits, roundingMode, more) {
    const xc = instance.c;
    if (roundingMode === undefined) roundingMode = Big.RM;
    if (![0, 1, 2, 3].includes(roundingMode)) {
      throw Error(`${ERRORS.INVALID}rounding mode`);
    }
    if (significantDigits < 1) {
      // Round logic for insignificant digits
      more = roundingMode === 3 && (more || !!xc[0]) || significantDigits === 0 && (
        roundingMode === 1 && xc[0] >= 5 ||
        roundingMode === 2 && (xc[0] > 5 || xc[0] === 5 && (more || xc[1] !== undefined))
      );
      xc.length = 1;
      if (more) {
        instance.e = instance.e - significantDigits + 1;
        xc[0] = 1;
      } else {
        xc[0] = instance.e = 0;
      }
    } else if (significantDigits < xc.length) {
      // Round logic when significantDigits is within array bounds
      more = roundingMode === 1 && xc[significantDigits] >= 5 ||
             roundingMode === 2 && (xc[significantDigits] > 5 || xc[significantDigits] === 5 &&
             (more || xc[significantDigits + 1] !== undefined || xc[significantDigits - 1] & 1)) ||
             roundingMode === 3 && (more || !!xc[0]);

      xc.length = significantDigits--;
      if (more) {
        for (; ++xc[significantDigits] > 9;) {
          xc[significantDigits] = 0;
          if (!significantDigits--) {
            ++instance.e;
            xc.unshift(1);
          }
        }
      }
      for (significantDigits = xc.length; !xc[--significantDigits];) xc.pop();
    }
    return instance;
  }

  function compare(x, y){
    var isneg, xc = x.c, yc = (y = new x.constructor(y)).c, i = x.s, j = y.s, k = x.e, l = y.e;
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;
    if (i != j) return i;
    isneg = i < 0;
    if (k != l) return k > l ^ isneg ? 1 : -1;
    j = (k = xc.length) < (l = yc.length) ? k : l;
    for (i = -1; ++i < j;) {
      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    }
    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
  }

  function arithmeticFuncFactory(operator) {
    // Use different strategies based on operator
  }

  // Conversion and string rendering operations
  function stringify(x, doExponential, isNonzero) {
    var e = x.e,
        s = x.c.join(''),
        n = s.length;
    if (doExponential) {
      s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;
    } else if (e < 0) {
      for (; ++e;) s = '0' + s;
      s = '0.' + s;
    } else if (e > 0) {
      if (++e > n) {
        for (e -= n; e--;) s += '0';
      } else if (e < n) {
        s = s.slice(0, e) + '.' + s.slice(e);
      }
    } else if (n > 1) {
      s = s.charAt(0) + '.' + s.slice(1);
    }
    return x.s < 0 && isNonzero ? '-' + s : s;
  }

  // Define exported content and environment
  const Big = createBigConstructor();

  Big['default'] = Big.Big = Big;

  if (typeof define === 'function' && define.amd) {
    define(() => Big);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;
  } else {
    globalContext.Big = Big;
  }
})(this);
