'use strict';

if (typeof BigInt === 'undefined') BigInt = function (n) { if (isNaN(n)) throw new Error(""); return n; };

const C_ONE = BigInt(1);
const C_ZERO = BigInt(0);
const C_TEN = BigInt(10);
const C_TWO = BigInt(2);
const C_FIVE = BigInt(5);
const MAX_CYCLE_LEN = 2000;
const P = { "s": C_ONE, "n": C_ZERO, "d": C_ONE };

function assign(n, s) {
  try { n = BigInt(n); } catch (e) { throw InvalidParameter(); }
  return n * s;
}

function newFraction(n, d) {
  if (d === C_ZERO) throw DivisionByZero();
  const f = Object.create(Fraction.prototype);
  f["s"] = n < C_ZERO ? -C_ONE : C_ONE;
  n = n < C_ZERO ? -n : n;
  const a = gcd(n, d);
  f["n"] = n / a;
  f["d"] = d / a;
  return f;
}

function gcd(a, b) {
  if (!a) return b; if (!b) return a;
  while (1) {
    a %= b; if (!a) return b;
    b %= a; if (!b) return a;
  }
}

function parse(p1, p2) {
  let n = C_ZERO, d = C_ONE, s = C_ONE;
  if (p1 === undefined || p1 === null) { /* void */ } 
  else if (p2 !== undefined) {
    if (typeof p1 === "bigint" && typeof p2 === "bigint") { n = p1; d = p2; s = n * d; } 
    else if (!isNaN(p2) && !isNaN(p1)) {
      if (p1 % 1 !== 0 || p2 % 1 !== 0) throw NonIntegerParameter();
      n = BigInt(p1);
      d = BigInt(p2);
      s = n * d;
    } else throw InvalidParameter();
  } else if (typeof p1 === "object") {
    if ("d" in p1 && "n" in p1) { n = BigInt(p1["n"]); d = BigInt(p1["d"]); if ("s" in p1) n *= BigInt(p1["s"]); } 
    else if (0 in p1) { n = BigInt(p1[0]); if (1 in p1) d = BigInt(p1[1]); } 
    else if (p1 instanceof BigInt) { n = BigInt(p1); } 
    else throw InvalidParameter();
    s = n * d;
  } else if (typeof p1 === "number") {
    if (isNaN(p1)) throw InvalidParameter();
    if (p1 < 0) { s = -C_ONE; p1 = -p1; }
    if (p1 % 1 === 0) { n = BigInt(p1); } 
    else if (p1 > 0) {
      let z = 1;
      let A = 0, B = 1;
      let C = 1, D = 1;
      let N = 10000000;
      if (p1 >= 1) { z = 10 ** Math.floor(1 + Math.log10(p1)); p1 /= z; }
      while (B <= N && D <= N) {
        let M = (A + C) / (B + D);
        if (p1 === M) {
          if (B + D <= N) { n = A + C; d = B + D; }
          else if (D > B) { n = C; d = D; }
          else { n = A; d = B; }
          break;
        } else {
          if (p1 > M) { A += C; B += D; } else { C += A; D += B; }
          if (B > N) { n = C; d = D; } else { n = A; d = B; }
        }
      }
      n = BigInt(n) * BigInt(z);
      d = BigInt(d);
    }
  } else if (typeof p1 === "string") {
    let ndx = 0;
    let v = C_ZERO, w = C_ZERO, x = C_ZERO, y = C_ONE, z = C_ONE;
    let match = p1.match(/\d+|./g);
    if (match === null) throw InvalidParameter();
    if (match[ndx] === '-') { s = -C_ONE; ndx++; } 
    else if (match[ndx] === '+') { ndx++; }
    if (match.length === ndx + 1) { w = assign(match[ndx++], s); } 
    else if (match[ndx + 1] === '.' || match[ndx] === '.') {
      if (match[ndx] !== '.') { v = assign(match[ndx++], s); }
      ndx++;
      if (ndx + 1 === match.length || match[ndx + 1] === '(' && match[ndx + 3] === ')' || match[ndx + 1] === "'" && match[ndx + 3] === "'") {
        w = assign(match[ndx], s);
        y = C_TEN ** BigInt(match[ndx].length);
        ndx++;
      }
      if (match[ndx] === '(' && match[ndx + 2] === ')' || match[ndx] === "'" && match[ndx + 2] === "'") {
        x = assign(match[ndx + 1], s);
        z = C_TEN ** BigInt(match[ndx + 1].length) - C_ONE;
        ndx += 3;
      }
    } else if (match[ndx + 1] === '/' || match[ndx + 1] === ':') {
      w = assign(match[ndx], s);
      y = assign(match[ndx + 2], C_ONE);
      ndx += 3;
    } else if (match[ndx + 3] === '/' && match[ndx + 1] === ' ') {
      v = assign(match[ndx], s);
      w = assign(match[ndx + 2], s);
      y = assign(match[ndx + 4], C_ONE);
      ndx += 5;
    }
    if (match.length <= ndx) { d = y * z; s = /* void */ n = x + d * v + z * w; } 
    else throw InvalidParameter();
  } else if (typeof p1 === "bigint") { n = p1; s = p1; d = C_ONE; } 
  else throw InvalidParameter();

  if (d === C_ZERO) throw DivisionByZero();

  P["s"] = s < C_ZERO ? -C_ONE : C_ONE;
  P["n"] = n < C_ZERO ? -n : n;
  P["d"] = d < C_ZERO ? -d : d;
}

function modpow(b, e, m) {
  let r = C_ONE;
  for (; e > C_ZERO; b = (b * b) % m, e >>= C_ONE) {
    if (e & C_ONE) { r = (r * b) % m; }
  }
  return r;
}

function cycleLen(n, d) {
  for (; d % C_TWO === C_ZERO; d /= C_TWO) {}
  for (; d % C_FIVE === C_ZERO; d /= C_FIVE) {}
  if (d === C_ONE) return C_ZERO;
  let rem = C_TEN % d;
  let t = 1;
  for (; rem !== C_ONE; t++) {
    rem = rem * C_TEN % d;
    if (t > MAX_CYCLE_LEN) return C_ZERO;
  }
  return BigInt(t);
}

function cycleStart(n, d, len) {
  let rem1 = C_ONE;
  let rem2 = modpow(C_TEN, len, d);
  for (let t = 0; t < 300; t++) {
    if (rem1 === rem2) return BigInt(t);
    rem1 = rem1 * C_TEN % d;
    rem2 = rem2 * C_TEN % d;
  }
  return 0;
}

function factorize(num) {
  const factors = {};
  let n = num;
  let i = C_TWO;
  let s = C_FIVE - C_ONE;
  while (s <= n) {
    while (n % i === C_ZERO) {
      n /= i;
      factors[i] = (factors[i] || C_ZERO) + C_ONE;
    }
    s += C_ONE + C_TWO * i++;
  }
  if (n !== num) {
    if (n > 1) factors[n] = (factors[n] || C_ZERO) + C_ONE;
  } else {
    factors[num] = (factors[num] || C_ZERO) + C_ONE;
  }
  return factors;
}

function Fraction(a, b) {
  parse(a, b);
  if (this instanceof Fraction) {
    a = gcd(P["d"], P["n"]);
    this["s"] = P["s"];
    this["n"] = P["n"] / a;
    this["d"] = P["d"] / a;
  } else {
    return newFraction(P['s'] * P['n'], P['d']);
  }
}

var DivisionByZero = function () { return new Error("Division by Zero"); };
var InvalidParameter = function () { return new Error("Invalid argument"); };
var NonIntegerParameter = function () { return new Error("Parameters must be integer"); };

Fraction.prototype = {
  "s": C_ONE, "n": C_ZERO, "d": C_ONE,

  "abs": function () { return newFraction(this["n"], this["d"]); },
  "neg": function () { return newFraction(-this["s"] * this["n"], this["d"]); },
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
  "clone": function () { return newFraction(this['s'] * this['n'], this['d']); },
  "mod": function (a, b) {
    if (a === undefined) { return newFraction(this["s"] * this["n"] % this["d"], C_ONE); }
    parse(a, b);
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
  "inverse": function () { return newFraction(this["s"] * this["d"], this["n"]); },
  "pow": function (a, b) {
    parse(a, b);
    if (P['d'] === C_ONE) {
      if (P['s'] < C_ZERO) {
        return newFraction((this['s'] * this["d"]) ** P['n'], this["n"] ** P['n']);
      } else {
        return newFraction((this['s'] * this["n"]) ** P['n'], this["d"] ** P['n']);
      }
    }
    if (this['s'] < C_ZERO) return null;
    let N = factorize(this['n']), D = factorize(this['d']);
    let n = C_ONE, d = C_ONE;
    for (let k in N) {
      if (k === '1') continue;
      if (k === '0') { n = C_ZERO; break; }
      N[k] *= P['n'];
      if (N[k] % P['d'] === C_ZERO) { N[k] /= P['d']; }
      else return null;
      n *= BigInt(k) ** N[k];
    }
    for (let k in D) {
      if (k === '1') continue;
      D[k] *= P['n'];
      if (D[k] % P['d'] === C_ZERO) { D[k] /= P['d']; }
      else return null;
      d *= BigInt(k) ** D[k];
    }
    if (P['s'] < C_ZERO) return newFraction(d, n);
    return newFraction(n, d);
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
    return newFraction(this["s"] * places * this["n"] / this["d"] +
      (places * this["n"] % this["d"] > C_ZERO && this["s"] >= C_ZERO ? C_ONE : C_ZERO), places);
  },
  "floor": function (places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(this["s"] * places * this["n"] / this["d"] -
      (places * this["n"] % this["d"] > C_ZERO && this["s"] < C_ZERO ? C_ONE : C_ZERO), places);
  },
  "round": function (places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(this["s"] * places * this["n"] / this["d"] +
      this["s"] * ((this["s"] >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (places * this["n"] % this["d"]) > this["d"] ? C_ONE : C_ZERO), places);
  },
  "roundTo": function (a, b) {
    parse(a, b);
    const numerator = this['n'] * P['d'];
    const denominator = this['d'] * P['n'];
    let k = numerator / denominator;
    const remainder = numerator % denominator;
    if (remainder + remainder >= denominator) { k++; }
    return newFraction(this['s'] * k * P['n'], P['d']);
  },
  "divisible": function (a, b) {
    parse(a, b);
    return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
  },
  'valueOf': function () {
    return Number(this["s"] * this["n"]) / Number(this["d"]);
  },
  'toString': function (dec) {
    let N = this["n"];
    let D = this["d"];
    function trunc(x) { return typeof x === 'bigint' ? x : Math.floor(x); }
    dec = dec || 15;
    let cycLen = cycleLen(N, D);
    let cycOff = cycleStart(N, D, cycLen);
    let str = this['s'] < C_ZERO ? "-" : "";
    str += trunc(N / D);
    N %= D;
    N *= C_TEN;
    if (N) str += ".";
    if (cycLen) {
      for (let i = cycOff; i--;) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
      str += "(";
      for (let i = cycLen; i--;) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
      str += ")";
    } else {
      for (let i = dec; N && i--;) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
    }
    return str;
  },
  'toFraction': function (showMixed) {
    let n = this["n"];
    let d = this["d"];
    let str = this['s'] < C_ZERO ? "-" : "";
    if (d === C_ONE) {
      str += n;
    } else {
      let whole = n / d;
      if (showMixed && whole > C_ZERO) {
        str += whole;
        str += " ";
        n %= d;
      }
      str += n;
      str += '/';
      str += d;
    }
    return str;
  },
  'toLatex': function (showMixed) {
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
      str += "\\frac{";
      str += n;
      str += '}{';
      str += d;
      str += '}';
    }
    return str;
  },
  'toContinued': function () {
    let a = this['n'];
    let b = this['d'];
    let res = [];
    do {
      res.push(a / b);
      let t = a % b;
      a = b;
      b = t;
    } while (a !== C_ONE);
    return res;
  },
  "simplify": function (eps) {
    eps = eps || 0.001;
    const thisABS = this['abs']();
    const cont = thisABS['toContinued']();
    for (let i = 1; i < cont.length; i++) {
      let s = newFraction(cont[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) { s = s['inverse']()['add'](cont[k]); }
      if (Math.abs(s['sub'](thisABS).valueOf()) < eps) {
        return s['mul'](this['s']);
      }
    }
    return this;
  }
};

Object.defineProperty(Fraction, "__esModule", { 'value': true });
Fraction['default'] = Fraction;
Fraction['Fraction'] = Fraction;
module['exports'] = Fraction;
