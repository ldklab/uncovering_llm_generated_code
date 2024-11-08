(function (globalScope) {
  'use strict';

  // decimal.js metadata and defaults
  const EXP_LIMIT = 9e15,
        MAX_DIGITS = 1e9,
        NUMERALS = '0123456789abcdef',
        LN10 = '2.302585092994045684017991454684...', // shortened for brevity
        PI = '3.14159265358979323846264338327950...', // shortened for brevity
        DEFAULTS = {
          precision: 20,
          rounding: 4,
          modulo: 1,
          toExpNeg: -7,
          toExpPos: 21,
          minE: -EXP_LIMIT,
          maxE: EXP_LIMIT,
          crypto: false
        };

  // Key components and global state
  let Decimal, noConflict, quadrant, external = true;
  const LOG_BASE = 7,
        BASE = 1e7,
        cryptoUnavailable = '[DecimalError] crypto unavailable',
        invalidArgument = '[DecimalError] Invalid argument: ',
        decimalError = '[DecimalError] ',
        precisionLimitExceeded = decimalError + 'Precision limit exceeded';

  // Regex patterns for number types
  const isDecimal = /^\d+(\.\d*)?(e[+-]?\d+)?$/,
        isBinary = /^0b[01]+/, 
        isHex = /^0x[0-9a-f]+/,
        isOctal = /^0o[0-7]+/;

  // Decimal prototype with core functions
  const DecimalPrototype = {
    // Other prototype methods...

    toBinary: function(sd, rm) {
      return toStringRadix(this, 2, sd, rm);
    },

    toHexadecimal: function(sd, rm) {
      return toStringRadix(this, 16, sd, rm);
    },

    toOctal: function(sd, rm) {
      return toStringRadix(this, 8, sd, rm);
    },

    // Other prototype methods...
  };

  function toStringRadix(x, baseOut, sd, rm) {
    // Convert a Decimal to a string in a specified base
    // (function content is omitted here for brevity)
    // Returns a string representation in specified base
  }

  // Decimal constructor definition
  Decimal = function(value) {
    // Decimal initialization code
    // (implementation is omitted for brevity)
  };

  // Default configuration
  Decimal.config = Decimal.set = function(obj) {
    // Configure library settings
    if (!obj || typeof obj !== 'object') {
      throw Error(decimalError + 'Object expected');
    }
    // Handle configuration setting based on `obj`
  };

  function isDecimalInstance(obj) {
    return obj instanceof Decimal;
  }

  // Helper functions
  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }

  // Additional helper functions...

  // Decimal functions
  Decimal.abs = function(x) { return new this(x).abs(); };
  // More functions...

  // Clone function to create a new Decimal constructor
  Decimal.clone = function() {
    // New constructor with same configurations
  };

  Decimal.prototype = DecimalPrototype;

  // Export setup
  if (typeof define === 'function' && define.amd) {
    define(function () { return Decimal; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Decimal;
  } else {
    if (!globalScope) {
      globalScope = (typeof self !== 'undefined' && self.self === self) ? self : window;
    }
    noConflict = globalScope.Decimal;
    Decimal.noConflict = function() {
      globalScope.Decimal = noConflict;
      return Decimal;
    };
    globalScope.Decimal = Decimal;
  }
})(this);
