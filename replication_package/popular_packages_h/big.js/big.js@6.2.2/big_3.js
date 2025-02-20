(function (GLOBAL) {
  'use strict';
  function createBigConstructor() {
    function Big(n) {
      var instance = this;
      if (!(instance instanceof Big)) return n === undefined ? new Big() : new Big(n);
      if (n instanceof Big) {
        instance.s = n.s;
        instance.e = n.e;
        instance.c = n.c.slice();
      } else {
        if (typeof n !== 'string') {
          if (Big.strict && typeof n !== 'bigint') throw TypeError('Invalid value');
          n = n === 0 && 1 / n < 0 ? '-0' : String(n);
        }
        parseValue(instance, n);
      }
      instance.constructor = Big;
    }

    function parseValue(bigInstance, value) {
      var match = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.exec(value);
      if (!match) throw Error('Invalid number');
      bigInstance.s = value.charAt(0) === '-' ? (value = value.slice(1), -1) : 1;
      var eIndex = value.indexOf('.'), ePosition = eIndex > -1 ? eIndex : value.length, expIndex;
      if ((expIndex = value.search(/e/i)) > 0) {
        if (eIndex < 0) ePosition = expIndex;
        ePosition += +value.slice(expIndex + 1);
        value = value.substring(0, expIndex);
      }
      for (var nl = value.length, i = 0; i < nl && value.charAt(i) === '0';) ++i;
      if (i === nl) bigInstance.c = [bigInstance.e = 0];
      else {
        for (; nl > 0 && value.charAt(--nl) === '0';);
        bigInstance.e = ePosition - i - 1;
        bigInstance.c = [];
        for (ePosition = 0; i <= nl;) bigInstance.c[ePosition++] = +value.charAt(i++);
      }
    }

    function performRounding(bigNumber, precision, roundingMode, moreDigits) {
      var digits = bigNumber.c;
      if (roundingMode === undefined) roundingMode = bigNumber.constructor.RM;
      if (precision < 1) {
        var shouldRoundUp = roundingMode === 3 && (moreDigits || !!digits[0]) || 
          precision === 0 && (roundingMode === 1 && digits[0] >= 5 ||
          roundingMode === 2 && (digits[0] > 5 || digits[0] === 5 && (moreDigits || digits[1] !== void 0)));
        digits.length = 1;
        if (shouldRoundUp) {
          bigNumber.e = bigNumber.e - precision + 1;
          digits[0] = 1;
        } else digits[0] = bigNumber.e = 0;
      } else if (precision < digits.length) {
        moreDigits = roundingMode === 1 && digits[precision] >= 5 ||
          roundingMode === 2 && (digits[precision] > 5 || digits[precision] === 5 &&
          (moreDigits || digits[precision + 1] !== void 0 || digits[precision - 1] & 1)) || 
          roundingMode === 3 && (moreDigits || !!digits[0]);
        digits.length = precision;
        if (moreDigits)
          for (; ++digits[--precision] > 9;) {
            digits[precision] = 0;
            if (precision === 0) {
              ++bigNumber.e;
              digits.unshift(1);
              break;
            }
          }
        for (precision = digits.length; !digits[--precision];) digits.pop();
      }
      return bigNumber;
    }

    function stringifyNumber(bigNumber, useExponential, isNonzero) {
      var e = bigNumber.e, s = bigNumber.c.join(''), n = s.length;
      if (useExponential) {
        s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;
      } else if (e < 0) {
        for (; ++e;) s = '0' + s;
        s = '0.' + s;
      } else if (e > 0) {
        if (++e > n) for (e -= n; e--;) s += '0';
        else if (e < n) s = s.slice(0, e) + '.' + s.slice(e);
      } else if (n > 1) s = s.charAt(0) + '.' + s.slice(1);
      return bigNumber.s < 0 && isNonzero ? '-' + s : s;
    }

    Big.prototype = {
      abs: function () {
        var newBig = new this.constructor(this);
        newBig.s = 1;
        return newBig;
      },

      cmp: function (y) {
        var compareSign, x = this, xc = x.c, yc = (y = new x.constructor(y)).c, 
            i = x.s, j = y.s, k = x.e, l = y.e;
        if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;
        if (i != j) return i;
        compareSign = i < 0;
        if (k != l) return k > l ^ compareSign ? 1 : -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;
        for (i = -1; ++i < j;) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ compareSign ? 1 : -1;
        return k == l ? 0 : k > l ^ compareSign ? 1 : -1;
      },

      div: function (y) {
        var x = this, Big = x.constructor, ai, bl, bt, n, cmp, 
          r, rl, q, qc, qi, p, bz = (y = new Big(y)).c, 
          a = x.c, b = bz.slice(), dp = Big.DP, 
          precision = dp + (q.e = x.e - y.e) + 1;
        if (dp !== ~~dp || dp < 0 || dp > Big.MAX_DP) throw Error('Invalid decimal places');
        if (!b[0]) throw Error('Division by zero');
        if (!a[0]) {
          y.s = x.s == y.s ? 1 : -1;
          y.c = [y.e = 0];
          return y;
        }
        q = y, qc = q.c = [], qi = 0;
        q.s = x.s == y.s ? 1 : -1;
        k = precision < 0 ? 0 : precision;
        bz.unshift(0);
        for (rl = a.slice(0, bl = b.length).length; rl++ < bl;) a.push(0);
        do {
          for (n = 0; n < 10; n++) {
            if (bl != (rl = r.length)) cmp = bl > rl ? 1 : -1;
            else {
              for (ai = -1, cmp = 0; ++ai < bl;) {
                if (b[ai] != r[ai]) {
                  cmp = b[ai] > r[ai] ? 1 : -1;
                  break;
                }
              }
            }
            if (cmp < 0) {
              for (bt = rl == bl ? b : bz; rl;) {
                if (r[--rl] < bt[rl]) {
                  ai = rl;
                  for (; ai && !r[--ai];) r[ai] = 9;
                  --r[ai];
                  r[rl] += 10;
                }
                r[rl] -= bt[rl];
              }
              for (; !r[0];) r.shift();
            } else break;
          }
          qc[qi++] = cmp ? n : ++n;
          if (r[0] && cmp) r[rl] = a[ai++] || 0;
          else r = [a[ai] || 0];
        } while ((++ai < a.length || r[0] !== undefined) && k--);
        if (!qc[0] && qi != 1) {
          qc.shift();
          q.e--;
          p--;
        }
        if (qi > p) performRounding(q, p, Big.RM, r[0] !== undefined);
        return q;
      },

      eq: function (y) { return this.cmp(y) === 0; },
      gt: function (y) { return this.cmp(y) > 0; },
      gte: function (y) { return this.cmp(y) >= 0; },
      lt: function (y) { return this.cmp(y) < 0; },
      lte: function (y) { return this.cmp(y) <= 0; },

      minus: function (y) {
        var x = this, Big = x.constructor, a = x.s, b = (y = new Big(y)).s, 
            yc = y.c, xc = x.c.slice(), xe = x.e, ye = y.e;
        if (a != b) {
          y.s = -b;
          return x.plus(y);
        }
        if (!xc[0] || !yc[0]) return (!yc[0]) ? new Big(x) : y.s = -b, y;
        if (a = xe - ye) {
          a = Math.abs(a);
          var diffC = a < 0 ? yc : xc, compareC = a > 0 ? xc : yc;
          diffC.reverse();
          for (var z = a; z--;) diffC.push(0);
          diffC.reverse();
          if (a < 0) {
            xc = yc;
            yc = diffC;
            y.s = -y.s;
          }
        } else if (compareNumbers(xc, yc) < 0) {
          yc = xc;
          xc = compareC;
          y.s = -y.s;
        }
        for (var k = 0; yc[k] ;) {
          if (xc[k] < yc[k]) {
            for (a = k; !xc[--a];) xc[a] = 9;
            --xc[a];
            xc[k] += 10;
          }
          xc[k] -= yc[k];
          k++;
        }
        while (k--) if (xc[k] === 0) xc.pop();
        if (!xc[0]) {
          xc = [0];
          y.s = 1;
        }
        y.c = xc;
        y.e = ye;
        return y;
      },

      mod: function (y) {
        if (this.gt(y = new this.constructor(y))) throw Error('Division by zero');
        var Big = this.constructor, result = this;
        if (y.eq(result)) return new Big(result);
        var precision = Big.DP, roundMode = Big.RM;
        Big.DP = Big.RM = 0;
        result = result.div(y);
        Big.DP = precision;
        Big.RM = roundMode;
        return this.minus(result.times(y));
      },

      neg: function () {
        var newBig = new this.constructor(this);
        newBig.s = -newBig.s;
        return newBig;
      },

      plus: function (y) {
        var x = this, Big = x.constructor;
        y = new Big(y);
        if (x.s != y.s) {
          y.s = -y.s;
          return x.minus(y);
        }
        var xe = x.e, xc = x.c, ye = y.e, yc = y.c;
        if (!xc[0] || !yc[0]) return !xc[0] ? new Big(y) : new Big(x);
        if ((e = xe - ye)) {
          if (e > 0) ye = xe;
          else e = -e;
          var diffArray = e > 0 ? yc : xc;
          diffArray.reverse();
          for (; e--;) diffArray.push(0);
          diffArray.reverse();
        }
        xc = (xc.length < yc.length ? (yc.push(0), yc) : (xc.push(0), xc)).slice();
        for (var carry = 0, i = yc.length - 1; i >= 0; i--) {
          xc[i] = (xc[i] || 0) + yc[i] + carry;
          carry = xc[i] / 10 | 0;
          xc[i] %= 10;
        }
        if (carry) {
          xc.unshift(carry);
          ye++;
        }
        for (i = xc.length; xc[--i] === 0;) xc.pop();
        y.c = xc;
        y.e = ye;
        return y;
      },

      pow: function (n) {
        if (n !== ~~n || n < -this.constructor.MAX_POWER || n > this.constructor.MAX_POWER) throw Error('Invalid exponent');
        var x = this, tmp = new x.constructor('1'), isNeg = n < 0;
        if (isNeg) n = -n;
        for (; ;) {
          if (n & 1) tmp = tmp.times(x);
          n >>= 1;
          if (!n) break;
          x = x.times(x);
        }
        return isNeg ? new this.constructor('1').div(tmp) : tmp;
      },

      prec: function (sd, rm) {
        if (sd !== ~~sd || sd < 1 || sd > this.constructor.MAX_DP) throw Error('Invalid precision');
        return performRounding(new this.constructor(this), sd, rm);
      },

      round: function (dp, rm) {
        if (dp === undefined) dp = 0;
        else if (dp !== ~~dp || dp < -this.constructor.MAX_DP || dp > this.constructor.MAX_DP) throw Error('Invalid decimal places');
        return performRounding(new this.constructor(this), dp + this.e + 1, rm);
      },

      sqrt: function () {
        if (this.s < 0) throw Error('No square root');
        var Big = this.constructor, root = this, half = new Big('0.5'), trial = Math.sqrt(+stringifyNumber(this, true, true));
        trial = trial === 0 || trial === 1 / 0 ? ((exp = this.c.join(''), !(exp.length + this.e & 1) && (exp += '0'), trial = Math.sqrt(exp), e = ((this.e + 1)/2 | 0) - (this.e < 0 || this.e & 1), new Big((trial == 1/0 ? '5e' : (trial = trial.toExponential()).slice(0, trial.indexOf('e') + 1)) + e))) : new Big(trial + '');
        e = trial.e + (Big.DP += 4);
        do root = root.times(half.times(root.plus(this.div(root))));
        while (root.c.slice(0, e).join('') !== trial.c.slice(0, e).join(''));
        return performRounding(root, (Big.DP -= 4) + root.e + 1, Big.RM);
      },

      times: function (y) {
        var Big = this.constructor, prod = this, result = x = y.c, 
          a = this.c, b = (y = new Big(y)).c, ai, bj, carry;
        y.s = this.s == y.s ? 1 : -1;
        if (!a[0] || !b[0]) { y.c = [y.e = 0]; return y; }
        y.e = this.e + y.e;
        var prev = (result.length < b.length ? (a = b, b = result) : (result = []));
        for (ai = b.length; ai--; result.unshift(0));
        for (; ai--;) carry = 0, for (bj = a.length + i - 1; bj > i; ) carry = (result[bj] += b[ai] * a[bj - ai - 1] + carry) / 10 | 0, result[bj--] %= 10;
        if (carry) ++prod.e;
        else result.shift();
        for (ai = result.length; !result[--ai];) result.pop();
        return y;
      },

      toExponential: function (dp, rm) {
        var x = this, n = x.c[0];
        if (dp !== undefined) {
          if (dp !== ~~dp || dp < 0 || dp > this.constructor.MAX_DP) throw Error('Invalid decimal places');
          x = performRounding(new x.constructor(x), ++dp, rm);
          for (; x.c.length < dp;) x.c.push(0);
        }
        return stringifyNumber(x, true, !!n);
      },

      toFixed: function (dp, rm) {
        var x = this, n = x.c[0];
        if (dp !== undefined) {
          if (dp !== ~~dp || dp < 0 || dp > this.constructor.MAX_DP) throw Error('Invalid decimal places');
          x = performRounding(new x.constructor(x), dp + x.e + 1, rm);
          for (dp = dp + x.e + 1; x.c.length < dp;) x.c.push(0);
        }
        return stringifyNumber(x, false, !!n);
      },

      toJSON: function () { return this.toString(); },

      toNumber: function () {
        var n = +stringifyNumber(this, true, true);
        if (this.constructor.strict && !this.eq(n.toString())) throw Error('Imprecise conversion');
        return n;
      },

      toPrecision: function (sd, rm) {
        var x = this, n = x.c[0], Big = x.constructor;
        if (sd !== undefined) {
          if (sd !== ~~sd || sd < 1 || sd > Big.MAX_DP) throw Error('Invalid precision');
          x = performRounding(new Big(x), sd, rm);
          for (; x.c.length < sd;) x.c.push(0);
        }
        return stringifyNumber(x, sd <= x.e || x.e <= Big.NE || x.e >= Big.PE, !!n);
      },

      toString: function () {
        var x = this, Big = x.constructor;
        return stringifyNumber(x, x.e <= Big.NE || x.e >= Big.PE, !!x.c[0]);
      },

      valueOf: function () {
        var x = this, Big = x.constructor;
        if (Big.strict) throw Error('valueOf disallowed');
        return stringifyNumber(x, x.e <= Big.NE || x.e >= Big.PE, true);
      }
    };

    Big.DP = 20;
    Big.RM = 1;
    Big.MAX_DP = 1E6;
    Big.MAX_POWER = 1E6;
    Big.NE = -7;
    Big.PE = 21;
    Big.strict = false;

    return Big;
  }

  var Big = createBigConstructor();
  if (typeof define === 'function' && define.amd) {
    define(function () { return Big; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;
  } else {
    GLOBAL.Big = Big;
  }
})(this);
