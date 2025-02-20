(function(root) {
  "use strict";

  const MAX_CYCLE_LEN = 2000; // Maximum search depth for cyclic numbers

  const parsedData = {
    s: 1, // Sign
    n: 0, // Numerator
    d: 1  // Denominator
  };

  function createError(name) {
    function ErrorConstructor() {
      const temp = Error.apply(this, arguments);
      temp.name = this.name = name;
      this.stack = temp.stack;
      this.message = temp.message;
    }

    function Intermediate() {}
    Intermediate.prototype = Error.prototype;
    ErrorConstructor.prototype = new Intermediate();

    return ErrorConstructor;
  }

  const DivisionByZero = createError('DivisionByZero');
  const InvalidParameter = createError('InvalidParameter');

  function assign(number, sign) {
    const num = parseInt(number, 10);
    if (isNaN(num)) throw new InvalidParameter();
    return num * sign;
  }

  function throwInvalidParam() {
    throw new InvalidParameter();
  }

  const parse = function(p1, p2) {
    let n = 0, d = 1, s = 1;
    let v = 0, w = 0, x = 0, y = 1, z = 1;

    const A = 0, B = 1, C = 1, D = 1;
    const N = 10000000;
    let M;

    if (p1 === undefined || p1 === null) return;
    if (p2 !== undefined) {
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
          if (p1 < 0) {
            s = p1;
            p1 = -p1;
          }

          if (p1 % 1 === 0) {
            n = p1;
          } else if (p1 > 0) {
            if (p1 >= 1) {
              z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
              p1 /= z;
            }

            while (B <= N && D <= N) {
              M = (A + C) / (B + D);
              if (p1 === M) {
                n = B + D <= N ? A + C : D > B ? C : A;
                d = B + D <= N ? B + D : D > B ? D : B;
                break;
              } else {
                if (p1 > M) {
                  A += C;
                  B += D;
                } else {
                  C += A;
                  D += B;
                }
                n = B > N ? C : A;
                d = B > N ? D : B;
              }
            }
            n *= z;
          } else if (isNaN(p1) || isNaN(p2)) {
            d = n = NaN;
          }
          break;
        case "string":
          const token = p1.match(/\d+|./g);
          if (token === null) throwInvalidParam();

          if (token[A] === '-') {
            s = -1;
            A++;
          } else if (token[A] === '+') {
            A++;
          }

          if (token.length === A + 1) {
            w = assign(token[A++], s);
          } else if (token[A + 1] === '.' || token[A] === '.') {
            if (token[A] !== '.') {
              v = assign(token[A++], s);
            }
            A++;

            if (A + 1 === token.length || token[A + 1] === '(' && token[A + 3] === ')' || token[A + 1] === "'" && token[A + 3] === "'") {
              w = assign(token[A], s);
              y = Math.pow(10, token[A].length);
              A++;
            }

            if (token[A] === '(' && token[A + 2] === ')' || token[A] === "'" && token[A + 2] === "'") {
              x = assign(token[A + 1], s);
              z = Math.pow(10, token[A + 1].length) - 1;
              A += 3;
            }
          } else if (token[A + 1] === '/' || token[A + 1] === ':') {
            w = assign(token[A], s);
            y = assign(token[A + 2], 1);
            A += 3;
          } else if (token[A + 3] === '/' && token[A + 1] === ' ') {
            v = assign(token[A], s);
            w = assign(token[A + 2], s);
            y = assign(token[A + 4], 1);
            A += 5;
          }

          if (token.length <= A) {
            d = y * z;
            n = x + d * v + z * w;
            break;
          }

        default:
          throwInvalidParam();
      }
    }
    
    if (d === 0) throw new DivisionByZero();

    parsedData.s = s < 0 ? -1 : 1;
    parsedData.n = Math.abs(n);
    parsedData.d = Math.abs(d);
  };

  function modpow(base, exp, mod) {
    let result = 1;
    for (; exp > 0; base = (base * base) % mod, exp >>= 1) {
      if (exp & 1) result = (result * base) % mod;
    }
    return result;
  }

  function cycleLen(n, d) {
    for (; d % 2 === 0; d /= 2);
    for (; d % 5 === 0; d /= 5);

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

    while (true) {
      a %= b;
      if (!a) return b;
      b %= a;
      if (!b) return a;
    }
  }

  function Fraction(a, b) {
    if (!(this instanceof Fraction)) return new Fraction(a, b);

    parse(a, b);

    const gcdVal = Fraction.REDUCE ? gcd(parsedData.d, parsedData.n) : 1;

    this.s = parsedData.s;
    this.n = parsedData.n / gcdVal;
    this.d = parsedData.d / gcdVal;
  }

  Fraction.REDUCE = true;

  Fraction.prototype = {
    s: 1,
    n: 0,
    d: 1,

    abs: function() {
      return new Fraction(this.n, this.d);
    },

    neg: function() {
      return new Fraction(-this.s * this.n, this.d);
    },

    add: function(a, b) {
      parse(a, b);
      return new Fraction(
        this.s * this.n * parsedData.d + parsedData.s * this.d * parsedData.n,
        this.d * parsedData.d
      );
    },

    sub: function(a, b) {
      parse(a, b);
      return new Fraction(
        this.s * this.n * parsedData.d - parsedData.s * this.d * parsedData.n,
        this.d * parsedData.d
      );
    },

    mul: function(a, b) {
      parse(a, b);
      return new Fraction(
        this.s * parsedData.s * this.n * parsedData.n,
        this.d * parsedData.d
      );
    },

    div: function(a, b) {
      parse(a, b);
      return new Fraction(
        this.s * parsedData.s * this.n * parsedData.d,
        this.d * parsedData.n
      );
    },

    clone: function() {
      return new Fraction(this);
    },

    mod: function(a, b) {
      if (isNaN(this.n) || isNaN(this.d)) return new Fraction(NaN);

      if (a === undefined) return new Fraction(this.s * this.n % this.d, 1);

      parse(a, b);
      if (parsedData.n === 0 && this.d === 0) return Fraction(0, 0);

      return new Fraction(
        this.s * (parsedData.d * this.n) % (parsedData.n * this.d),
        parsedData.d * this.d
      );
    },

    gcd: function(a, b) {
      parse(a, b);
      return new Fraction(gcd(parsedData.n, this.n) * gcd(parsedData.d, this.d), parsedData.d * this.d);
    },

    lcm: function(a, b) {
      parse(a, b);

      if (parsedData.n === 0 && this.n === 0) {
        return new Fraction;
      }
      return new Fraction(parsedData.n * this.n, gcd(parsedData.n, this.n) * gcd(parsedData.d, this.d));
    },

    ceil: function(places) {
      places = Math.pow(10, places || 0);

      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.ceil(places * this.s * this.n / this.d), places);
    },

    floor: function(places) {
      places = Math.pow(10, places || 0);

      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.floor(places * this.s * this.n / this.d), places);
    },

    round: function(places) {
      places = Math.pow(10, places || 0);

      if (isNaN(this.n) || isNaN(this.d)) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.round(places * this.s * this.n / this.d), places);
    },

    inverse: function() {
      return new Fraction(this.s * this.d, this.n);
    },

    pow: function(exponent) {
      if (exponent < 0) {
        return new Fraction(Math.pow(this.s * this.d, -exponent), Math.pow(this.n, -exponent));
      } else {
        return new Fraction(Math.pow(this.s * this.n, exponent), Math.pow(this.d, exponent));
      }
    },

    equals: function(a, b) {
      parse(a, b);
      return this.s * this.n * parsedData.d === parsedData.s * parsedData.n * this.d;
    },

    compare: function(a, b) {
      parse(a, b);
      const result = (this.s * this.n * parsedData.d - parsedData.s * parsedData.n * this.d);
      return (0 < result) - (result < 0);
    },

    simplify: function(eps) {
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

    divisible: function(a, b) {
      parse(a, b);
      return !(!(parsedData.n * this.d) || ((this.n * parsedData.d) % (parsedData.n * this.d)));
    },

    valueOf: function() {
      return this.s * this.n / this.d;
    },

    toFraction: function(excludeWhole) {
      let whole;
      let result = "";

      if (this.s < 0) result += '-';

      if (this.d === 1) {
        result += this.n;
      } else {
        if (excludeWhole && (whole = Math.floor(this.n / this.d)) > 0) {
          result += whole + " ";
          this.n %= this.d;
        }
        result += this.n + '/' + this.d;
      }
      return result;
    },

    toLatex: function(excludeWhole) {
      let whole;
      let result = "";

      if (this.s < 0) result += '-';

      if (this.d === 1) {
        result += this.n;
      } else {
        if (excludeWhole && (whole = Math.floor(this.n / this.d)) > 0) {
          result += whole;
          this.n %= this.d;
        }
        result += "\\frac{" + this.n + '}{' + this.d + '}';
      }
      return result;
    },

    toContinued: function() {
      const res = [];
      let t;
      let numerator = this.n;
      let denominator = this.d;

      if (isNaN(numerator) || isNaN(denominator)) return res;

      do {
        res.push(Math.floor(numerator / denominator));
        t = numerator % denominator;
        numerator = denominator;
        denominator = t;
      } while (numerator !== 1);

      return res;
    },

    toString: function(dec) {
      let g;
      let N = this.n;
      let D = this.d;

      if (isNaN(N) || isNaN(D)) return "NaN";

      if (!Fraction.REDUCE) {
        g = gcd(N, D);
        N /= g;
        D /= g;
      }

      dec = dec || 15;
      const cycLen = cycleLen(N, D);
      const cycOff = cycleStart(N, D, cycLen);

      let result = this.s === -1 ? "-" : "";
      result += Math.floor(N / D);
      N %= D;
      N *= 10;

      if (N) result += ".";

      if (cycLen) {
        for (let i = cycOff; i--;) {
          result += Math.floor(N / D);
          N %= D;
          N *= 10;
        }
        result += "(";
        for (let i = cycLen; i--;) {
          result += Math.floor(N / D);
          N %= D;
          N *= 10;
        }
        result += ")";
      } else {
        for (let i = dec; N && i--;) {
          result += Math.floor(N / D);
          N %= D;
          N *= 10;
        }
      }
      return result;
    }
  };

  if (typeof define === "function" && define.amd) {
    define([], function() { return Fraction; });
  } else if (typeof exports === "object") {
    Object.defineProperty(Fraction, "__esModule", { value: true });
    Fraction.default = Fraction;
    Fraction.Fraction = Fraction;
    module.exports = Fraction;
  } else {
    root.Fraction = Fraction;
  }

})(this);
