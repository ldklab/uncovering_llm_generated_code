(function(){

    // Basic JavaScript BN library - useful for RSA encryption.

    // Set number of bits per digit
    var dbits;

    // Analyze JavaScript engine support
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary & 0xffffff) == 0xefcafe);

    // BigInteger Constructor
    function BigInteger(a, b, c) {
      if (a != null) {
        if (typeof a === "number") this.fromNumber(a, b, c);
        else if (b == null && typeof a !== "string") this.fromString(a, 256);
        else this.fromString(a, b);
      }
    }

    // Return new unset BigInteger
    function nbi() { return new BigInteger(null); }

    // Algorithm function implementations for multiplication handling
    function am1(i, x, w, j, c, n) {
      while (--n >= 0) {
        var v = x * this[i++] + w[j] + c;
        c = Math.floor(v / 0x4000000);
        w[j++] = v & 0x3ffffff;
      }
      return c;
    }

    function am2(i, x, w, j, c, n) {
      var xl = x & 0x7fff, xh = x >> 15;
      while (--n >= 0) {
        var l = this[i] & 0x7fff;
        var h = this[i++] >> 15;
        var m = xh * l + h * xl;
        l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
        w[j++] = l & 0x3fffffff;
      }
      return c;
    }

    function am3(i, x, w, j, c, n) {
      var xl = x & 0x3fff, xh = x >> 14;
      while (--n >= 0) {
        var l = this[i] & 0x3fff;
        var h = this[i++] >> 14;
        var m = xh * l + h * xl;
        l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
        c = (l >> 28) + (m >> 14) + xh * h;
        w[j++] = l & 0xfffffff;
      }
      return c;
    }

    var inBrowser = typeof navigator !== "undefined";
    if (inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
      BigInteger.prototype.am = am2;
      dbits = 30;
    }
    else if (inBrowser && j_lm && (navigator.appName !== "Netscape")) {
      BigInteger.prototype.am = am1;
      dbits = 26;
    }
    else {
      BigInteger.prototype.am = am3;
      dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1 << dbits) - 1);
    BigInteger.prototype.DV = (1 << dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s, i) {
      var c = BI_RC[s.charCodeAt(i)];
      return (c == null) ? -1 : c;
    }

    // Define protected methods
    BigInteger.prototype.copyTo = function(r) {
      for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
      r.t = this.t;
      r.s = this.s;
    };

    BigInteger.prototype.fromInt = function(x) {
      this.t = 1;
      this.s = (x < 0) ? -1 : 0;
      if (x > 0) this[0] = x;
      else if (x < -1) this[0] = x + this.DV;
      else this.t = 0;
    };

    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

    BigInteger.prototype.fromString = function(s, b) {
      var k;
      if (b == 16) k = 4;
      else if (b == 8) k = 3;
      else if (b == 256) k = 8;
      else if (b == 2) k = 1;
      else if (b == 32) k = 5;
      else if (b == 4) k = 2;
      else { this.fromRadix(s, b); return; }
      this.t = 0;
      this.s = 0;
      var i = s.length, mi = false, sh = 0;
      while (--i >= 0) {
        var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
        if (x < 0) {
          if (s.charAt(i) == "-") mi = true;
          continue;
        }
        mi = false;
        if (sh == 0)
          this[this.t++] = x;
        else if (sh + k > this.DB) {
          this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
          this[this.t++] = (x >> (this.DB - sh));
        }
        else
          this[this.t - 1] |= x << sh;
        sh += k;
        if (sh >= this.DB) sh -= this.DB;
      }
      if (k == 8 && (s[0] & 0x80) != 0) {
        this.s = -1;
        if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
      }
      this.clamp();
      if (mi) BigInteger.ZERO.subTo(this, this);
    };

    BigInteger.prototype.clamp = function() {
      var c = this.s & this.DM;
      while (this.t > 0 && this[this.t - 1] == c) --this.t;
    };

    // Public Method: Converting this to string with a given radix
    BigInteger.prototype.toString = function(b) {
      if (this.s < 0) return "-" + this.negate().toString(b);
      var k;
      if (b == 16) k = 4;
      else if (b == 8) k = 3;
      else if (b == 2) k = 1;
      else if (b == 32) k = 5;
      else if (b == 4) k = 2;
      else return this.toRadix(b);
      var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
      var p = this.DB - (i * this.DB) % k;
      if (i-- > 0) {
        if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
        while (i >= 0) {
          if (p < k) {
            d = (this[i] & ((1 << p) - 1)) << (k - p);
            d |= this[--i] >> (p += this.DB - k);
          }
          else {
            d = (this[i] >> (p -= k)) & km;
            if (p <= 0) { p += this.DB; --i; }
          }
          if (d > 0) m = true;
          if (m) r += int2char(d);
        }
      }
      return m ? r : "0";
    };

    // Additional BigInteger methods
    BigInteger.prototype.negate = function() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }
    BigInteger.prototype.abs = function() { return (this.s < 0) ? this.negate() : this; }
    BigInteger.prototype.compareTo = function(a) {
      var r = this.s - a.s;
      if (r != 0) return r;
      var i = this.t;
      r = i - a.t;
      if (r != 0) return (this.s < 0) ? -r : r;
      while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
      return 0;
    }
    BigInteger.prototype.bitLength = function() {
      if (this.t <= 0) return 0;
      return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
    }

    // Random number generation
    var rng_state;
    var rng_pool;
    var rng_pptr;
    var rng_psize = 256;

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
      var t;
      if (typeof window !== "undefined" && window.crypto) {
        if (window.crypto.getRandomValues) {
          var ua = new Uint8Array(32);
          window.crypto.getRandomValues(ua);
          for (t = 0; t < 32; ++t)
            rng_pool[rng_pptr++] = ua[t];
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
      if (rng_state == null) {
        rng_seed_time();
        rng_state = prng_newstate();
        rng_state.init(rng_pool);
        for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
          rng_pool[rng_pptr] = 0;
        rng_pptr = 0;
      }
      return rng_state.next();
    }

    function rng_get_bytes(ba) {
      for (var i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
    }

    function SecureRandom() {}
    SecureRandom.prototype.nextBytes = rng_get_bytes;

    // Random number generator - uses Arcfour as a PRNG
    function Arcfour() {
      this.i = 0;
      this.j = 0;
      this.S = new Array();
    }

    function ARC4init(key) {
      var i, j, t;
      for (i = 0; i < 256; ++i)
        this.S[i] = i;
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
      var t;
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

    if (typeof exports !== 'undefined') {
      exports = module.exports = {
          BigInteger: BigInteger,
          SecureRandom: SecureRandom,
      };
    } else {
      this.jsbn = {
        BigInteger: BigInteger,
        SecureRandom: SecureRandom
      };
    }

}).call(this);
