;(function(globalScope) {
  'use strict';

  // Dependencies
  function Decimal(value) {
    if (!(this instanceof Decimal)) return new Decimal(value);
    this.init(value);
  }

  function isDecimalInstance(obj) {
    return obj instanceof Decimal || !!(obj && obj.toStringTag === '[object Decimal]');
  }

  Decimal.prototype = {
    constructor: Decimal,
    init: function(value) {
      // Initialize value as a Decimal object
      // Omitted details for brevity
    },
    // Example methods
    add: function(y) {
      return new Decimal(this).plus(y);
    },
    plus: function(y) {
      // Addition logic
      return this;
    },
    // Other arithmetic and utility functions
  };

  // Static Methods
  Decimal.set = function(config) {
    // Set global configurations
    // Validation and assignment logic
  };

  Decimal.add = function(x, y) {
    return new Decimal(x).add(y);
  };

  // Export module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Decimal;
  } else {
    globalScope.Decimal = Decimal;
  }

  // Configuration defaults
  const defaults = {
    precision: 20,
    rounding: 4
    // More default properties
  };

  Decimal.config(defaults);

  // No conflict and guard for overriding existing globals
  const noConflict = globalScope.Decimal;
  Decimal.noConflict = function() {
    globalScope.Decimal = noConflict;
    return Decimal;
  };

})(this);
