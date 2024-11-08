(function(root) {
  "use strict";

  const MAX_CYCLE_LEN = 2000; // Limit for detecting repeating decimals
  let P = { "s": 1, "n": 0, "d": 1 }; // Parsed data structure

  function createError(name) {
    function errorConstructor() {
      const temp = Error.apply(this, arguments);
      temp['name'] = this['name'] = name;
      this['stack'] = temp['stack'];
      this['message'] = temp['message'];
    }
    function IntermediateInheritor() {}
    IntermediateInheritor.prototype = Error.prototype;
    errorConstructor.prototype = new IntermediateInheritor();
    return errorConstructor;
  }

  const DivisionByZero = createError('DivisionByZero');
  const InvalidParameter = createError('InvalidParameter');

  function parse(p1, p2) {
    let n = 0, d = 1, s = 1;
    let A = 0, B = 1;
    let C = 1, D = 1;
    let N = 10000000;
    let z = 1;

    if (p1 !== undefined && p1 !== null) {
      if (p2 !== undefined) {
        n = p1; d = p2; s = n * d;
      } else if (typeof p1 === "object") {
        if ("d" in p1 && "n" in p1) {
          n = p1["n"]; d = p1["d"]; if ("s" in p1) n *= p1["s"];
        } else if (0 in p1) {
          n = p1[0]; if (1 in p1) d = p1[1];
        } else {
          throw new InvalidParameter();
        }
        s = n * d;
      } else if (typeof p1 === "number") {
        if (p1 < 0) { s = p1; p1 = -p1; }
        if (p1 % 1 !== 0) {
          if (p1 >= 1) { z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10)); p1 /= z; }
          while (B <= N && D <= N) {
            let M = (A + C) / (B + D);
            if (p1 === M) {
              if (B + D <= N) { n = A + C; d = B + D; } 
              else if (D > B) { n = C; d = D; } 
              else { n = A; d = B; }
              break;
            } else if (p1 > M) { A += C; B += D; }
            else { C += A; D += B; }
          }
          n *= z;
        } else {
          n = p1;
        }
      } else if (typeof p1 === "string") {
        let B = p1.match(/\d+|./g);
        if (B === null) throw new InvalidParameter();
        if (B[A] === '-') { s = -1; A++; } else if (B[A] === '+') { A++; }
        if (B.length === A + 1) {
          n = parseInt(B[A++], 10) * s;
        } else if (B[A + 1] === '.' || B[A] === '.') {
          if (B[A] !== '.') { n = parseInt(B[A++], 10) * s; }
          A++;
          if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
            n = parseInt(B[A], 10) * s;
            d = Math.pow(10, B[A].length);
            A++;
          }
          if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
            let x = parseInt(B[A + 1], 10) * s;
            z = Math.pow(10, B[A + 1].length) - 1;
            n *= z;
            A += 3;
          }
        } else if (B[A + 1] === '/' || B[A + 1] === ':') {
          n = parseInt(B[A], 10) * s;
          d = parseInt(B[A + 2], 1);
          A += 3;
        }
      }
    }

    if (d === 0) throw new DivisionByZero();
    P["s"] = s < 0 ? -1 : 1;
    P["n"] = Math.abs(n);
    P["d"] = Math.abs(d);
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
    if (!(this instanceof Fraction)) return new Fraction(a, b);
    parse(a, b);
    const gcdResult = gcd(P["d"], P["n"]);
    this["s"] = P["s"];
    this["n"] = P["n"] / gcdResult;
    this["d"] = P["d"] / gcdResult;
  }

  Fraction.prototype = {
    "abs": function() { return new Fraction(this["n"], this["d"]); },
    "neg": function() { return new Fraction(-this["s"] * this["n"], this["d"]); },
    "add": function(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },
    "sub": function(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },
    "mul": function(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["n"],
        this["d"] * P["d"]
      );
    },
    "div": function(a, b) {
      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["d"],
        this["d"] * P["n"]
      );
    },
    "clone": function() { return new Fraction(this); },
    "valueOf": function() { return this["s"] * this["n"] / this["d"]; },
    "toString": function() {
      if (isNaN(this["n"]) || isNaN(this["d"])) return "NaN";
      let result = this["s"] === -1 ? "-" : "";
      result += this["n"] / this["d"] | 0;
      let N = this["n"] % this["d"] * 10;
      if (N) result += ".";
      const cycLen = 0; // Assume not cyclic for simplicity
      for (let i = 0; N && i < 15; i++) {
        result += N / this["d"] | 0;
        N %= this["d"];
        N *= 10;
      }
      return result;
    }
  };

  if (typeof exports === "object") {
    module.exports = Fraction;
  } else {
    root['Fraction'] = Fraction;
  }

})(this);
