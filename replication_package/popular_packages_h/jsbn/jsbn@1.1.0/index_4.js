(function() {
  // Simple and efficient helper for large integer arithmetic operations, useful for RSA encryption.

  let dbits;

  const canary = 0xdeadbeefcafe;
  const j_lm = ((canary & 0xffffff) == 0xefcafe);

  function BigInteger(a, b, c) {
    if (a != null) {
      if (typeof a === "number") {
        this.fromNumber(a, b, c);
      } else if (b == null && typeof a === "string") {
        this.fromString(a, 256);
      } else {
        this.fromString(a, b);
      }
    }
  }

  function nbi() {
    return new BigInteger(null);
  }

  function am1(i, x, w, j, c, n) {
    while (--n >= 0) {
      const v = x * this[i++] + w[j] + c;
      c = Math.floor(v / 0x4000000);
      w[j++] = v & 0x3ffffff;
    }
    return c;
  }

  function am2(i, x, w, j, c, n) {
    const xl = x & 0x7fff,
      xh = x >> 15;

    while (--n >= 0) {
      let l = this[i] & 0x7fff;
      let h = this[i++] >> 15;
      let m = xh * l + h * xl;
      l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
      c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
      w[j++] = l & 0x3fffffff;
    }
    return c;
  }

  function am3(i, x, w, j, c, n) {
    const xl = x & 0x3fff,
      xh = x >> 14;

    while (--n >= 0) {
      let l = this[i] & 0x3fff;
      let h = this[i++] >> 14;
      let m = xh * l + h * xl;
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
      c = (l >> 28) + (m >> 14) + xh * h;
      w[j++] = l & 0xfffffff;
    }
    return c;
  }

  const inBrowser = typeof navigator !== "undefined";
  if (inBrowser && j_lm && navigator.appName === "Microsoft Internet Explorer") {
    BigInteger.prototype.am = am2;
    dbits = 30;
  } else if (inBrowser && j_lm && navigator.appName !== "Netscape") {
    BigInteger.prototype.am = am1;
    dbits = 26;
  } else {
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1 << dbits) - 1);
  BigInteger.prototype.DV = (1 << dbits);

  const BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2, BI_FP);
  BigInteger.prototype.F1 = BI_FP - dbits;
  BigInteger.prototype.F2 = 2 * dbits - BI_FP;

  const BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  const BI_RC = new Array();
  let rr,
    vv;
  rr = "0".charCodeAt(0);
  for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) {
    return BI_RM.charAt(n);
  }

  function intAt(s, i) {
    const c = BI_RC[s.charCodeAt(i)];
    return c == null ? -1 : c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for (let i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = x < 0 ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + this.DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) {
    const r = nbi();
    r.fromInt(i);
    return r;
  }

  // (protected) set from string and radix
  function bnpFromString(s, b) {
    let k;
    if (b === 16) k = 4;
    else if (b === 8) k = 3;
    else if (b === 256) k = 8; // byte array
    else if (b === 2) k = 1;
    else if (b === 32) k = 5;
    else if (b === 4) k = 2;
    else {
      this.fromRadix(s, b);
      return;
    }
    this.t = 0;
    this.s = 0;
    let i = s.length,
      mi = false,
      sh = 0;
    while (--i >= 0) {
      const x = k === 8 ? s[i] & 0xff : intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) === "-") mi = true;
        continue;
      }
      mi = false;
      if (sh === 0) this[this.t++] = x;
      else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
        this[this.t++] = x >> (this.DB - sh);
      } else {
        this[this.t - 1] |= x << sh;
      }
      sh += k;
      if (sh >= this.DB) sh -= this.DB;
    }
    if (k === 8 && (s[0] & 0x80) !== 0) {
      this.s = -1;
      if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    const c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] === c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if (this.s < 0) return "-" + this.negate().toString(b);
    let k;
    if (b === 16) k = 4;
    else if (b === 8) k = 3;
    else if (b === 2) k = 1;
    else if (b === 32) k = 5;
    else if (b === 4) k = 2;
    else return this.toRadix(b);
    const km = (1 << k) - 1,
      m = false,
      r = [],
      i = this.t;
    let p = this.DB - ((i * this.DB) % k);
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) {
        m = true;
        r.unshift(int2char(d));
      }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p);
          d |= this[--i] >> (p += this.DB - k);
        } else {
          d = (this[i] >> (p -= k)) & km;
          if (p <= 0) {
            p += this.DB;
            --i;
          }
        }
        if (d > 0) m = true;
        if (m) r.unshift(int2char(d));
      }
    }
    return m ? r.join("") : "0";
  }

  // (public) -this
  function bnNegate() {
    const r = nbi();
    BigInteger.ZERO.subTo(this, r);
    return r;
  }

  // (public) |this|
  function bnAbs() {
    return this.s < 0 ? this.negate() : this;
  }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    let r = this.s - a.s;
    if (r !== 0) return r;
    let i = this.t;
    r = i - a.t;
    if (r !== 0) return this.s < 0 ? -r : r;
    while (--i >= 0) if ((r = this[i] - a[i]) !== 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    let r = 1,
      t;
    if ((t = x >>> 16) !== 0) {
      x = t;
      r += 16;
    }
    if ((t = x >> 8) !== 0) {
      x = t;
      r += 8;
    }
    if ((t = x >> 4) !== 0) {
      x = t;
      r += 4;
    }
    if ((t = x >> 2) !== 0) {
      x = t;
      r += 2;
    }
    if ((t = x >> 1) !== 0) {
      x = t;
      r += 1;
    }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n, r) {
    let i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n, r) {
    for (let i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n, r) {
    const bs = n % this.DB;
    const cbs = this.DB - bs;
    const bm = (1 << cbs) - 1;
    const ds = Math.floor(n / this.DB),
      c = (this.s << bs) & this.DM,
      i;
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c;
      c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n, r) {
    r.s = this.s;
    const ds = Math.floor(n / this.DB);
    if (ds >= this.t) {
      r.t = 0;
      return;
    }
    const bs = n % this.DB;
    const cbs = this.DB - bs;
    const bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (let i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs;
      r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a, r) {
    let i = 0,
      c = 0,
      m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] - a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c -= a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    } else {
      c += this.s;
      while (i < a.t) {
        c -= a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = c < 0 ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a, r) {
    const x = this.abs(),
      y = a.abs();
    let i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    const x = this.abs();
    let i = r.t = 2 * x.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
      const c = x.am(i, x[i], r, 2 * i, 0, 1);
      if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
        r[i + x.t] -= x.DV;
        r[i + x.t + 1] = 1;
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m, q, r) {
    const pm = m.abs();
    if (pm.t <= 0) return;
    const pt = this.abs();
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0);
      if (r != null) this.copyTo(r);
      return;
    }
    if (r == null) r = nbi();
    const y = nbi(),
      ts = this.s,
      ms = m.s;
    let nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
    if (nsh > 0) {
      pm.lShiftTo(nsh, y);
      pt.lShiftTo(nsh, r);
    } else {
      pm.copyTo(y);
      pt.copyTo(r);
    }
    const ys = y.t;
    const y0 = y[ys - 1];
    if (y0 == 0) return;
    const yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
    const d1 = this.FV / yt,
      d2 = (1 << this.F1) / yt,
      e = 1 << this.F2;
    let i = r.t,
      j = i - ys,
      t = q == null ? nbi() : q;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y);
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
      const qd = r[--i] == y0 ? this.DM : Math.floor((r[i] * d1 + (r[i - 1] + e) * d2));
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
        y.dlShiftTo(j, t);
        r.subTo(t, r);
        while (r[i] < --qd) r.subTo(t, r);
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q);
      if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r);
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
  }

  // (public) this mod a
  function bnMod(a) {
    const r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
  }

  function Classic(m) {
    this.m = m;
  }

  Classic.prototype.convert = function(cConvert(x) {
    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  });

  Classic.prototype.revert = function(cRevert(x) {
    return x;
  });

  Classic.prototype.reduce = function(cReduce(x) {
    x.divRemTo(this.m, null, x);
});

  Classic.prototype.mulTo = function(cMulTo(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
  });

  Classic.prototype.sqrTo = function(cSqrTo(x, r) {
    x.squareTo(r);
    this.reduce(r);
  });

  function bnpInvDigit() {
    if (this.t < 1) return 0;
    const x = this[0];
    if ((x & 1) === 0) return 0;
    let y = x & 3; // y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
    y = (y * (2 - ((x & 0xffff) * y) & 0xffff)) & 0xffff; // y == 1/x mod 2^16
    y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
    return y > 0 ? this.DV - y : -y;
  }

  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (m.DB - 15)) - 1;
    this.mt2 = 2 * m.t;
  }

  Montgomery.prototype.convert = function(x) {
    const r = nbi();
    x.abs().dlShiftTo(this.m.t, r);
    r.divRemTo(this.m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
    return r;
  };

  Montgomery.prototype.revert = function(x) {
    const r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  };

  Montgomery.prototype.reduce = function(x) {
    while (x.t <= this.mt2) x[x.t++] = 0;
    for (let i = 0; i < this.m.t; ++i) {
      const j = x[i] & 0x7fff;
      const u0 = ((j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM);
      const j = i + this.m.t;
      x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
      while (x[j] >= x.DV) {
        x[j] -= x.DV;
        x[++j]++;
      }
    }
    x.clamp();
    x.drShiftTo(this.m.t, x);
    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  };

  Montgomery.prototype.mulTo = function(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
  };

  Montgomery.prototype.sqrTo = function(x, r) {
    x.squareTo(r);
    this.reduce(r);
  };

  function bnpIsEven() {
    return ((this.t > 0 ? (this[0] & 1) : this.s) === 0);
  }

  function bnpExp(e, z) {
    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
    const r = nbi(),
      r2 = nbi(),
      g = z.convert(this),
      i = nbits(e) - 1;
    g.copyTo(r);
    while (--i >= 0) {
      z.sqrTo(r, r2);
      if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
      else {
        const t = r;
        r = r2;
        r2 = t;
      }
    }
    return z.revert(r);
  }

  function bnModPowInt(e, m) {
    const z = e < 256 || m.isEven() ? new Classic(m) : new Montgomery(m);
    return this.exp(e, z);
  }

  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  function bnClone() {
    const r = nbi();
    this.copyTo(r);
    return r;
  }

  function bnIntValue() {
    if (this.s < 0) {
      if (this.t == 1) return this[0] - this.DV;
      else if (this.t == 0) return -1;
    } else if (this.t == 1) return this[0];
    else if (this.t == 0) return 0;
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
  }

  function bnByteValue() {
    return this.t === 0 ? this.s : (this[0] << 24) >> 24;
  }

  function bnShortValue() {
    return this.t === 0 ? this.s : (this[0] << 16) >> 16;
  }

  function bnpChunkSize(r) {
    return Math.floor(Math.LN2 * this.DB / Math.log(r));
  }

  function bnSigNum() {
    if (this.s < 0) return -1;
    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  function bnpToRadix(b) {
    if (b == null) b = 10;
    if (this.signum() === 0 || b < 2 || b > 36) return "0";
    const cs = this.chunkSize(b);
    const a = Math.pow(b, cs);
    const d = nbv(a),
      y = nbi(),
      z = nbi();
    let r = "";
    this.divRemTo(d, y, z);
    while (y.signum() > 0) {
      r = (a + z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d, y, z);
    }
    return z.intValue().toString(b) + r;
  }

  function bnpFromRadix(s, b) {
    this.fromInt(0);
    if (b == null) b = 10;
    const cs = this.chunkSize(b);
    const d = Math.pow(b, cs);
    let mi = false;
    let j = 0,
      w = 0;
    for (let i = 0; i < s.length; ++i) {
      const x = intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) === "-" && this.signum() === 0) mi = true;
        continue;
      }
      w = b * w + x;
      if (++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w, 0);
        j = 0;
        w = 0;
      }
    }
    if (j > 0) {
      this.dMultiply(Math.pow(b, j));
      this.dAddOffset(w, 0);
    }
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  function bnpFromNumber(a, b, c) {
    if (typeof b === "number") {
      if (a < 2) this.fromInt(1);
      else {
        this.fromNumber(a, c);
        if (!this.testBit(a - 1)) this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
        if (this.isEven()) this.dAddOffset(1, 0);
        while (!this.isProbablePrime(b)) {
          this.dAddOffset(2, 0);
          if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
        }
      }
    } else {
      const x = new Array(),
        t = a & 7;
      x.length = (a >> 3) + 1;
      b.nextBytes(x);
      if (t > 0) x[0] &= (1 << t) - 1;
      else x[0] = 0;
      this.fromString(x, 256);
    }
  }

  function bnToByteArray() {
    let i = this.t,
      r = new Array();
    r[0] = this.s;
    const p = this.DB - ((i * this.DB) % 8);
    let d,
      k = 0;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) !== (this.s & this.DM) >> p) r[k++] = d | (this.s << (this.DB - p));
      while (i >= 0) {
        if (p < 8) {
          d = (this[i] & ((1 << p) - 1)) << (8 - p);
          d |= this[--i] >> (p += this.DB - 8);
        } else {
          d = (this[i] >> (p -= 8)) & 0xff;
          if (p <= 0) {
            p += this.DB;
            --i;
          }
        }
        if ((d & 0x80) !== 0) d |= -256;
        if (k === 0 && (this.s & 0x80) !== (d & 0x80)) ++k;
        if (k > 0 || d !== this.s) r[k++] = d;
      }
    }
    return r;
  }

  function bnEquals(a) {
    return this.compareTo(a) === 0;
  }

  function bnMin(a) {
    return this.compareTo(a) < 0 ? this : a;
  }

  function bnMax(a) {
    return this.compareTo(a) > 0 ? this : a;
  }

  function bnpBitwiseTo(a, op, r) {
    let i,
      f,
      m = Math.min(a.t, this.t);
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
    if (a.t < this.t) {
      f = a.s & this.DM;
      for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
      r.t = this.t;
    } else {
      f = this.s & this.DM;
      for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
      r.t = a.t;
    }
    r.s = op(this.s, a.s);
    r.clamp();
  }

  function op_and(x, y) {
    return x & y;
  }

  function bnAnd(a) {
    const r = nbi();
    this.bitwiseTo(a, op_and, r);
    return r;
  }

  function op_or(x, y) {
    return x | y;
  }

  function bnOr(a) {
    const r = nbi();
    this.bitwiseTo(a, op_or, r);
    return r;
  }

  function op_xor(x, y) {
    return x ^ y;
  }

  function bnXor(a) {
    const r = nbi();
    this.bitwiseTo(a, op_xor, r);
    return r;
  }

  function op_andnot(x, y) {
    return x & ~y;
  }

  function bnAndNot(a) {
    const r = nbi();
    this.bitwiseTo(a, op_andnot, r);
    return r;
  }

  function bnNot() {
    const r = nbi();
    for (let i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
    r.t = this.t;
    r.s = ~this.s;
    return r;
  }

  function bnShiftLeft(n) {
    const r = nbi();
    if (n < 0) this.rShiftTo(-n, r);
    else this.lShiftTo(n, r);
    return r;
  }

  function bnShiftRight(n) {
    const r = nbi();
    if (n < 0) this.lShiftTo(-n, r);
    else this.rShiftTo(n, r);
    return r;
  }

  function lbit(x) {
    if (x == 0) return -1;
    let r = 0;
    if ((x & 0xffff) == 0) {
      x >>= 16;
      r += 16;
    }
    if ((x & 0xff) == 0) {
      x >>= 8;
      r += 8;
    }
    if ((x & 0xf) == 0) {
      x >>= 4;
      r += 4;
    }
    if ((x & 3) == 0) {
      x >>= 2;
      r += 2;
    }
    if ((x & 1) == 0) ++r;
    return r;
  }

  function bnGetLowestSetBit() {
    for (let i = 0; i < this.t; ++i)
      if (this[i] != 0) return i * this.DB + lbit(this[i]);
    if (this.s < 0) return this.t * this.DB;
    return -1;
  }

  function cbit(x) {
    let r = 0;
    while (x != 0) {
      x &= x - 1;
      ++r;
    }
    return r;
  }

  function bnBitCount() {
    let r = 0,
      x = this.s & this.DM;
    for (let i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
    return r;
  }

  function bnTestBit(n) {
    const j = Math.floor(n / this.DB);
    if (j >= this.t) return this.s != 0;
    return (this[j] & (1 << (n % this.DB))) != 0;
  }

  function bnpChangeBit(n, op) {
    const r = BigInteger.ONE.shiftLeft(n);
    this.bitwiseTo(r, op, r);
    return r;
  }

  function bnSetBit(n) {
    return this.changeBit(n, op_or);
  }

  function bnClearBit(n) {
    return this.changeBit(n, op_andnot);
  }

  function bnFlipBit(n) {
    return this.changeBit(n, op_xor);
  }

  function bnpAddTo(a, r) {
    let i = 0,
      c = 0,
      m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] + a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c += a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    } else {
      c += this.s;
      while (i < a.t) {
        c += a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = c < 0 ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
  }

  function bnAdd(a) {
    const r = nbi();
    this.addTo(a, r);
    return r;
  }

  function bnSubtract(a) {
    const r = nbi();
    this.subTo(a, r);
    return r;
  }

  function bnMultiply(a) {
    const r = nbi();
    this.multiplyTo(a, r);
    return r;
  }

  function bnSquare() {
    const r = nbi();
    this.squareTo(r);
    return r;
  }

  function bnDivide(a) {
    const r = nbi();
    this.divRemTo(a, r, null);
    return r;
  }

  function bnRemainder(a) {
    const r = nbi();
    this.divRemTo(a, null, r);
    return r;
  }

  function bnDivideAndRemainder(a) {
    const q = nbi(),
      r = nbi();
    this.divRemTo(a, q, r);
    return [q, r];
  }

  function bnpDMultiply(n) {
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp();
  }

  function bnpDAddOffset(n, w) {
    if (n === 0) return;
    while (this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while (this[w] >= this.DV) {
      this[w] -= this.DV;
      if (++w >= this.t) this[this.t++] = 0;
      ++this[w]++;
    }
  }

  function NullExp() {}

  NullExp.prototype.convert = function(nNop(x) {
    return x;
  });

  NullExp.prototype.revert = function(nNop(x) {
    return x;
  });

  NullExp.prototype.mulTo = function(nMulTo(x, y, r) {
    x.multiplyTo(y, r);
  });

  NullExp.prototype.sqrTo = function(nSqrTo(x, r) {
    x.squareTo(r);
  });

  function bnPow(e) {
    return this.exp(e, new NullExp());
  }

  function bnpMultiplyLowerTo(a, n, r) {
    const i = Math.min(this.t + a.t, n);
    r.s = 0;
    r.t = i;
    while (i > 0) r[--i] = 0;
    let j;
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(
      0,
      a[i],
      r,
      i,
      0,
      this.t
    );
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
    r.clamp();
  }

  function bnpMultiplyUpperTo(a, n, r) {
    --n;
    const i = (r.t = this.t + a.t - n);
    r.s = 0;
    while (--i >= 0) r[i] = 0;
    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
      r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
    r.clamp();
    r.drShiftTo(1, r);
  }

  function Barrett(m) {
    this.r2 = nbi();
    this.q3 = nbi();
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
    this.mu = this.r2.divide(m);
    this.m = m;
  }

  Barrett.prototype.convert = function orrett(
    x
  )create {
    return (x.s < 0 || x.t > 2 * this.m.t) ? x.mod(this.m) : x;
  };

  Barrett.prototype.revert = function_barrettRevertall(x) {
    return x;
};

  Barrett.prototype.reduce = function barrettReduce(x) {
    x.drShiftTo(this.m.t - 1, this.r2);
    if (x.t > this.m.t + 1) {
      x.t = this.m.t + 1;
      x.clamp();
    }
    this.mu.multiplyUpperTo(
      this.r2,
      this.m.t + 1,
      this.q3
    );
    this.m.multiplyLowerTo(
      this.q3,
      this.m.t + 1,
      this.r2
    );
    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
    x.subTo(this.r2, x);
    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  };

  Barrett.prototype.sqrTo = function barrettSqrTo(x, r) {
    x.squareTo(r);
    this.reduce(r);
  };

  Barrett.prototype.mulTo = function barrettMulTo(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
  };

  function bnModPow(e, m) {
    const i = e.bitLength(),
      k,
      r = nbv(1),
      z;
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;
    if (i < 8) z = new Classic(m);
    else if (m.isEven()) z = new Barrett(m);
    else z = new Montgomery(m);

    const g = new Array(),
      n = 3,
      k1 = k - 1,
      km = (1 << k) - 1;
    g[1] = z.convert(this);
    if (k > 1) {
      const g2 = nbi();
      z.sqrTo(g[1], g2);
      while (n <= km) {
        g[n] = nbi();
        z.mulTo(g2, g[n - 2], g[n]);
        n += 2;
      }
    }

    let j = e.t - 1,
      w,
      is1 = true,
      r2 = nbi(),
      t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km;
      else {
        w = ((e[j] & ((1 << (i + 1)) - 1)) << (k1 - i));
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
      }

      n = k;
      while ((w & 1) == 0) {
        w >>= 1;
        --n;
      }
      if ((i -= n) < 0) {
        i += this.DB;
        --j;
      }
      if (is1) {
        g[w].copyTo(r);
        is1 = false;
      } else {
        while (n > 1) {
          z.sqrTo(r, r2);
          z.sqrTo(r2, r);
          n -= 2;
        }
        if (n > 0) z.sqrTo(r, r2);
        else {
          t = r;
          r = r2;
          r2 = t;
        }
        z.mulTo(r2, g[w], r);
      }

      while (j >= 0 && (e[j] & (1 << i)) == 0) {
        z.sqrTo(r, r2);
        t = r;
        r = r2;
        r2 = t;
        if (--i < 0) {
          i = this.DB - 1;
          --j;
        }
      }
    }
    return z.revert(r);
  }

  function bnGCD(a) {
    const x = this.s < 0 ? this.negate() : this.clone();
    const y = a.s < 0 ? a.negate() : a.clone();
    if (x.compareTo(y) < 0) {
      const t = x;
      x = y;
      y = t;
    }
    let i = x.getLowestSetBit(),
      g = y.getLowestSetBit();
    if (g < 0) return x;
    if (i < g) g = i;
    if (g > 0) {
      x.rShiftTo(g, x);
      y.rShiftTo(g, y);
    }
    while (x.signum() > 0) {
      if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
      if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
      if (x.compareTo(y) >= 0) {
        x.subTo(y, x);
        x.rShiftTo(1, x);
      } else {
        y.subTo(x, y);
        y.rShiftTo(1, y);
      }
    }
    if (g > 0) y.lShiftTo(g, y);
    return y;
  }

  function bnpModInt(n) {
    if (n <= 0) return 0;
    const d = this.DV % n,
      r = this.s < 0 ? n - 1 : 0;
    if (this.t > 0)
      if (d == 0) r = this[0] % n;
      else for (let i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
    return r;
  }

  function bnModInverse(m) {
    const ac = m.isEven();
    if ((this.isEven() && ac) || m.signum() === 0) return BigInteger.ZERO;
    const u = m.clone(),
      v = this.clone();
    const a = nbv(1),
      b = nbv(0),
      c = nbv(0),
      d = nbv(1);
    while (u.signum() != 0) {
      while (u.isEven()) {
        u.rShiftTo(1, u);
        if (ac) {
          if (!a.isEven() || !b.isEven()) {
            a.addTo(this, a);
            b.subTo(m, b);
          }
          a.rShiftTo(1, a);
        } else if (!b.isEven()) { b.subTo(m, b); b.rShiftTo(1, b); }
      }
      while (v.isEven()) {
        v.rShiftTo(1, v);
        if (ac) {
          if (!c.isEven() || !d.isEven()) {
            c.addTo(this, c);
            d.subTo(m, d);
          }
          c.rShiftTo(1, c);
        } else if (!d.isEven()) { d.subTo(m, d); d.rShiftTo(1, d); }
      }
      if (u.compareTo(v) >= 0) {
        u.subTo(v, u);
        if (ac) a.subTo(c, a);
        b.subTo(d, b);
      } else {
        v.subTo(u, v);
        if (ac) c.subTo(a, c);
        d.subTo(b, d);
      }
    }
    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
    if (d.compareTo(m) >= 0) return d.subtract(m);
    if (d.signum() < 0) d.addTo(m, d);
    else return d;
    if (d.signum() < 0) return d.add(m);
    else return d;
  }

  const lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113,
    127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271,
    277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443,
    449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619,
    631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821,
    823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997
  ];
  const lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

  function bnIsProbablePrime(t) {
    let i,
      x = this.abs();
    if (x.t === 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i) if (x[0] === lowprimes[i]) return true;
      return false;
    }
    if (x.isEven()) return false;
    i = 1;
    while (i < lowprimes.length) {
      let m = lowprimes[i],
        j = i + 1;
      while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
      m = x.modInt(m);
      while (i < j)
        if (m % lowprimes[i++] === 0) return false;
    }
    return x.millerRabin(t);
  }

  function bnpMillerRabin(t) {
    const n1 = this.subtract(BigInteger.ONE);
    const k = n1.getLowestSetBit();
    if (k <= 0) return false;
    const r = n1.shiftRight(k);
    t = (t + 1) >> 1;
    if (t > lowprimes.length) t = lowprimes.length;
    const a = nbi();
    for (let i = 0; i < t; ++i) {
      a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
      let y = a.modPow(r, this);
      if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
        let j = 1;
        while (j++ < k && y.compareTo(n1) != 0) {
          y = y.modPowInt(2, this);
          if (y.compareTo(BigInteger.ONE) == 0) return false;
        }
        if (y.compareTo(n1) != 0) return false;
      }
    }
    return true;
  }

  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.fromNumber = bnpFromNumber;
  BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
  BigInteger.prototype.changeBit = bnpChangeBit;
  BigInteger.prototype.addTo = bnpAddTo;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
  BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
  BigInteger.prototype.modInt = bnpModInt;
  BigInteger.prototype.millerRabin = bnpMillerRabin;

  BigInteger.prototype.clone = bnClone;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.byteValue = bnByteValue;
  BigInteger.prototype.shortValue = bnShortValue;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.toByteArray = bnToByteArray;
  BigInteger.prototype.equals = bnEquals;
  BigInteger.prototype.min = bnMin;
  BigInteger.prototype.max = bnMax;
  BigInteger.prototype.and = bnAnd;
  BigInteger.prototype.or = bnOr;
  BigInteger.prototype.xor = bnXor;
  BigInteger.prototype.andNot = bnAndNot;
  BigInteger.prototype.not = bnNot;
  BigInteger.prototype.shiftLeft = bnShiftLeft;
  BigInteger.prototype.shiftRight = bnShiftRight;
  BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
  BigInteger.prototype.bitCount = bnBitCount;
  BigInteger.prototype.testBit = bnTestBit;
  BigInteger.prototype.setBit = bnSetBit;
  BigInteger.prototype.clearBit = bnClearBit;
  BigInteger.prototype.flipBit = bnFlipBit;
  BigInteger.prototype.add = bnAdd;
  BigInteger.prototype.subtract = bnSubtract;
  BigInteger.prototype.multiply = bnMultiply;
  BigInteger.prototype.divide = bnDivide;
  BigInteger.prototype.remainder = bnRemainder;
  BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
  BigInteger.prototype.modPow = bnModPow;
  BigInteger.prototype.modInverse = bnModInverse;
  BigInteger.prototype.pow = bnPow;
  BigInteger.prototype.gcd = bnGCD;
  BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

  BigInteger.prototype.square = bnSquare;

  BigInteger.prototype.Barrett = Barrett;

  var rng_state;
  var rng_pool;
  var rng_pptr;

  function rng_seed_int(x) {
    rng_pool[rng_pptr++] ^= x & 255;
    rng_pool[rng_pptr++] ^= (x >> 8) & 255;
    rng_pool[rng_pptr++] ^= (x >> 16) & 255;
    rng_pool[rng_pptr++] ^= (x >> 24) & 255;
    if (rng_pptr >= rng_psize) rng_pptr -= rng_psize;
  }

  function rng_seed_time() {
    rng_seed_int(new Date().getTime());
  }

  if (rng_pool == null) {
    rng_pool = new Array();
    rng_pptr = 0;
    let t;
    if (typeof window !== "undefined" && window.crypto) {
      if (window.crypto.getRandomValues) {
        const ua = new Uint8Array(32);
        window.crypto.getRandomValues(ua);
        for (t = 0; t < 32; ++t) rng_pool[rng_pptr++] = ua[t];
      } else if (navigator.appName == "Netscape" && navigator.appVersion < "5") {
        const z = window.crypto.random(32);
        for (t = 0; t < z.length; ++t)
          rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
      }
    }
    while (rng_pptr < rng_psize) {
      t = Math.floor(65536 * Math.random());
      rng_pool[rng_pptr++] = t >>> 8;
      rng_pool[rng_pptr++] = t & 255;
    }
    rng_pptr = 0;
    rng_seed_time();
  }

  function rng_get_byte() {
    if (rng_state === null) {
      rng_seed_time();
      rng_state = prng_newstate();
      rng_state.init(rng_pool);
      for (let rngIndex = 0; rngIndex < rng_pool.length; ++rngIndex)
        rng_pool[rngIndex] = 0;
      rng_pptr = 0;
    }
    return rng_state.next();
  }

  function rng_get_bytes(ba) {
    for (let i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
  }

  function SecureRandom() {}

  SecureRandom.prototype.nextBytes = rng_get_bytes;

  function Arcfour() {
    this.i = 0;
    this.j = 0;
    this.S = new Array();
  }

  function ARC4init(key) {
    let i, j, t;
    for (i = 0; i < 256; ++i) this.S[i] = i;
    j = 0;
    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];
      this.S[i] = this.S[j];
      this.S[j] = t;
    }
    this.i = 0;
    this.j = 0;
  }

  function ARC4next() {
    let t;
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(t + this.S[this.i]) & 255];
  }

  Arcfour.prototype.init = ARC4init;
  Arcfour.prototype.next = ARC4next;

  function prng_newstate() {
    return new Arcfour();
  }

  const rng_psize = 256;

  if (typeof exports !== "undefined") {
    exports = module.exports = {
      default: BigInteger,
      BigInteger: BigInteger,
      SecureRandom: SecureRandom,
    };
  } else {
    this.jsbn = {
      BigInteger: BigInteger,
      SecureRandom: SecureRandom,
    };
  }
}).call(this);