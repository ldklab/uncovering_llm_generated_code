;((globalScope) => {
  'use strict';

  const VERSION = '10.2.1';

  // Define default settings for the library
  const DEFAULTS = {
    precision: 20,
    rounding: 4,
    maxE: 9e15,
    minE: -9e15,
    toExpNeg: -7,
    toExpPos: 21,
    crypto: false
  };

  // Define auxiliary constants
  const BASE = 1e7,
        LOG_BASE = 7,
        CRYPTO_UNAVAILABLE = 'crypto unavailable';

  const NUMERALS = '0123456789abcdef';

  // Function to create a new implementation of Decimal with given default settings
  function DecimalFactory(settings = {}) {
    function Decimal(value) {
      // Implementation of Decimal constructor
    }

    // Methods for configuring the Decimal library
    Decimal.config = function(options = {}) {
      // Configuration logic
    };

    // Define arithmetic and utility methods on Decimal prototype
    Decimal.prototype = {
      plus(y) { /* Add value */ },
      minus(y) { /* Subtract value */ },
      times(y) { /* Multiply value */ },
      div(y) { /* Divide value */ },
      // And other mathematical operations...
    };

    return Decimal;
  }

  // Create initial Decimal function with default settings
  const Decimal = DecimalFactory(DEFAULTS);
  Decimal.VERSION = VERSION;

  // Export Decimal function according to the environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Decimal;
  } else if (typeof define === 'function' && define.amd) {
    define(() => Decimal);
  } else {
    globalScope.Decimal = Decimal;
  }
})(typeof self !== 'undefined' ? self : this);
