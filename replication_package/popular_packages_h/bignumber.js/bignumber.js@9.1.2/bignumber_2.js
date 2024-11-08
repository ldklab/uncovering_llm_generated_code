(function (global) {
  'use strict';

  var BigNumber = createBigNumber();

  // Export BigNumber based on the environment
  if (typeof define === 'function' && define.amd) {
    define(() => BigNumber);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    global = global || (typeof self !== 'undefined' ? self : window);
    global.BigNumber = BigNumber;
  }

  function createBigNumber() {
    const MAX = 1E9, BASE = 1e14, LOG_BASE = 14;
    let DECIMAL_PLACES = 20, ROUNDING_MODE = 4;

    function BigNumber(value) {
      if (!(this instanceof BigNumber)) return new BigNumber(value);
      this.s = value < 0 ? -1 : 1;
      // Additional initialization logic...
    }

    BigNumber.clone = () => createBigNumber();
    BigNumber.config = (options) => {
      if (options) {
        DECIMAL_PLACES = options.DECIMAL_PLACES || DECIMAL_PLACES;
        ROUNDING_MODE = options.ROUNDING_MODE || ROUNDING_MODE;
      }
      return { DECIMAL_PLACES, ROUNDING_MODE };
    };

    BigNumber.prototype = {
      constructor: BigNumber,
      plus(y) { return this._operate(y, '+'); },
      minus(y) { return this._operate(y, '-'); },
      times(y) { return this._operate(y, '*'); },
      div(y) { return this._operate(y, '/'); },
      abs() { return new BigNumber(Math.abs(this)); },
      toString() { return String(this.s); },
      // Adding further prototype methods...
      _operate(y, op) {
        y = new BigNumber(y);
        if (op === '+') return new BigNumber(this + y);
        // More operations...
      }
    };

    return BigNumber;
  }
})(this);
