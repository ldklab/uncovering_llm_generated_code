(function(exports) {
  'use strict';

  const BigNumber = (function() {
    // Private variables and constants
    const BASE = 1e14,
          LOG_BASE = 14,
          MAX_SAFE_INTEGER = 0x1fffffffffffff,
          POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
          SQRT_BASE = 1e7,
          bignumberError = '[BigNumber Error] ',
          tooManyDigitsError = `${bignumberError}Number primitive has more than 15 significant digits: `;

    let DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, MODULO_MODE = 1, POW_PRECISION = 0,
        FORMAT = { prefix: '', groupSize: 3, secondaryGroupSize: 0, groupSeparator: ',', decimalSeparator: '.', fractionGroupSize: 0, fractionGroupSeparator: '\xA0', suffix: '' },
        ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz', MAX = 1e9;
    
    function clone(config) {
      const BigNumber = function(value, base) {
        // Constructor Implementation
        const isNumber = typeof value === 'number';
        if (!(this instanceof BigNumber)) return new BigNumber(value, base);
        
        if (base == null) {
          // Handling numeric inputs
          if (isNumber && value * 0 === 0) {
            this.s = 1 / value < 0 ? -1 : 1;
            this.e = isNumber && value === (value | 0)
              ? Math.floor(Math.log10(Math.abs(value))) + 1
              : Math.floor(Math.log10(Math.abs(value)));
            this.c = isFinite(value) ? [Math.abs(value)] : null;
          } else {
            this.s = parseNumeric(value);
            this.e = isFinite(value) && Number.isFinite(value) ? Math.floor(Math.log10(Math.abs(value))) + 1 : null;
            this.c = this.s ? String(value).split('').map(Number) : null;
          }
        } else {
          // Handling non-decimal bases
          if (!Number.isInteger(base) || base < 2 || base > ALPHABET.length) throw Error(`${bignumberError}Base must be an integer: ${base}`);
          // Other base logic here
        }
      };

      BigNumber.prototype = {
        constructor: BigNumber,
        toString: function() { return this.c === null ? 'NaN' : `${this.s < 0 ? '-' : ''}${coeffToString(this.c)}`; },
        // Additional prototype and utility methods here
      };

      function parseNumeric(value) {
        // parseNumeric logic
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return null;
        return numericValue < 0 ? -1 : 1;
      }

      function coeffToString(coeffArr) {
        return coeffArr.join('');
      }

      // Static properties
      BigNumber.clone = clone;
      BigNumber.config = (config) => {
        // Config implementation
        if (typeof config !== 'object') throw Error(`${bignumberError}Object expected: ${config}`);
        // Apply configuration
        return { DECIMAL_PLACES, ROUNDING_MODE, EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS], RANGE: [MIN_EXP, MAX_EXP], CRYPTO, MODULO_MODE, POW_PRECISION, FORMAT, ALPHABET };
      };
      
      // Additional static methods and constants
      return BigNumber;
    }

    return clone();
  })();

  // Export BigNumber for AMD, CommonJS, and browser environments
  if (typeof define === 'function' && define.amd) {
    define(() => BigNumber);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    exports.BigNumber = BigNumber;
  }
})(typeof self !== 'undefined' ? self : this);
