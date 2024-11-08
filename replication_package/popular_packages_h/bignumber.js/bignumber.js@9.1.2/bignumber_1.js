;(function (global) {
  'use strict';

  // The BigNumber constructor and core library setup.
  function initBigNumber(config) {
    const BASE = 1e14, LOG_BASE = 14, MAX_SAFE_INT = 0x1fffffffffffff;
    const DEFAULT_DECIMAL_PLACES = 20;
    const DEFAULT_ROUNDING_MODE = 4;
    const MAX = 1e9;

    function BigNumber(value, base) {
      if (!(this instanceof BigNumber)) return new BigNumber(value, base);
      this._parseValue(value, base);
    }

    BigNumber.prototype = {
      constructor: BigNumber,

      _parseValue(value, base) {
        // Handle number parsing and initialization here.
      },

      // Instance methods: arithmetic, conversion, etc.
      plus(y, b) { return this._operate(y, b, 1); },
      minus(y, b) { return this._operate(y, b, -1); },
      times(y, b) { /* Multiplication logic */ },
      div(y, b) { /* Division logic */ },
      toFixed(dp, rm) {
        // Convert to fixed-point notation here.
      },
      toString(base) {
        // Handle toString logic, including base conversions.
      },
      // Other instance methods.
    };

    // Static methods and configurations.
    BigNumber.config = function (options) {
      if (typeof options === 'object') {
        // Configure DECIMAL_PLACES, ROUNDING_MODE, etc.
      }
      return {
        DECIMAL_PLACES: DEFAULT_DECIMAL_PLACES,
        ROUNDING_MODE: DEFAULT_ROUNDING_MODE,
        // other config settings
      };
    };

    BigNumber.max = function (...values) {
      // Find max value among arguments.
    };

    BigNumber.min = function (...values) {
      // Find min value among arguments.
    };

    // Helper functions.
    function isValidBase(base) {
      return base >= 2 && base <= 64; // Example of a base check.
    }

    // Other internal utility functions.

    return BigNumber;
  }

  // Expose BigNumber in various environments.
  const BigNumber = initBigNumber();

  if (typeof define === 'function' && define.amd) {
    define(() => BigNumber);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    global.BigNumber = BigNumber;
  }

})(this);
