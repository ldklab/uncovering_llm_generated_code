/*
 *  big.js v6.2.2
 *  A lightweight library for arbitrary-precision decimal arithmetic.
 *  Author: Michael Mclaughlin
 *  License: https://github.com/MikeMcl/big.js/LICENCE.md
 */
(function(global) {
  'use strict';

  // Default settings and constants
  const DEFAULTS = {
    DP: 20,                 // Decimal places for division results.
    RM: 1,                  // Rounding mode.
    MAX_DP: 1E6,            // Maximum decimal places.
    MAX_POWER: 1E6,         // Maximum exponent for pow method.
    NE: -7,                 // Exponential notation lower bound.
    PE: 21,                 // Exponential notation upper bound.
    STRICT: false           // Strict mode flag.
  };

  // Error message templates
  const ERRORS = {
    NAME: '[big.js] ',
    INVALID: '[big.js] Invalid ',
    DIV_BY_ZERO: '[big.js] Division by zero',
    INVALID_DP: '[big.js] Invalid decimal places',
    INVALID_RM: '[big.js] Invalid rounding mode'
  };

  // Constructor
  function BigConstructor() {
    // Main Big function
    function Big(value) {
      if (!(this instanceof Big)) return new Big(value);
      init(this, value);
      this.constructor = Big;
    }

    // Initialize Big instance
    function init(instance, value) {
      if (value instanceof Big) {
        Object.assign(instance, value);
      } else {
        if (typeof value !== 'string') value = String(value);
        parseValue(instance, value);
      }
    }

    // Utility and parsing functions
    function parseValue(instance, value) {
      if (!NUMERIC_REGEX.test(value)) throw Error(ERRORS.INVALID + 'number');
      instance.s = value.startsWith('-') ? -1 : 1;
      if (value.includes('.')) value = value.replace('.', '');
      setExponentAndCoeff(instance, value);
    }

    function setExponentAndCoeff(instance, value) {
      const expPos = value.search(/e/i);
      const coeffValue = expPos > -1 ? value.substring(0, expPos) : value;
      let exponent = expPos > -1 ? parseInt(value.slice(expPos + 1), 10) : 0;
      while (coeffValue.startsWith('0')) coeffValue = coeffValue.slice(1);
      instance.c = coeffValue.split('').map(Number);
      instance.e = instance.c.indexOf(1) === -1 ? 0 : exponent - (expPos > -1 ? expPos : 0);
    }

    Big.prototype = {
      // Arithmetic and utility methods
      abs() { return new this.constructor(this).setSign(1); },
      neg() { return new this.constructor(this).setSign(-this.s); },
      plus(y) { return this.add(y); },
      minus(y) { return this.sub(y); },
      add(y) { return arithmetic(this, y, true); },
      sub(y) { return arithmetic(this, y, false); },
      times(y) { return multiply(this, y); },
      div(y) { return divide(this, y); },
      mod(y) { return modulus(this, y); },
      pow(exp) { return power(this, exp); },
      sqrt() { return squareRoot(this); },
      round(dp, rm) { return rounding(this, dp, rm); },
      toExponential(dp, rm) { return numToString(this, true, dp, rm); },
      toFixed(dp, rm) { return numToString(this, false, dp, rm); },
      toPrecision(sd, rm) { return numToPrecisionString(this, sd, rm); },
      toString() { return numToString(this); },
      valueOf() { return numToString(this, true); },
      toNumber() { return parseFloat(numToString(this, true)); },
      
      cmp(y) { return compare(this, y); },
      eq(y) { return this.cmp(y) === 0; },
      gt(y) { return this.cmp(y) > 0; },
      gte(y) { return this.cmp(y) >= 0; },
      lt(y) { return this.cmp(y) < 0; },
      lte(y) { return this.cmp(y) <= 0; },

      // Method to set sign
      setSign(sign) { this.s = sign; return this; }
    };

    // Arithmetic operations, rounding, and other helper functions
    function arithmetic(x, y, isAddition) {
      // Implement addition and subtraction functionalities
      // ...
      return new Big(); // Placeholder for result
    }

    function multiply(x, y) {
      // Implement multiplication functionality
      // ...
      return new Big(); // Placeholder for result
    }

    function divide(x, y) {
      // Implement division functionality
      // ...
      return new Big(); // Placeholder for result
    }

    function modulus(x, y) {
      // Implement modulus functionality
      // ...
      return new Big(); // Placeholder for result
    }

    function power(x, exp) {
      // Implement exponential power functionality
      // ...
      return new Big(); // Placeholder for result
    }

    function squareRoot(x) {
      // Implement square root functionality
      // ...
      return new Big(); // Placeholder for result
    }

    function rounding(x, dp, rm) {
      // Implement rounding based on decimal places and rounding mode
      // ...
      return new Big(); // Placeholder for result
    }

    function compare(x, y) {
      // Implement comparison logic
      // ...
      return 0; // Placeholder for comparison result
    }

    function numToString(x, expNotation, dp, rm) {
      // Convert number to string with optional exponential notation
      // ...
      return ''; // Placeholder for string representation
    }

    function numToPrecisionString(x, sd, rm) {
      // Convert number to string with specified significant digits
      // ...
      return ''; // Placeholder for precision string representation
    }

    Big.DP = DEFAULTS.DP;
    Big.RM = DEFAULTS.RM;
    Big.NE = DEFAULTS.NE;
    Big.PE = DEFAULTS.PE;
    Big.strict = DEFAULTS.STRICT;

    const NUMERIC_REGEX = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

    return Big;
  }

  // Create the Big number instance
  const Big = BigConstructor();

  // Module Export
  if (typeof define === 'function' && define.amd) {
    define(() => Big);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;
  } else {
    global.Big = Big;
  }
})(this);
