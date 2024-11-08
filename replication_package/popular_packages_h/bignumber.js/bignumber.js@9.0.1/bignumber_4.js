(function (global) {
  'use strict';

  const VERSION = '9.0.1';
  const BASE = 1e14;
  const LOG_BASE = 14;
  const MAX = 1E9;
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
  const MAX_SAFE_INTEGER = 0x1fffffffffffff;

  let BigNumber;
  let config = {};

  const DEFAULTS = {
    DECIMAL_PLACES: 20,
    ROUNDING_MODE: 4,
    TO_EXP_NEG: -7,
    TO_EXP_POS: 21,
    MIN_EXP: -1e7,
    MAX_EXP: 1e7,
    CRYPTO: false,
    MODULO_MODE: 1,
    POW_PRECISION: 0,
    FORMAT: {
      prefix: '',
      groupSize: 3,
      groupSeparator: ',',
      decimalSeparator: '.',
    },
  };

  class BigNumber {
    constructor(value, base) {
      if (!(this instanceof BigNumber)) return new BigNumber(value, base);
      this._initialize(value, base);
    }

    _initialize(value, base) {
      // Initialization logic
      // Handling input parsing, base conversion, and setting the internal state
    }

    static config(options) {
      // Accepts configuration options and validates them
    }

    static isBigNumber(value) {
      // Checks if a value is a BigNumber instance
    }

    static random(dp) {
      // Generates a random BigNumber with given decimal places
    }

    abs() {
      // Returns absolute value
    }

    add(y, base) {
      // Returns sum of this BigNumber and y
    }

    minus(y, base) {
      // Returns result of subtracting y from this BigNumber
    }
  
    times(y, base) {
      // Returns product of this BigNumber and y
    }
  
    dividedBy(y, base) {
      // Returns result of division of this BigNumber by y
    }
  
    modulo(y, base) {
      // Returns modulo of this BigNumber by y
    }

    pow(n, m) {
      // Returns result of raising this BigNumber to the power n, optionally modulo m
    }

    toString(base) {
      // Converts to string representation in given base
    }

    toNumber() {
      // Converts BigNumber to a JavaScript number
    }

    valueOf() {
      return this.toString();
    }
  
    // Add more instance methods as needed...
  }

  function defineProperties(target) {
    // Define properties and prototype methods for BigNumber
  }

  function extend(target, source) {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  function isNumeric(value) {
    return /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value);
  }

  BigNumber = function (...args) {
    return new BigNumber(...args);
  };

  extend(BigNumber, DEFAULTS);
  BigNumber.VERSION = VERSION;
  BigNumber.config(DEFAULTS);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    global.BigNumber = BigNumber;
  }
})(this);
