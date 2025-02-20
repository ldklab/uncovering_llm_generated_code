"use strict";

(function(root) {
  const MAX_CYCLE_LEN = 2000;

  const P = { "s": 1, "n": 0, "d": 1 };

  function createError(name) {
    function errorConstructor() {
      const temp = Error.apply(this, arguments);
      temp['name'] = this['name'] = name;
      this['stack'] = temp['stack'];
      this['message'] = temp['message'];
    }
    function IntermediateInheritor() { }
    IntermediateInheritor.prototype = Error.prototype;
    errorConstructor.prototype = new IntermediateInheritor();
    return errorConstructor;
  }

  class DivisionByZero extends createError('DivisionByZero') {}
  class InvalidParameter extends createError('InvalidParameter') {}

  function assign(n, s) {
    if (isNaN(n = parseInt(n, 10))) throw new InvalidParameter();
    return n * s;
  }

  function parse(p1, p2) {
    let n = 0, d = 1, s = 1;
    const B, A = 0, C = 1, D = 1, N = 10000000;

    if (p1 === undefined || p1 === null) return;
    if (p2 !== undefined) {
      n = p1; d = p2; s = n * d;
    } else {
      switch (typeof p1) {
        case "object":
          if ("d" in p1 && "n" in p1) {
            n = p1["n"];
            d = p1["d"];
            if ("s" in p1) n *= p1["s"];
          } else if (0 in p1) {
            n = p1[0];
            if (1 in p1) d = p1[1];
          } else throw new InvalidParameter();
          s = n * d;
          break;
        case "number":
          if (p1 < 0) {
            s = p1; p1 = -p1;
          }
          if (p1 % 1 === 0) n = p1;
          else if (p1 > 0) {
            if (p1 >= 1) {
              let z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
              p1 /= z;
            }
            while (B <= N && D <= N) {
              let M = (A + C) / (B + D);
              if (p1 === M) {
                if (B + D <= N) { n = A + C; d = B + D; }
                else if (D > B) { n = C; d = D; }
                else { n = A; d = B; }
                break;
              }
              if (p1 > M) { A += C; B += D; }
              else { C += A; D += B; }
              n = B > N ? C : A;
              d = B > N ? D : B;
            }
            n *= z;
          } else if (isNaN(p1)) { d = n = NaN; }
          break;
        case "string":
          B = p1.match(/\d+|./g);
          if (B === null) throw new InvalidParameter();
          s = B[A] === '-' ? -1 : 1;
          A = B[A] === '+' || B[A] === '-' ? A + 1 : A;
          if (B.length === A + 1) w = assign(B[A++], s);
          else if (B[A + 1] === '.' || B[A] === '.') {
            v = B[A] !== '.' ? assign(B[A++], s) : 0;
            A++;
            let pattern = B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'";
            if (A + 1 === B.length || pattern) {
              w = assign(B[A], s);
              y = Math.pow(10, B[A].length);
              A++;
            }
            if (pattern) {
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
            break;
          }
        default:
          throw new InvalidParameter();
      }

      if (d === 0) throw new DivisionByZero();

      P["s"] = s < 0 ? -1 : 1;
      P["n"] = Math.abs(n);
      P["d"] = Math.abs(d);
    }
  }

  function modpow(b, e, m) {
    let r = 1;
    while (e > 0) {
      if (e & 1) r = (r * b) % m;
      b = (b * b) % m; e >>= 1;
    }
    return r;
  }

  function cycleLen(n, d) {
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    if (d === 1) return 0;

    let rem = 10 % d, t = 1;
    while (rem !== 1) {
      rem = rem * 10 % d;
      if (t > MAX_CYCLE_LEN) return 0;
      t++;
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

  class Fraction {
    constructor(a, b) {
      if (!(this instanceof Fraction)) return new Fraction(a, b);

      parse(a, b);

      if (Fraction['REDUCE']) a = gcd(P["d"], P["n"]);
      else a = 1;

      this["s"] = P["s"];
      this["n"] = P["n"] / a;
      this["d"] = P["d"] / a;
    }

    abs() { return new Fraction(this["n"], this["d"]); }

    neg() { return new Fraction(-this["s"] * this["n"], this["d"]); }

    add(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    }

    sub(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    }

    mul(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["n"],
        this["d"] * P["d"]
      );
    }

    div(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["d"],
        this["d"] * P["n"]
      );
    }

    clone() { return new Fraction(this); }

    mod(a, b) {
      if (isNaN(this['n']) || isNaN(this['d'])) return new Fraction(NaN);
      if (a === undefined) return new Fraction(this["s"] * this["n"] % this["d"], 1);

      parse(a, b);
      if (0 === P["n"] && 0 === this["d"]) return Fraction(0, 0);
      return new Fraction(
        this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
        P["d"] * this["d"]
      );
    }

    gcd(a, b) {
      parse(a, b);
      return new Fraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
    }

    lcm(a, b) {
      parse(a, b);
      if (P["n"] === 0 && this["n"] === 0) return new Fraction();
      return new Fraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
    }

    ceil(places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this["n"]) || isNaN(this["d"])) return new Fraction(NaN);
      return new Fraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
    }

    floor(places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this["n"]) || isNaN(this["d"])) return new Fraction(NaN);
      return new Fraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
    }

    round(places) {
      places = Math.pow(10, places || 0);
      if (isNaN(this["n"]) || isNaN(this["d"])) return new Fraction(NaN);
      return new Fraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
    }

    inverse() { return new Fraction(this["s"] * this["d"], this["n"]); }

    pow(m) {
      if (m < 0) return new Fraction(Math.pow(this['s'] * this["d"], -m), Math.pow(this["n"], -m));
      else return new Fraction(Math.pow(this['s'] * this["n"], m), Math.pow(this["d"], m));
    }

    equals(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
    }

    compare(a, b) {
      parse(a, b);
      const t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
      return (0 < t) - (t < 0);
    }

    simplify(eps) {
      if (isNaN(this['n']) || isNaN(this['d'])) return this;

      const cont = this['abs']()['toContinued']();

      eps = eps || 0.001;

      const rec = a => {
        if (a.length === 1) return new Fraction(a[0]);
        return rec(a.slice(1))['inverse']()['add'](a[0]);
      };

      for (let i = 0; i < cont.length; i++) {
        const tmp = rec(cont.slice(0, i + 1));
        if (tmp['sub'](this['abs']())['abs']().valueOf() < eps) return tmp['mul'](this['s']);
      }
      return this;
    }

    divisible(a, b) {
      parse(a, b);
      return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
    }

    valueOf() {
      return this["s"] * this["n"] / this["d"];
    }

    toFraction(excludeWhole) {
      let whole, str = "";
      let n = this["n"], d = this["d"];
      if (this["s"] < 0) str += '-';

      if (d === 1) str += n;
      else {
        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole + " ";
          n %= d;
        }

        str += n + '/' + d;
      }
      return str;
    }

    toLatex(excludeWhole) {
      let whole, str = "";
      let n = this["n"], d = this["d"];
      if (this["s"] < 0) str += '-';

      if (d === 1) str += n;
      else {
        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          n %= d;
        }
        str += "\\frac{" + n + '}{' + d + '}';
      }
      return str;
    }

    toContinued() {
      let t;
      let a = this['n'];
      let b = this['d'];
      const res = [];

      if (isNaN(a) || isNaN(b)) return res;

      do {
        res.push(Math.floor(a / b));
        t = a % b;
        a = b;
        b = t;
      } while (a !== 1);

      return res;
    }

    toString(dec) {
      let g;
      let N = this["n"];
      let D = this["d"];

      if (isNaN(N) || isNaN(D)) return "NaN";

      if (!Fraction['REDUCE']) {
        g = gcd(N, D);
        N /= g;
        D /= g;
      }

      dec = dec || 15;

      const cycLen = cycleLen(N, D), cycOff = cycleStart(N, D, cycLen);

      let str = this['s'] === -1 ? "-" : "";

      str += N / D | 0;

      N %= D;
      N *= 10;

      if (N) str += ".";

      if (cycLen) {
        for (let i = cycOff; i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += "(";
        for (let i = cycLen; i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += ")";
      } else {
        for (let i = dec; N && i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
      }
      return str;
    }
  }

  Fraction['REDUCE'] = 1;

  const defineToModule = function() {
    if (typeof define === "function" && define["amd"]) {
      define([], function() { return Fraction; });
    } else if (typeof exports === "object") {
      Object.defineProperty(Fraction, "__esModule", { 'value': true });
      Fraction['default'] = Fraction;
      Fraction['Fraction'] = Fraction;
      module['exports'] = Fraction;
    } else root['Fraction'] = Fraction;
  };

  defineToModule();
})(this);
