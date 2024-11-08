'use strict';

if (typeof BigInt === 'undefined') BigInt = n => { if (isNaN(n)) throw new Error(""); return n; };

const C_ONE = BigInt(1);
const C_ZERO = BigInt(0);
const C_TEN = BigInt(10);
const C_TWO = BigInt(2);
const C_FIVE = BigInt(5);
const MAX_CYCLE_LEN = 2000;

const P = { "s": C_ONE, "n": C_ZERO, "d": C_ONE };

function assign(n, s) {
  try { return BigInt(n) * s; } 
  catch (e) { throw new Error("Invalid parameter"); }
}

function newFraction(n, d) {
  if (d === C_ZERO) throw new Error("Division by Zero");

  const f = Object.create(Fraction.prototype);
  const sign = n < C_ZERO ? -C_ONE : C_ONE;
  const gcdValue = gcd(n < C_ZERO ? -n : n, d);

  f["s"] = sign;
  f["n"] = (n * sign) / gcdValue;
  f["d"] = d / gcdValue;
  return f;
}

function gcd(a, b) {
  while (b !== C_ZERO) [a, b] = [b, a % b];
  return a;
}

function parse(p1, p2) {
  let n = C_ZERO, d = C_ONE, s = C_ONE;
  const asBigInt = (value) => BigInt(value);

  if (p1 === undefined || p1 === null) { /* no parameter */ }
  else if (p2 !== undefined) {
    if (typeof p1 === "bigint" && typeof p2 === "bigint") {
      [n, d, s] = [p1, p2, n * d];
    } else if (!isNaN(p2) && !isNaN(p1)) {
      if (p1 % 1 !== 0 || p2 % 1 !== 0) throw new Error("Non-Integer Parameter");
      [n, d, s] = [asBigInt(p1), asBigInt(p2), n * d];
    } else throw new Error("Invalid Parameter");
  } else if (typeof p1 === "object") {
    n = asBigInt(0 in p1 ? p1[0] : p1.n);
    d = asBigInt(1 in p1 ? p1[1] : p1.d ?? C_ONE);
    s = n * d;
    if ("s" in p1) n *= asBigInt(p1.s);
  } else if (typeof p1 === "number") {
    handleNumberCase(p1);
  } else if (typeof p1 === "string") {
    handleStringCase(p1);
  } else if (typeof p1 === "bigint") {
    [n, d, s] = [p1, C_ONE, p1];
  } else throw new Error("Invalid Parameter");

  P["s"] = s < C_ZERO ? -C_ONE : C_ONE;
  P["n"] = n < C_ZERO ? -n : n;
  P["d"] = d < C_ZERO ? -d : d;

  function handleNumberCase(num) {
    if (isNaN(num)) throw new Error("Invalid Parameter");
    if (num < 0) { s = -C_ONE; num = -num; }
    if (num % 1 === 0) {
      n = asBigInt(num);
    } else {
      handleDecimalNumber(num);
    }
  }

  function handleDecimalNumber(num) {
    let z = 1, A = 0, B = 1, C = 1, D = 1, N = 10000000;
    if (num >= 1) {
      z = 10 ** Math.floor(1 + Math.log10(num));
      num /= z;
    }
    while (B <= N && D <= N) {
      let M = (A + C) / (B + D);
      if (num === M) {
        n = BigInt(B + D <= N ? A + C : D > B ? C : A);
        d = BigInt(B + D <= N ? B + D : D > B ? D : B);
        break;
      } else if (num > M) [A, B] = [A + C, B + D];
      else [C, D] = [C + A, D + B];
    }
    n = asBigInt(n) * BigInt(z);
    d = asBigInt(d);
  }

  function handleStringCase(str) {
    let match = str.match(/\d+|./g), ndx = 0;
    let v = 0, w = 0, x = 0, y = C_ONE, z = C_ONE;
    if (!match) throw new Error("Invalid Parameter");

    if (match[ndx] === '-' || match[ndx] === '+') s = match[ndx++] === '-' ? -C_ONE : C_ONE;

    if (match.length === ndx + 1) {
      w = assign(match[ndx++], s);
    } else if (isDecimal()) {
      if (match[ndx] !== '.') v = assign(match[ndx++], s);
      ndx++;
      if (isSimpleDecimal()) {
        w = assign(match[ndx], s);
        y = C_TEN ** BigInt(match[ndx].length);
        ndx++;
      }
      if (isRepeating()) {
        x = assign(match[ndx + 1], s);
        z = C_TEN ** BigInt(match[ndx + 1].length) - C_ONE;
        ndx += 3;
      }
    } else if (isFraction()) {
      w = assign(match[ndx], s);
      y = assign(match[ndx + 2], C_ONE);
      ndx += 3;
    } else if (isMixedFraction()) {
      v = assign(match[ndx], s);
      w = assign(match[ndx + 2], s);
      y = assign(match[ndx + 4], C_ONE);
      ndx += 5;
    }

    if (match.length <= ndx) {
      d = y * z;
      n = x + d * v + z * w;
    } else throw new Error("Invalid Parameter");

    function isDecimal() {
      return match[ndx + 1] === '.' || match[ndx] === '.';
    }

    function isSimpleDecimal() {
      return ndx + 1 === match.length || match[ndx + 1] === '(' && match[ndx + 3] === ')' || match[ndx + 1] === "'" && match[ndx + 3] === "'";
    }

    function isRepeating() {
      return match[ndx] === '(' && match[ndx + 2] === ')' || match[ndx] === "'" && match[ndx + 2] === "'";
    }

    function isFraction() {
      return match[ndx + 1] === '/' || match[ndx + 1] === ':';
    }

    function isMixedFraction() {
      return match[ndx + 3] === '/' && match[ndx + 1] === ' ';
    }
  }
}

function Fraction(a, b) {
  parse(a, b);
  const gcdValue = gcd(P["d"], P["n"]);
  if (this instanceof Fraction) {
    this["s"] = P["s"];
    this["n"] = P["n"] / gcdValue;
    this["d"] = P["d"] / gcdValue;
  } else {
    return newFraction(P["s"] * P["n"], P["d"]);
  }
}

Fraction.prototype = {
  "s": C_ONE, "n": C_ZERO, "d": C_ONE,

  "abs": function () {
    return newFraction(this["n"], this["d"]);
  },

  "neg": function () {
    return newFraction(-this["s"] * this["n"], this["d"]);
  },

  "add": function (a, b) {
    parse(a, b);
    return newFraction(this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
  },

  "sub": function (a, b) {
    parse(a, b);
    return newFraction(this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
  },

  "mul": function (a, b) {
    parse(a, b);
    return newFraction(this["s"] * P["s"] * this["n"] * P["n"], this["d"] * P["d"]);
  },

  "div": function (a, b) {
    parse(a, b);
    return newFraction(this["s"] * P["s"] * this["n"] * P["d"], this["d"] * P["n"]);
  },

  "clone": function () {
    return newFraction(this['s'] * this['n'], this['d']);
  },

  "mod": function (a, b) {
    if (a === undefined) return newFraction(this["s"] * this["n"] % this["d"], C_ONE);

    parse(a, b);
    if (P["n"] === C_ZERO && this["d"] === C_ZERO) throw new Error("Division by Zero");

    return newFraction(this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]), P["d"] * this["d"]);
  },

  "gcd": function (a, b) {
    parse(a, b);
    return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
  },

  "lcm": function (a, b) {
    parse(a, b);
    if (P["n"] === C_ZERO && this["n"] === C_ZERO) return newFraction(C_ZERO, C_ONE);
    return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
  },

  "inverse": function () {
    return newFraction(this["s"] * this["d"], this["n"]);
  },

  "pow": function (a, b) {
    parse(a, b);
    if (P['d'] === C_ONE) return newFraction((this['s'] * this["n"]) ** P['n'], this["d"] ** P['n']);

    if (this['s'] < C_ZERO) return null;

    const N = factorize(this['n']);
    const D = factorize(this['d']);
    let n = C_ONE, d = C_ONE;

    for (let k in N) adjustFactors(N, k, () => { n *= BigInt(k) ** N[k]; });
    for (let k in D) adjustFactors(D, k, () => { d *= BigInt(k) ** D[k]; });

    if (P['s'] < C_ZERO) return newFraction(d, n);
    return newFraction(n, d);

    function adjustFactors(factors, k, callback) {
      if (k === '1' || (N[k] *= P['n']) % P['d'] !== C_ZERO) return null;
      N[k] /= P['d'];
      callback();
    }

    function factorize(num) {
      const factors = {};
      let n = num, i = C_TWO;
      while (i * i <= n) {
        while (n % i === C_ZERO) {
          n /= i;
          factors[i] = (factors[i] || C_ZERO) + C_ONE;
        }
        i++;
      }
      if (n > 1) factors[n] = (factors[n] || C_ZERO) + C_ONE;
      return factors;
    }
  },

  "equals": function (a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
  },

  "compare": function (a, b) {
    parse(a, b);
    let t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
    return (C_ZERO < t) - (t < C_ZERO);
  },

  "ceil": function (places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(this["s"] * places * this["n"] / this["d"] + (places * this["n"] % this["d"] > C_ZERO && this["s"] >= C_ZERO ? C_ONE : C_ZERO), places);
  },

  "floor": function (places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(this["s"] * places * this["n"] / this["d"] - (places * this["n"] % this["d"] > C_ZERO && this["s"] < C_ZERO ? C_ONE : C_ZERO), places);
  },

  "round": function (places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(this["s"] * places * this["n"] / this["d"] + this["s"] * ((this["s"] >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (places * this["n"] % this["d"]) > this["d"] ? C_ONE : C_ZERO), places);
  },

  "roundTo": function (a, b) {
    parse(a, b);
    const numerator = this['n'] * P['d'];
    const denominator = this['d'] * P['n'];
    let k = numerator / denominator;
    const remainder = numerator % denominator;
    if (remainder + remainder >= denominator) k++;
    return newFraction(this['s'] * k * P['n'], P['d']);
  },

  "divisible": function (a, b) {
    parse(a, b);
    return !(P["n"] * this["d"]) || !((this["n"] * P["d"]) % (P["n"] * this["d"]));
  },

  "valueOf": function () {
    return Number(this["s"] * this["n"]) / Number(this["d"]);
  },

  "toString": function (dec) {
    let N = this["n"];
    let D = this["d"];
    dec = dec || 15;
    let cycLen = cycleLen(N, D);
    let cycOff = cycleStart(N, D, cycLen);
    let str = this['s'] < C_ZERO ? "-" : "";
    str += Math.floor(N / D);
    N %= D;
    N *= C_TEN;

    if (N) str += ".";

    if (cycLen) {
      for (let i = cycOff; i--; N = (N % D) * C_TEN) str += Math.floor(N / D);
      str += "(";
      for (let i = cycLen; i--; N = (N % D) * C_TEN) str += Math.floor(N / D);
      str += ")";
    } else {
      for (let i = dec; N && i--; N = (N % D) * C_TEN) str += Math.floor(N / D);
    }
    return str;
  },

  "toFraction": function (showMixed) {
    let n = this["n"];
    let d = this["d"];
    let str = this['s'] < C_ZERO ? "-" : "";
    if (d === C_ONE) {
      str += n;
    } else {
      let whole = n / d;
      if (showMixed && whole > C_ZERO) {
        str += whole + " ";
        n %= d;
      }
      str += n + '/' + d;
    }
    return str;
  },

  "toLatex": function (showMixed) {
    let n = this["n"];
    let d = this["d"];
    let str = this['s'] < C_ZERO ? "-" : "";
    if (d === C_ONE) {
      str += n;
    } else {
      let whole = n / d;
      if (showMixed && whole > C_ZERO) {
        str += whole;
        n %= d;
      }
      str += "\\frac{" + n + '}{' + d + '}';
    }
    return str;
  },

  "toContinued": function () {
    let a = this['n'];
    let b = this['d'];
    let res = [];
    do {
      res.push(a / b);
      [a, b] = [b, a % b];
    } while (a !== C_ONE);
    return res;
  },

  "simplify": function (eps) {
    eps = eps || 0.001;
    const thisABS = this['abs']();
    const cont = thisABS['toContinued']();
    for (let i = 1; i < cont.length; i++) {
      let s = newFraction(cont[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) {
        s = s['inverse']()['add'](cont[k]);
      }
      if (Math.abs(s['sub'](thisABS).valueOf()) < eps) {
        return s['mul'](this['s']);
      }
    }
    return this;
  }
};

function cycleLen(n, d) {
  while (d % C_TWO === C_ZERO) d /= C_TWO;
  while (d % C_FIVE === C_ZERO) d /= C_FIVE;
  if (d === C_ONE) return C_ZERO;

  let rem = C_TEN % d, t = 1;
  for (; rem !== C_ONE && t <= MAX_CYCLE_LEN; t++) rem = rem * C_TEN % d;
  return t > MAX_CYCLE_LEN ? C_ZERO : BigInt(t);
}

function cycleStart(n, d, len) {
  let rem1 = C_ONE, rem2 = modpow(C_TEN, len, d);
  for (let t = 0; t < 300; t++) {
    if (rem1 === rem2) return BigInt(t);
    rem1 = rem1 * C_TEN % d;
    rem2 = rem2 * C_TEN % d;
  }
  return 0;
}

function modpow(b, e, m) {
  let r = C_ONE;
  for (; e > C_ZERO; b = (b * b) % m, e >>= C_ONE) {
    if (e & C_ONE) r = (r * b) % m;
  }
  return r;
}

Object.defineProperty(Fraction, "__esModule", { 'value': true });
Fraction['default'] = Fraction;
Fraction['Fraction'] = Fraction;
module['exports'] = Fraction;
