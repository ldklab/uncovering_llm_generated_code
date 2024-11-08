(function (GLOBAL) {
  'use strict';

  // Define the Big constructor.
  function Big(n) {
    if (!(this instanceof Big)) return new Big(n);
    if (n instanceof Big) {
      this.s = n.s; this.e = n.e; this.c = n.c.slice();
    } else {
      parse(this, n === 0 && 1 / n < 0 ? '-0' : String(n));
    }
  }

  // Configuration defaults
  let DP = 20, RM = 1, MAX_DP = 1E6, MAX_POWER = 1E6;
  let NE = -7, PE = 21, STRICT = false;
  let INVALID = '[big.js] Invalid ';
  let NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

  // Parse numeric input
  function parse(x, n) {
    if (!NUMERIC.test(n)) throw Error(INVALID + 'number');
    x.s = n.charAt(0) === '-' ? (n = n.slice(1), -1) : 1;
    let e = n.indexOf('.'); if (e > -1) n = n.replace('.', '');
    let i = n.search(/e/i); if (i > 0) {
      e += +n.slice(i + 1); n = n.substring(0, i);
    } else e = e < 0 ? n.length : e;
    n = n.replace(/^0+|0+$/g, ''); x.c = [...n].map(Number); x.e = e - n.length;
  }

  // Basic arithmetic operations
  Big.prototype.add = function (y) {
    return addSub(this, new Big(y), false);
  };

  Big.prototype.sub = function (y) {
    return addSub(this, new Big(y), true);
  };

  Big.prototype.mul = function (y) {
    return multiply(this, new Big(y));
  };

  Big.prototype.div = function (y) {
    return divide(this, new Big(y));
  };

  // Rounding
  function round(x, sd, rm) {
    if (sd < 1) {
      if ((rm === 1 && x.c[0] >= 5) || rm === 2 && x.c[0] > 5) x.c[0] = 1;
      x.c.length = 1; x.e = 0;
    } else {
      x.c.length = sd;
    }
    return x;
  }

  // Environment export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;
  } else if (typeof define === 'function' && define.amd) {
    define(() => Big);
  } else {
    GLOBAL.Big = Big;
  }

})(this);
