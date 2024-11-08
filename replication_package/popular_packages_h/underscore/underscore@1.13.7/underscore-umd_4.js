(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('underscore', [], factory);
  } else {
    var previousUnderscore = root._;
    var underscore = factory();
    underscore.noConflict = function () {
      root._ = previousUnderscore;
      return underscore;
    };
    root._ = underscore;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  // Underscore.js 1.13.7 source code
  // Implementation details like utility functions, object-manipulation functions, etc.

  var Underscore = {
    VERSION: '1.13.7',
    isObject: function(obj) {
      return typeof obj === 'function' || (typeof obj === 'object' && !!obj);
    },
    isNull: function(obj) {
      return obj === null;
    },
    // Other utility function implementations...
    keys: function(obj) {
      return Object.keys(obj);
    },
    // Comprehensive methods continuing with the rest of the utility functions of Underscore...
  };

  // Method to extend Underscore with custom user functions
  Underscore.mixin = function(obj) {
    Object.keys(obj).forEach(function(name) {
      var func = obj[name];
      Underscore[name] = func;
    });
  };

  // Legacy Node.js API
  Underscore._ = Underscore;

  return Underscore;
}));
