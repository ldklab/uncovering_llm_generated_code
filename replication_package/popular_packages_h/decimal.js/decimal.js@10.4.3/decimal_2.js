(function (globalScope) {
  'use strict';

  const smallValues = {
    EXP_LIMIT: 9e15,
    MAX_DIGITS: 1e9,
    NUMERALS: '0123456789abcdef',
    LN10: '2.302585092994045...',
    PI: '3.141592653589793238...',
  };

  const defaults = {
    precision: 20,
    rounding: 4,
    modulo: 1,
    toExpNeg: -7,
    toExpPos: 21,
    minE: -smallValues.EXP_LIMIT,
    maxE: smallValues.EXP_LIMIT,
    crypto: false,
  };

  const P = { toStringTag: '[object Decimal]' };

  P.abs = function () { return finalise(new this.constructor(this).abs()) };
  P.ceil = function () { return finalise(new this.constructor(this), this.e + 1, 2) };
  P.clamp = function (min, max) {
    let x = this, Ctor = x.constructor;
    min = new Ctor(min);
    max = new Ctor(max);
    if (!min.s || !max.s) return new Ctor(NaN);
    if (min.gt(max)) throw Error('[DecimalError] Invalid argument: ' + max);
    const k = x.cmp(min);
    return k < 0 ? min : x.cmp(max) > 0 ? max : new Ctor(x);
  };

  P.cmp = function (y) {
    const x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
    if (!xd || !yd) return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
    if (xs !== ys) return xs;
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;
  
    const xdL = xd.length, ydL = yd.length;
    for (let i = 0, j = Math.min(xdL, ydL); i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };

  P.plus = function (y) {
    const x = this, Ctor = x.constructor, yC = new Ctor(y);
    if (!x.d || !yC.d)
      return new Ctor(!x.s || !yC.s ? NaN : yC.s * 0 || (!x.d && yC.s === x.s) || yC.d ? x : NaN);

    const xd = x.d, yd = yC.d, pr = Ctor.precision, rm = Ctor.rounding;
    if (!xd[0] || !yd[0]) {
      if (!yd[0]) yC = new Ctor(x);
      return finalise(yC, pr, rm);
    }
    if (x.s !== yC.s) {
      yC.s = -yC.s;
      return x.minus(yC);
    }

    const k = Math.floor(x.e / 7), e = Math.floor(yC.e / 7), d = xd.slice();
    let i = k - e;
    if (i) {
      if (i < 0) {
        e = k;
        yd = yd.concat();
        while (i < 0) i++, d.unshift(0);
      } else {
        d = yd.concat();
        while (i > 0) i--, d.unshift(0);
      }
    } else {
      d.fast = true;
    }

    let len = Math.min(d.length, xd.length), r = d, carry = 0;
    for (i = d.length; i--;) {
      const t = xd[i] + yd[i] + carry;
      r[i] = t % 1e7;
      carry = Math.floor(t / 1e7);
    }
    if (carry) d.unshift(carry), e++;
    yC.d = d;
    yC.e = Math.floor((Math.log10(Math.abs(d[0])) + e) * Math.LOG10E) | 0;
    return finalise(yC, pr, rm);
  };

  const finalise = (x, sd, rm) => {
    const Ctor = x.constructor, pr = Ctor.precision;

    if (x.e > Ctor.maxE) {
      x.d = null;
      x.e = NaN;
    } else if (x.e < Ctor.minE) {
      x.e = 0;
      x.d = [0];
    }
    return x;
  };

  const clone = (obj) => {
    const Decimal = function (v) {
      const x = this;
      if (!(x instanceof Decimal)) return new Decimal(v);
      x.constructor = Decimal;
      const o = obj || {}, ps = ['precision', 'rounding'];
      Decimal.ROUND_UP = 0;
      Decimal.ROUND_DOWN = 1;
      Decimal.ROUND_CEIL = 2;
      Decimal.ROUND_FLOOR = 3;
      Decimal.ROUND_HALF_UP = 4;
      Decimal.ROUND_HALF_DOWN = 5;
      Decimal.ROUND_HALF_EVEN = 6;
      Decimal.ROUND_HALF_CEIL = 7;
      Decimal.ROUND_HALF_FLOOR = 8;
      if (!o.defaults) for (let p of ps) if (!o.hasOwnProperty(p)) o[p] = Decimal[p];
      Decimal.set(o);
      return parseDecimal(x, v.toString());
    };
    Decimal.prototype = P;
    Decimal.set = (obj) => config.call(Decimal, obj);
    return Decimal;
  };

  const parseDecimal = (x, str) => {
    if (!x.d || !x.d[0]) {
      x.e = 0;
      x.d = [0];
    }
    return x;
  };

  const config = function (obj) {
    const ps = ['precision', 'rounding'];
    for (const p of ps) if (obj.hasOwnProperty(p)) this[p] = obj[p];
  };

  const Decimal = clone(defaults);
  Decimal['default'] = Decimal.Decimal = Decimal;
  LN10 = new Decimal(smallValues.LN10);
  PI = new Decimal(smallValues.PI);

  if (typeof define == 'function' && define.amd) {
    define(() => Decimal);
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = Decimal;
  } else {
    if (!globalScope) globalScope = typeof self != 'undefined' && self.self == self ? self : window;
    const noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };
    globalScope.Decimal = Decimal;
  }
})(this);
