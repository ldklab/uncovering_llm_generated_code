(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.moment = factory();
  }
})(this, function () {
  'use strict';

  let hookCallback;

  function hooks() {
    return hookCallback.apply(null, arguments);
  }

  function setHookCallback(callback) {
    hookCallback = callback;
  }

  function isObject(input) {
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
  }

  function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
  }

  function isValid(m) {
    if (m._isValid == null) {
      const flags = getParsingFlags(m);
      const isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.invalidMonth && !flags.invalidFormat;
      m._isValid = isNowValid;
    }
    return m._isValid;
  }

  function createInvalid(flags) {
    const m = createUTC(NaN);
    getParsingFlags(m).invalidFormat = true;
    return m;
  }

  function createUTC(input) {
    return createLocalOrUTC(input, true).utc();
  }

  function createLocalOrUTC(input, isUTC) {
    const config = {
      _isAMomentObject: true,
      _useUTC: isUTC,
      _i: input,
    };
    return createFromConfig(config);
  }

  function createFromConfig(config) {
    const res = new Moment(checkOverflow(prepareConfig(config)));
    return res;
  }

  function prepareConfig(config) {
    if (isObject(config._i)) {
      return createInvalid();
    }
    return config;
  }

  function checkOverflow(m) {
    const overflow = -1;
    if (getParsingFlags(m).overflow === -2) {
      getParsingFlags(m).overflow = overflow;
    }
    return m;
  }

  function getParsingFlags(m) {
    if (m._pf == null) {
      m._pf = defaultParsingFlags();
    }
    return m._pf;
  }

  function defaultParsingFlags() {
    return {
      overflow: -2,
      invalidMonth: null,
      invalidFormat: false,
    };
  }

  class Moment {
    constructor(config) {
      this._d = new Date(config._i != null ? config._i : NaN);
      if (!this.isValid()) {
        this._d = new Date(NaN);
      }
    }

    isValid() {
      return isValid(this);
    }

    utc() {
      this._isUTC = true;
      return this;
    }
  }

  const now = function () {
    return Date.now ? Date.now() : +new Date();
  };

  hooks.version = '2.29.1';
  hooks.fn = Moment.prototype;
  hooks.utc = createUTC;

  return hooks;
});
