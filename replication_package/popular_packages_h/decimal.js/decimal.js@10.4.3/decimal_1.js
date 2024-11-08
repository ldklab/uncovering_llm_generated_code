(function (globalScope) {
  'use strict';

  const EXP_LIMIT = 9e15;
  const MAX_DIGITS = 1e9;
  const NUMERALS = '0123456789abcdef';

  function Decimal(value) {
    // Initialize decimal object from a value (number/string)
    if (!(this instanceof Decimal)) return new Decimal(value);
    // Handle different value types and set decimal properties
    parseValue(this, value);
  }

  // Default configuration
  Decimal.config = function({ precision = 20, rounding = 4 }) {
    this.precision = validate(precision, 1, MAX_DIGITS);
    this.rounding = validate(rounding, 0, 8);
  }

  // Internal helper: validate configuration
  function validate(value, min, max) {
    if (Math.floor(value) !== value || value < min || value > max) {
      throw Error(`Invalid argument: ${value}`);
    }
    return value;
  }

  // Add method
  Decimal.prototype.add = function(y) {
    return operate(this, new Decimal(y), '+');
  };

  // Subtract method
  Decimal.prototype.sub = function(y) {
    return operate(this, new Decimal(y), '-');
  };

  // Multiply method
  Decimal.prototype.mul = function(y) {
    return operate(this, new Decimal(y), '*');
  };

  // Divide method
  Decimal.prototype.div = function(y) {
    return operate(this, new Decimal(y), '/');
  };

  // Internal helper: parse input value
  function parseValue(decimal, value) {
    // Parse value into decimal object properties
    decimal.value = typeof value === 'string' ? parseFloat(value) : value;
    // Set other decimal-specific properties if needed
  }

  // Internal helper: arithmetic operations
  function operate(x, y, operator) {
    let result;
    switch (operator) {
      case '+':
        result = x.value + y.value;
        break;
      case '-':
        result = x.value - y.value;
        break;
      case '*':
        result = x.value * y.value;
        break;
      case '/':
        result = x.value / y.value;
        break;
      default:
        throw Error(`Unknown operator: ${operator}`);
    }
    return new Decimal(result);
  }

  Decimal.version = '10.4.3';

  // Environment compatibility
  if (typeof module != 'undefined' && module.exports) {
    module.exports = Decimal;
  } else {
    globalScope.Decimal = Decimal;
  }
})(this);
