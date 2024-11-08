(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('underscore', factory);
  } else {
    root._ = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  // Set the context and version
  var VERSION = '1.13.7';
  var root = typeof globalThis !== 'undefined' ? globalThis : this;

  // Some utilities
  var noop = function () {};
  var identity = function (value) { return value; };

  // Checks for various types
  var isObject = function (value) {
    return typeof value === 'object' && value !== null;
  };
  var isFunction = function (value) {
    return typeof value === 'function';
  };

  // Collection of utility functions
  var _ = {
    VERSION: VERSION,
    isObject: isObject,
    isFunction: isFunction,
    noop: noop,
    identity: identity,
    // Add more function definitions as needed
  };

  // Allow chaining
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Utility for noConflict
  var previousUnderscore = root._;
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Return the underscore object for usage
  return _;
}));
