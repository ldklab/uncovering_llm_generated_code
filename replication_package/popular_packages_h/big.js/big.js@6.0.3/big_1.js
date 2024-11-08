;(function (global) {
  'use strict';

  const DEFAULTS = {
    DP: 20, // Maximum decimal places for division and roots
    RM: 1, // Default rounding mode
    MAX_DP: 1E6, // Maximum allowed decimal places
    MAX_POWER: 1E6, // Maximum exponent for power function
    NE: -7, // Minimum exponent for returning exponential notation
    PE: 21, // Maximum exponent for returning exponential notation
    STRICT: false, // Strict mode for number handling
  };

  const ERROR_MESSAGES = {
    NAME: '[big.js] ',
    INVALID: 'Invalid ',
    INVALID_DP: 'Invalid decimal places',
    INVALID_RM: 'Invalid rounding mode',
    DIV_BY_ZERO: 'Division by zero',
  };

  const NUMERIC_REGEX = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
  let Big, P = {};

  function _Big_() {
    function Big(n) {
      if (!(this instanceof Big)) return n === void 0 ? _Big_() : new Big(n);
      if (n instanceof Big) {
        this.s = n.s;
        this.e = n.e;
        this.c = n.c.slice();
      } else {
        const strValue = typeof n !== 'string' ? String(n) : n;
        parse(this, strValue);
      }
      this.constructor = Big;
    }

    Big.prototype = P;
    Big.DP = DEFAULTS.DP;
    Big.RM = DEFAULTS.RM;
    Big.NE = DEFAULTS.NE;
    Big.PE = DEFAULTS.PE;
    Big.strict = DEFAULTS.STRICT;

    return Big;
  }

  function parse(x, n) {
    if (!NUMERIC_REGEX.test(n)) throw Error(ERROR_MESSAGES.INVALID + 'number');
    x.s = n.charAt(0) === '-' ? (n = n.slice(1), -1) : 1;
    let e = n.indexOf('.');
    if (e > -1) n = n.replace('.', '');
    const i = n.search(/e/i);
    if (i > 0) e += +n.slice(i + 1), n = n.substring(0, i);
    else e = n.length;
    const nl = n.length;
    let iZero = 0;
    for (; iZero < nl && n.charAt(iZero) === '0';) ++iZero;
    if (iZero === nl) x.c = [x.e = 0];
    else {
      let tZero = nl;
      while (tZero > 0 && n.charAt(--tZero) === '0');
      x.e = e - iZero - 1;
      x.c = [];
      for (e = 0; iZero <= tZero;) x.c[e++] = +n.charAt(iZero++);
    }
  }

  function round(x, sd, rm) {
    const xc = x.c;
    if (rm === void 0) rm = Big.RM;
    if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) throw Error(ERROR_MESSAGES.INVALID_RM);
    if (sd < 1) {
      const more = rm === 3 && (rm === 1 && xc[0] >= 5) || rm === 2 && (xc[0] > 5) || xc[0] === 5 && (rm === 3 || xc[1] !== void 0);
      xc.length = 1;
      if (more) x.e = x.e - sd + 1, xc[0] = 1;
      else xc[0] = x.e = 0;
    } else if (sd < xc.length) {
      const more = rm === 1 && xc[sd] >= 5 || rm === 2 && (xc[sd] > 5 || xc[sd] === 5 && (rm === 3 || xc[sd + 1] !== void 0 || xc[sd - 1] & 1)) || rm === 3 && (rm === 3 || !!xc[0]);
      xc.length = sd--;
      if (more) for (; ++xc[sd] > 9;) xc[sd] = 0, ++x.e && xc.unshift(1);
      while (!xc[--sd]) xc.pop();
    }
    return x;
  }

  function stringify(x, exponential, isNonzero) {
    const s = x.c.join('');
    const e = x.e + 1;
    return exponential ? `${s.charAt(0)}${s.length > 1 ? '.' : ''}${s.slice(1)}e${e < 0 ? '' : '+'}${e}` : s;
  }

  P.abs = function () {
    const x = new this.constructor(this);
    x.s = 1;
    return x;
  };

  P.cmp = function (y) {
    const x = this;
    const xc = x.c;
    const yc = (y = new x.constructor(y)).c;
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -y.s : x.s;
    if (x.s !== y.s) return x.s;
    const isneg = x.s < 0;
    const k = x.e;
    const l = y.e;
    const compareExponent = k !== l ? k > l ^ isneg ? 1 : -1 : 0;
    if (compareExponent !== 0) return compareExponent;
    let i = -1;
    let j = xc.length < yc.length ? xc.length : yc.length;
    while (++i < j) if (xc[i] !== yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    return xc.length === yc.length ? 0 : xc.length > yc.length ^ isneg ? 1 : -1;
  };

  P.div = function (y) {
    const x = this;
    const Big = x.constructor;
    const a = x.c.slice();
    const b = (y = new Big(y)).c;
    if (!b[0]) throw Error(ERROR_MESSAGES.DIV_BY_ZERO);
    const k = a.length;
    const dp = Big.DP;
    if (!a[0]) {
      y.s = x.s === y.s ? 1 : -1;
      y.c = [y.e = 0];
      return y;
    }
    let rl = a.length;
    let p = Math.max(0, dp + (y.e = x.e - y.e) + 1);
    const q = y;
    const qc = q.c = [];
    let ai = 0;
    const bl = b.length;
    const bz = b.slice();
    while (rl++ < bl) a.push(0);
    do {
      let n = 0;
      let cmp;
      do {
        const t = rl === bl ? b : bz;
        cmp = rl !== a.length ? rl > a.length ? 1 : -1 : 0;
        if (cmp === 0) {
          for (let i = -1; ++i < bl;) if (b[i] !== a[i]) {
            cmp = b[i] > a[i] ? 1 : -1;
            break;
          }
        }
        if (cmp < 0) {
          for (let bt = rl === bl ? b : bz; rl;) {
            if (a[--rl] < bt[rl]) {
              let ri = rl;
              while (ri && !a[--ri]) a[ri] = 9;
              --a[ri];
              a[rl] += 10;
            }
            a[rl] -= bt[rl];
          }
          a = a.filter(digit => digit !== 0);
        } else {
          r = a;
          break;
        }
      } while (n++ < 10);
      qc.push(cmp ? n : ++n);
      if (a[0] && cmp) a[rl] = qc[ai] || 0;
    } while ((ai++ < k || a[0] !== void 0) && p--);
    q.s = x.s === y.s ? 1 : -1;
    if (qc[0] === 0 && qc.length !== 1) {
      qc.shift();
      q.e--;
    }
    if (qc.length > p) round(q, p, Big.RM, a[0] !== void 0);
    return q;
  };

  P.eq = function (y) {
    return this.cmp(y) === 0;
  };

  P.gt = function (y) {
    return this.cmp(y) > 0;
  };

  P.gte = function (y) {
    return this.cmp(y) >= 0;
  };

  P.lt = function (y) {
    return this.cmp(y) < 0;
  };

  P.lte = function (y) {
    return this.cmp(y) <= 0;
  };

  P.minus = P.sub = function (y) {
    if (this.s !== y.s) {
      y.s = -y.s;
      return this.plus(y);
    }
    const xc = this.c.slice();
    const xe = this.e;
    const yc = (y = new this.constructor(y)).c;
    const ye = y.e;
    let j = 0;
    if (xe !== ye) {
      j = xe < ye ? xe : ye;
      for (let t = (xe < ye ? xc : yc).reverse(), b = Math.abs(xe - ye); b--;) t.push(0);
      (xe < ye ? xc : yc).reverse();
    } else if (xc.length < yc.length) {
      yc = xc;
      xc = y.c;
      y.s = -y.s;
    }
    if (!xc[0] || !yc[0]) return !yc[0] ? new this.constructor(this) : yc[0];
    const a = xc.length;
    const k = yc.length;
    if (xc[a - 1] < yc[k - 1]) {
      [xc, yc] = [yc, xc];
      y.s = -y.s;
    }
    for (let b = xc.length, c = 0; b > j; xc.pop()) {
      if (b === j) break;
      if (xc[b -= 1] < yc[b]) {
        for (c = xc[--b] |= 0; !xc[--b];) xc[b] = 9;
        --xc[b];
        xc[b + 1] = (xc[b + 1] | 0) + 10;
      }
      xc[b] -= yc[b];
    }
    while (!xc[--b]) xc.pop();
    return new y.constructor(xc);
  };

  P.mod = function (y) {
    if (!y.c[0]) throw Error(ERROR_MESSAGES.DIV_BY_ZERO);
    const ygtx = y.cmp(this) === 1;
    const x = this.div(y);
    return new this.constructor(this.minus(x.times(y)));
  };

  P.plus = P.add = function (y) {
    if (this.s !== y.s) {
      y.s = -y.s;
      return this.minus(y);
    }
    let xc = this.c;
    let yc = (y = new this.constructor(y)).c;
    let e = this.e;
    if (!xc[0] || !yc[0]) {
      if (!yc[0]) return new this.constructor(this);
      return yc[0];
    }
    if (e = this.e - y.e) {
      if (e < 0) [xc, yc] = [yc, xc];
      if (e > 0) {
        yc.length += e;
      } else {
        xc.reverse().push(0);
        xc.reverse();
      }
    }
    while (yc.length < xc.length) yc.push(0);
    const len = yc.length;
    let carry = 0;
    for (let k = len; k--;) {
      yc[k] = (yc[k] += (xc[k] || 0) + carry) % 10;
      carry = (yc[k] += carry) / 10 | 0;
    }
    while (carry) yc.unshift(carry -= carry = yc[k += carry] = (yc[k] += carry) % 10);
    return new this.constructor(yc);
  };

  P.pow = function (n) {
    if (n !== ~~n || n < -DEFAULTS.MAX_POWER || n > DEFAULTS.MAX_POWER) throw Error(ERROR_MESSAGES.INVALID + 'exponent');
    const x = new this.constructor(this);
    const one = new this.constructor('1');
    let y = one, isNeg = n < 0;
    if (isNeg) n = -n;
    if (!n) return one;
    while (n) {
      if (n % 2) y = y.times(x);
      x = x.times(x);
      n >>= 1;
    }
    return isNeg ? one.div(y) : y;
  };

  P.prec = function (sd, rm) {
    if (sd !== ~~sd || sd < 1 || sd > DEFAULTS.MAX_DP) throw Error(ERROR_MESSAGES.INVALID + 'precision');
    return round(new this.constructor(this), sd, rm);
  };

  P.round = function (dp, rm) {
    if (dp === void 0) dp = 0;
    else if (dp !== ~~dp || dp < -DEFAULTS.MAX_DP || dp > DEFAULTS.MAX_DP) throw Error(ERROR_MESSAGES.INVALID_DP);
    return round(new this.constructor(this), dp + this.e + 1, rm);
  };

  P.sqrt = function () {
    const Big = this.constructor;
    const s = this.s;
    if (!this.c[0]) return new Big(this);
    if (s < 0) throw Error(ERROR_MESSAGES.NAME + 'No square root');
    const half = new Big('0.5');
    let temp, x = this;
    let estimated = x.toString().split('');
    estimated = estimated.length & 1 ? estimated.concat('0') : estimated;
    let r = new Big(Math.sqrt(estimated.join('')));
    const precision = r.e + (Big.DP += 4);
    do {
      temp = r;
      r = half.times(new Big(temp).plus(x.div(temp)));
    } while (temp.c.slice(0, precision).join('') !== r.c.slice(0, precision).join(''));
    return round(r, (Big.DP -= 4) + r.e + 1, Big.RM);
  };

  P.times = P.mul = function (y) {
    const x = this;
    const Big = x.constructor;
    const xc = x.c;
    const yc = (y = new Big(y)).c;
    if (!xc[0] || !yc[0]) {
      y.c = [y.e = 0];
      return y;
    }
    y.s = x.s === y.s ? 1 : -1;
    y.e = x.e + y.e;
    let i = yc.length;
    let j = xc.length, z, rl;
    if (j < i) {
      [xc, yc] = [yc, xc];
      rl = i;
      i = j;
      j = rl;
    }
    let result = new Array(j + i);
    for (; j--;) result[j + i] = 0;
    for (i = i--; i--;) {
      for (let carry = 0, k = j + i; --k > i;) {
        z = yc[i] * xc[k - i - 1] + result[k] + carry;
        result[k] = z % 10;
        carry = z / 10 | 0;
      }
      result[i] = carry;
    }
    if (!result[0]) result.shift();
    y.c = result;
    return y;
  };

  P.toExponential = function (dp, rm) {
    const x = this;
    if (dp !== void 0) {
      if (dp !== ~~dp || dp < 0 || dp > DEFAULTS.MAX_DP) throw Error(ERROR_MESSAGES.INVALID_DP);
      x = round(new x.constructor(x), ++dp, rm);
      for (; x.c.length < dp;) x.c.push(0);
    }
    return stringify(x, true, !!x.c[0]);
  };

  P.toFixed = function (dp, rm) {
    const x = this;
    if (dp !== void 0) {
      if (dp !== ~~dp || dp < 0 || dp > DEFAULTS.MAX_DP) throw Error(ERROR_MESSAGES.INVALID_DP);
      x = round(new x.constructor(x), dp + x.e + 1, rm);
      for (dp += x.e + 1; x.c.length < dp;) x.c.push(0);
    }
    return stringify(x, false, !!x.c[0]);
  };

  P.toJSON = P.toString = function () {
    const x = this;
    if (x.constructor.strict === true) throw Error(ERROR_MESSAGES.NAME + 'valueOf disallowed');
    return stringify(x, x.e <= x.constructor.NE || x.e >= x.constructor.PE, !!x.c[0]);
  };

  P.toNumber = function () {
    const n = Number(stringify(this, true, true));
    if (this.constructor.strict === true && !this.eq(n.toString())) {
      throw Error(ERROR_MESSAGES.NAME + 'Imprecise conversion');
    }
    return n;
  };

  P.toPrecision = function (sd, rm) {
    const x = this;
    if (sd !== void 0) {
      if (sd !== ~~sd || sd < 1 || sd > DEFAULTS.MAX_DP) throw Error(ERROR_MESSAGES.INVALID + 'precision');
      x = round(new x.constructor(x), sd, rm);
      for (; x.c.length < sd;) x.c.push(0);
    }
    return stringify(x, sd <= x.e || x.e <= x.constructor.NE || x.e >= x.constructor.PE, !!x.c[0]);
  };

  P.valueOf = function () {
    const x = this;
    if (this.constructor.strict === true) throw Error(ERROR_MESSAGES.NAME + 'valueOf disallowed');
    return stringify(x, x.e <= x.constructor.NE || x.e >= x.constructor.PE, true);
  };

  Big = _Big_();
  Big['default'] = Big.Big = Big;

  // Export
  if (typeof define === 'function' && define.amd) {
    define(() => Big);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;
  } else {
    global.Big = Big;
  }
})(this);
