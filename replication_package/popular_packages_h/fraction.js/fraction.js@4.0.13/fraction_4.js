(function (root) {

  "use strict";

  const MAX_CYCLE_LEN = 2000;

  const P = { s: 1, n: 0, d: 1 };

  function createError(name) {
    function errorConstructor() {
      const temp = Error.apply(this, arguments);
      temp.name = this.name = name;
      this.stack = temp.stack;
      this.message = temp.message;
    }
    function IntermediateInheritor() { }
    IntermediateInheritor.prototype = Error.prototype;
    errorConstructor.prototype = new IntermediateInheritor();
    return errorConstructor;
  }

  const DivisionByZero = createError('DivisionByZero');
  const InvalidParameter = createError('InvalidParameter');

  function assign(n, s) {
    if (isNaN(n = parseInt(n, 10))) throwInvalidParam();
    return n * s;
  }

  function throwInvalidParam() {
    throw new InvalidParameter();
  }

  function parse(p1, p2) {
    let n = 0, d = 1, s = 1;

    if (p1 === undefined || p1 === null) {
      // nothing to do
    } else if (p2 !== undefined) {
      n = p1;
      d = p2;
      s = n * d;
    } else {
      switch (typeof p1) {
        case "object":
          if ("d" in p1 && "n" in p1) {
            n = p1.n;
            d = p1.d;
            if ("s" in p1) n *= p1.s;
          } else if (0 in p1) {
            n = p1[0];
            if (1 in p1) d = p1[1];
          } else {
            throwInvalidParam();
          }
          s = n * d;
          break;

        case "number":
          handleNumber(p1);
          break;

        case "string":
          handleString(p1);
          break;

        default:
          throwInvalidParam();
      }
    }

    if (d === 0) throw new DivisionByZero();

    P.s = s < 0 ? -1 : 1;
    P.n = Math.abs(n);
    P.d = Math.abs(d);

    function handleNumber(p1) {
      if (p1 < 0) {
        s = p1;
        p1 = -p1;
      }

      if (p1 % 1 === 0) {
        n = p1;
      } else {
        const { numerator, denominator, z } = approximateRational(p1);
        n = numerator * z;
        d = denominator;
      }
    }

    function approximateRational(p1) {
      let z = p1 >= 1 ? Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10)) : 1;
      p1 /= z;

      let A = 0, B = 1, C = 1, D = 1;
      const N = 10000000;

      while (B <= N && D <= N) {
        const M = (A + C) / (B + D);
        if (p1 === M) {
          if (B + D <= N) {
            return { numerator: A + C, denominator: B + D, z };
          } else if (D > B) {
            return { numerator: C, denominator: D, z };
          } else {
            return { numerator: A, denominator: B, z };
          }
        } else if (p1 > M) {
          A += C;
          B += D;
        } else {
          C += A;
          D += B;
        }
      }
      return { numerator: A, denominator: B, z };
    }

    function handleString(p1) {
      const tokens = p1.match(/\d+|./g);
      if (tokens === null) throwInvalidParam();
      const { numerator, denominator, multiplier } = parseStringFraction(tokens);
      n = numerator;
      d = denominator;
      s = multiplier;
    }

    function parseStringFraction(B) {
      let A = 0, v = 0, w = 0, y = 1, x = 0, z = 1;

      const startCheck = B[A];
      if (startCheck === '-' || startCheck === '+') {
        A++;
      }

      if (B.length === A + 1) {
        w = assign(B[A++], s);
      } else if (B[A + 1] === '.' || B[A] === '.') {
        if (B[A] !== '.') v = assign(B[A++], s);
        A++;
        if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
          w = assign(B[A], s);
          y = Math.pow(10, B[A].length);
          A++;
        }
        if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
          x = assign(B[A + 1], s);
          z = Math.pow(10, B[A + 1].length) - 1;
          A += 3;
        }
      } else if (B[A + 1] === '/' || B[A + 1] === ':') {
        w = assign(B[A], s);
        y = assign(B[A + 2], 1);
        A += 3;
      } else if (B[A + 3] === '/' && B[A + 1] === ' ') {
        v = assign(B[A], s);
        w = assign(B[A + 2], s);
        y = assign(B[A + 4], 1);
        A += 5;
      }

      if (B.length <= A) {
        d = y * z;
        n = x + d * v + z * w;
        return { numerator: n, denominator: d, multiplier: s };
      }

      throwInvalidParam();
      return null;
    }
  }

  function modpow(b, e, m) {
    let r = 1;
    for (; e > 0; b = (b * b) % m, e >>= 1) {
      if (e & 1) r = (r * b) % m;
    }
    return r;
  }

  function cycleLen(n, d) {
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    if (d === 1) return 0;

    let rem = 10 % d;
    let t = 1;

    for (; rem !== 1; t++) {
      rem = rem * 10 % d;
      if (t > MAX_CYCLE_LEN) return 0;
    }
    return t;
  }

  function cycleStart(n, d, len) {
    let rem1 = 1;
    let rem2 = modpow(10, len, d);

    for (let t = 0; t < 300; t++) {
      if (rem1 === rem2) return t;
      rem1 = rem1 * 10 % d;
      rem2 = rem2 * 10 % d;
    }
    return 0;
  }

  function gcd(a, b) {
    if (!a) return b;
    if (!b) return a;

    while (1) {
      a %= b;
      if (!a) return b;
      b %= a;
      if (!b) return a;
    }
  }

  function Fraction(a, b) {
    if (!(this instanceof Fraction)) {
      return new Fraction(a, b);
    }
    parse(a, b);
    const gcdVal = Fraction.REDUCE ? gcd(P.d, P.n) : 1;

    this.s = P.s;
    this.n = P.n / gcdVal;
    this.d = P.d / gcdVal;
  }

  Fraction.REDUCE = 1;

  Fraction.prototype = {
    "s": 1, "n": 0, "d": 1,
    "abs": function () {
      return new Fraction(this.n, this.d);
    },
    "neg": function () {
      return new Fraction(-this.s * this.n, this.d);
    },
    "add": function (a, b) {
      parse(a, b);
      return new Fraction(this.s * this.n * P.d + P.s * this.d * P.n, this.d * P.d);
    },
    "sub": function (a, b) {
      parse(a, b);
      return new Fraction(this.s * this.n * P.d - P.s * this.d * P.n, this.d * P.d);
    },
    "mul": function (a, b) {
      parse(a, b);
      return new Fraction(this.s * P.s * this.n * P.n, this.d * P.d);
    },
    "div": function (a, b) {
      parse(a, b);
      return new Fraction(this.s * P.s * this.n * P.d, this.d * P.n);
    },
    "clone": function () {
      return new Fraction(this);
    },
    "mod": function (a, b) {
      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      if (a === undefined) {
        return new Fraction(this.s * this.n % this.d, 1);
      }
      parse(a, b);
      return new Fraction(this.s * (P.d * this.n) % (P.n * this.d), P.d * this.d);
    },
    "gcd": function (a, b) {
      parse(a, b);
      return new Fraction(gcd(P.n, this.n) * gcd(P.d, this.d), P.d * this.d);
    },
    "lcm": function (a, b) {
      parse(a, b);
      if (P.n === 0 && this.n === 0) {
        return new Fraction;
      }
      return new Fraction(P.n * this.n, gcd(P.n, this.n) * gcd(P.d, this.d));
    },
    "ceil": function (places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.ceil(places * this.s * this.n / this.d), places);
    },
    "floor": function (places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.floor(places * this.s * this.n / this.d), places);
    },
    "round": function (places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.round(places * this.s * this.n / this.d), places);
    },
    "inverse": function () {
      return new Fraction(this.s * this.d, this.n);
    },
    "pow": function (m) {
      if (m < 0) {
        return new Fraction(Math.pow(this.s * this.d, -m), Math.pow(this.n, -m));
      } else {
        return new Fraction(Math.pow(this.s * this.n, m), Math.pow(this.d, m));
      }
    },
    "equals": function (a, b) {
      parse(a, b);
      return this.s * this.n * P.d === P.s * P.n * this.d;
    },
    "compare": function (a, b) {
      parse(a, b);
      const t = (this.s * this.n * P.d - P.s * P.n * this.d);
      return (0 < t) - (t < 0);
    },
    "simplify": function (eps) {
      if (isNaN(this.n) || isNaN(this.d)) return this;

      const cont = this.abs().toContinued();
      eps = eps || 0.001;

      function rec(a) {
        if (a.length === 1) return new Fraction(a[0]);
        return rec(a.slice(1)).inverse().add(a[0]);
      }

      for (let i = 0; i < cont.length; i++) {
        const tmp = rec(cont.slice(0, i + 1));
        if (tmp.sub(this.abs()).abs().valueOf() < eps) {
          return tmp.mul(this.s);
        }
      }
      return this;
    },
    "divisible": function (a, b) {
      parse(a, b);
      return !(!(P.n * this.d) || ((this.n * P.d) % (P.n * this.d)));
    },
    "valueOf": function () {
      return this.s * this.n / this.d;
    },
    "toFraction": function (excludeWhole) {
      let whole, str = "";
      let n = this.n;
      const d = this.d;
      if (this.s < 0) str += '-';

      if (d === 1) {
        str += n;
      } else {
        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          str += " ";
          n %= d;
        }
        str += `${n}/${d}`;
      }
      return str;
    },
    "toLatex": function (excludeWhole) {
      let whole, str = "";
      let n = this.n;
      const d = this.d;
      if (this.s < 0) str += '-';

      if (d === 1) {
        str += n;
      } else {
        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          n %= d;
        }
        str += `\\frac{${n}}{${d}}`;
      }
      return str;
    },
    "toContinued": function () {
      let a = this.n;
      let b = this.d;
      const res = [];

      if (isNaN(a) || isNaN(b)) {
        return res;
      }

      while (a !== 1) {
        res.push(Math.floor(a / b));
        const t = a % b;
        a = b;
        b = t;
      }

      return res;
    },
    "toString": function (dec) {
      let N = this.n;
      const D = this.d;

      if (isNaN(N) || isNaN(D)) return "NaN";

      const gcdVal = Fraction.REDUCE ? gcd(N, D) : 1;
      N /= gcdVal;
      const str = this.s === -1 ? "-" : "";

      dec = dec || 15;
      const cycLen = cycleLen(N, D);
      const cycOff = cycleStart(N, D, cycLen);

      let result = str + Math.floor(N / D);
      N %= D;
      N *= 10;

      if (N) result += ".";

      if (cycLen) {
        for (let i = cycOff; i--;) result += Math.floor(N / D), N %= D, N *= 10;
        result += "(";
        for (let i = cycLen; i--;) result += Math.floor(N / D), N %= D, N *= 10;
        result += ")";
      } else {
        for (let i = dec; N && i--;) result += Math.floor(N / D), N %= D, N *= 10;
      }
      return result;
    }
  };

  if (typeof define === "function" && define.amd) {
    define([], function () {
      return Fraction;
    });
  } else if (typeof exports === "object") {
    Object.defineProperty(Fraction, "__esModule", { 'value': true });
    Fraction.default = Fraction;
    Fraction.Fraction = Fraction;
    module.exports = Fraction;
  } else {
    root.Fraction = Fraction;
  }

})(this);
