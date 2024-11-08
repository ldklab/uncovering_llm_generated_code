(function (global) {
  'use strict';

  class BigNumber {
    constructor(value, base) {
      this.c = null; // Coefficient (significand)
      this.e = null; // Exponent
      this.s = null; // Sign

      // Ensure instance is created even if called without 'new'
      if (!(this instanceof BigNumber)) return new BigNumber(value, base);

      // Conversion logic
      if (base == null) {
        this._fromValue(value);
      } else {
        this._fromBase(value, base);
      }
    }

    _fromValue(value) {
      if (value instanceof BigNumber) {
        // Assign properties from another BigNumber
        Object.assign(this, value);
        return;
      }
      let strValue = String(value).trim();
      // Handle sign
      this.s = strValue[0] === '-' ? (strValue = strValue.slice(1), -1) : 1;

      // Handle special cases
      if (strValue === 'Infinity') {
        this.e = null;
      } else if (/NaN|[^0-9.]/.test(strValue)) {
        this.c = this.e = this.s = null; // NaN
      } else {
        this._parseNumeric(strValue);
      }
    }

    _parseNumeric(value) {
      const [intPart, decPart] = value.split('.');
      this.e = intPart.length - 1;
      this.c = (intPart + (decPart || '')).replace(/^0+|0+$/g, '');
      if (!this.c) {
        this.e = 0;
        this.c = '0';
      }
    }

    _fromBase(value, base) {
      intCheck(base, 2, BigNumber.config.ALPHABET.length, 'Base');
      let str = String(value);
      // Validate and convert using base
      this.c = convertBase(str, base, 10, this.s);
      this.e = this.c.length - 1;
    }

    // Convert the coefficient to a string
    static coeffToString(coeff) {
      let result = coeff[0] + ''; // Handle first element
      for (let i = 1; i < coeff.length; i++) {
        let str = coeff[i] + '';
        result += '0'.repeat(BigNumber.LOG_BASE - str.length) + str;
      }
      return result;
    }

    // Public methods similar to prototype functions
    absoluteValue() {
      let result = new BigNumber(this);
      result.s = this.s < 0 ? 1 : result.s;
      return result;
    }
    
    plus(y, base) {
      // Implementation of adding
    }

    minus(y, base) {
      // Implementation of subtraction
    }
  
    // Other operations...
  }

  // Utility and helper functions
  function intCheck(n, min, max, name) {
    if (typeof n !== 'number' || n < min || n > max || n !== Math.floor(n)) {
      throw new Error(`[BigNumber Error] ${name} out of range: ${n}`);
    }
  }

  function convertBase(value, fromBase, toBase) {
    // Convert value in fromBase to string in toBase
  }

  // Configuration for BigNumber instances
  BigNumber.config = {
    DECIMAL_PLACES: 20,
    ROUNDING_MODE: 4,
    ALPHABET: '0123456789abcdefghijklmnopqrstuvwxyz',
    // More configuration properties...
  };

  BigNumber.config.set = function (options) {
    Object.assign(BigNumber.config, options);
    return BigNumber.config;
  };

  // Attach to global object
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    global.BigNumber = BigNumber;
  }
})(this);
