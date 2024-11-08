module.exports = Long;

let wasm = null;

try {
  wasm = new WebAssembly.Instance(
    new WebAssembly.Module(
      new Uint8Array([
        // WebAssembly bytecode...
      ])
    ),
    {}
  ).exports;
} catch (e) {
  // WebAssembly not supported
}

function Long(low, high, unsigned) {
  this.low = low | 0;
  this.high = high | 0;
  this.unsigned = !!unsigned;
}

Long.prototype.__isLong__ = true;

Long.isLong = function(obj) {
  return (obj && obj.__isLong__) === true;
};

const INT_CACHE = {};
const UINT_CACHE = {};

Long.fromInt = function(value, unsigned) {
  var cache, cachedObj, obj;
  if (unsigned) {
    value >>>= 0;
    if ((cache = 0 <= value && value < 256)) {
      cachedObj = UINT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = Long.fromBits(value, value | 0 < 0 ? -1 : 0, true);
    if (cache) UINT_CACHE[value] = obj;
    return obj;
  } else {
    value |= 0;
    if ((cache = -128 <= value && value < 128)) {
      cachedObj = INT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = Long.fromBits(value, value < 0 ? -1 : 0, false);
    if (cache) INT_CACHE[value] = obj;
    return obj;
  }
};

Long.fromNumber = function(value, unsigned) {
  if (isNaN(value)) return unsigned ? UZERO : ZERO;
  if (unsigned) {
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
  } else {
    if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
    if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
  }
  if (value < 0) return Long.fromNumber(-value, unsigned).neg();
  return Long.fromBits(
    (value % TWO_PWR_32_DBL) | 0,
    (value / TWO_PWR_32_DBL) | 0,
    unsigned
  );
};

Long.fromBits = function(lowBits, highBits, unsigned) {
  return new Long(lowBits, highBits, unsigned);
};

Long.fromString = function(str, unsigned, radix) {
  if (str.length === 0) throw Error("empty string");
  if (
    str === "NaN" ||
    str === "Infinity" ||
    str === "+Infinity" ||
    str === "-Infinity"
  )
    return ZERO;
  if (typeof unsigned === "number") {
    radix = unsigned;
    unsigned = false;
  } else {
    unsigned = !!unsigned;
  }
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  var p;
  if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
  else if (p === 0) {
    return Long.fromString(str.substring(1), unsigned, radix).neg();
  }
  var radixToPower = Long.fromNumber(pow_dbl(radix, 8));
  var result = ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i),
      value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = Long.fromNumber(pow_dbl(radix, size));
      result = result.mul(power).add(Long.fromNumber(value));
    } else {
      result = result.mul(radixToPower);
      result = result.add(Long.fromNumber(value));
    }
  }
  result.unsigned = unsigned;
  return result;
};

Long.fromValue = function(val, unsigned) {
  if (typeof val === "number") return Long.fromNumber(val, unsigned);
  if (typeof val === "string") return Long.fromString(val, unsigned);
  return Long.fromBits(
    val.low,
    val.high,
    typeof unsigned === "boolean" ? unsigned : val.unsigned
  );
};

var pow_dbl = Math.pow;

var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

var TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
var ZERO = Long.fromInt(0);
Long.ZERO = ZERO;

var UZERO = Long.fromInt(0, true);
Long.UZERO = UZERO;

var ONE = Long.fromInt(1);
Long.ONE = ONE;

var UONE = Long.fromInt(1, true);
Long.UONE = UONE;

var NEG_ONE = Long.fromInt(-1);
Long.NEG_ONE = NEG_ONE;

var MAX_VALUE = Long.fromBits(0xffffffff | 0, 0x7fffffff | 0, false);
Long.MAX_VALUE = MAX_VALUE;

var MAX_UNSIGNED_VALUE = Long.fromBits(0xffffffff | 0, 0xffffffff | 0, true);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

var MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
Long.MIN_VALUE = MIN_VALUE;

Long.prototype.toInt = function() {
  return this.unsigned ? this.low >>> 0 : this.low;
};

Long.prototype.toNumber = function() {
  if (this.unsigned)
    return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
  return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};

Long.prototype.toString = function(radix) {
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  if (this.isZero()) return "0";
  if (this.isNegative()) {
    if (this.eq(MIN_VALUE)) {
      var radixLong = Long.fromNumber(radix),
        div = this.div(radixLong),
        rem1 = div.mul(radixLong).sub(this);
      return div.toString(radix) + rem1.toInt().toString(radix);
    } else return "-" + this.neg().toString(radix);
  }
  var radixToPower = Long.fromNumber(pow_dbl(radix, 6), this.unsigned),
    rem = this;
  var result = "";
  while (true) {
    var remDiv = rem.div(radixToPower),
      intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
      digits = intval.toString(radix);
    rem = remDiv;
    if (rem.isZero()) return digits + result;
    else {
      while (digits.length < 6) digits = "0" + digits;
      result = "" + digits + result;
    }
  }
};

Long.prototype.getHighBits = function() {
  return this.high;
};

Long.prototype.getHighBitsUnsigned = function() {
  return this.high >>> 0;
};

Long.prototype.getLowBits = function() {
  return this.low;
};

Long.prototype.getLowBitsUnsigned = function() {
  return this.low >>> 0;
};

Long.prototype.getNumBitsAbs = function() {
  if (this.isNegative()) return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
  var val = this.high != 0 ? this.high : this.low;
  for (var bit = 31; bit > 0; bit--)
    if ((val & (1 << bit)) != 0) break;
  return this.high != 0 ? bit + 33 : bit + 1;
};

Long.prototype.isZero = function() {
  return this.high === 0 && this.low === 0;
};

Long.prototype.eqz = Long.prototype.isZero;

Long.prototype.isNegative = function() {
  return !this.unsigned && this.high < 0;
};

Long.prototype.isPositive = function() {
  return this.unsigned || this.high >= 0;
};

Long.prototype.isOdd = function() {
  return (this.low & 1) === 1;
};

Long.prototype.isEven = function() {
  return (this.low & 1) === 0;
};

Long.prototype.equals = function(other) {
  if (!Long.isLong(other)) other = Long.fromValue(other);
  if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
    return false;
  return this.high === other.high && this.low === other.low;
};

Long.prototype.eq = Long.prototype.equals;

Long.prototype.notEquals = function(other) {
  return !this.eq(other);
};

Long.prototype.neq = Long.prototype.notEquals;

Long.prototype.ne = Long.prototype.notEquals;

Long.prototype.lessThan = function(other) {
  return this.comp(other) < 0;
};

Long.prototype.lt = Long.prototype.lessThan;

Long.prototype.lessThanOrEqual = function(other) {
  return this.comp(other) <= 0;
};

Long.prototype.lte = Long.prototype.lessThanOrEqual;

Long.prototype.le = Long.prototype.lessThanOrEqual;

Long.prototype.greaterThan = function(other) {
  return this.comp(other) > 0;
};

Long.prototype.gt = Long.prototype.greaterThan;

Long.prototype.greaterThanOrEqual = function(other) {
  return this.comp(other) >= 0;
};

Long.prototype.gte = Long.prototype.greaterThanOrEqual;

Long.prototype.ge = Long.prototype.greaterThanOrEqual;

Long.prototype.compare = function(other) {
  if (!Long.isLong(other)) other = Long.fromValue(other);
  if (this.eq(other)) return 0;
  var thisNeg = this.isNegative(),
    otherNeg = other.isNegative();
  if (thisNeg && !otherNeg) return -1;
  if (!thisNeg && otherNeg) return 1;
  if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
  return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
};

Long.prototype.comp = Long.prototype.compare;

Long.prototype.negate = function() {
  if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
  return this.not().add(ONE);
};

Long.prototype.neg = Long.prototype.negate;

Long.prototype.add = function(addend) {
  if (!Long.isLong(addend)) addend = Long.fromValue(addend);

  var a48 = this.high >>> 16;
  var a32 = this.high & 0xffff;
  var a16 = this.low >>> 16;
  var a00 = this.low & 0xffff;

  var b48 = addend.high >>> 16;
  var b32 = addend.high & 0xffff;
  var b16 = addend.low >>> 16;
  var b00 = addend.low & 0xffff;

  var c48 = 0,
    c32 = 0,
    c16 = 0,
    c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 0xffff;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 0xffff;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 0xffff;
  c48 += a48 + b48;
  c48 &= 0xffff;
  return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};

Long.prototype.subtract = function(subtrahend) {
  if (!Long.isLong(subtrahend)) subtrahend = Long.fromValue(subtrahend);
  return this.add(subtrahend.neg());
};

Long.prototype.sub = Long.prototype.subtract;

Long.prototype.multiply = function(multiplier) {
  if (this.isZero()) return ZERO;
  if (!Long.isLong(multiplier)) multiplier = Long.fromValue(multiplier);

  if (wasm) {
    var low = wasm.mul(this.low, this.high, multiplier.low, multiplier.high);
    return Long.fromBits(low, wasm.get_high(), this.unsigned);
  }

  if (multiplier.isZero()) return ZERO;
  if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
  if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;

  if (this.isNegative()) {
    if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
    else return this.neg().mul(multiplier).neg();
  } else if (multiplier.isNegative())
    return this.mul(multiplier.neg()).neg();

  if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
    return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

  var a48 = this.high >>> 16;
  var a32 = this.high & 0xffff;
  var a16 = this.low >>> 16;
  var a00 = this.low & 0xffff;

  var b48 = multiplier.high >>> 16;
  var b32 = multiplier.high & 0xffff;
  var b16 = multiplier.low >>> 16;
  var b00 = multiplier.low & 0xffff;

  var c48 = 0,
    c32 = 0,
    c16 = 0,
    c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 0xffff;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 0xffff;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 0xffff;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 0xffff;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 0xffff;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 0xffff;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 0xffff;
  return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};

Long.prototype.mul = Long.prototype.multiply;

Long.prototype.divide = function(divisor) {
  if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
  if (divisor.isZero()) throw Error("division by zero");

  if (wasm) {
    if (!this.unsigned &&
      this.high === -0x80000000 &&
      divisor.low === -1 &&
      divisor.high === -1) {
      return this;
    }
    var low = (this.unsigned ? wasm.div_u : wasm.div_s)(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return Long.fromBits(low, wasm.get_high(), this.unsigned);
  }

  if (this.isZero()) return this.unsigned ? UZERO : ZERO;
  var approx, rem, res;
  if (!this.unsigned) {
    if (this.eq(MIN_VALUE)) {
      if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE;
      else if (divisor.eq(MIN_VALUE)) return ONE;
      else {
        var halfThis = this.shr(1);
        approx = halfThis.div(divisor).shl(1);
        if (approx.eq(ZERO)) {
          return divisor.isNegative() ? ONE : NEG_ONE;
        } else {
          rem = this.sub(divisor.mul(approx));
          res = approx.add(rem.div(divisor));
          return res;
        }
      }
    } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
    if (this.isNegative()) {
      if (divisor.isNegative()) return this.neg().div(divisor.neg());
      return this.neg().div(divisor).neg();
    } else if (divisor.isNegative())
      return this.div(divisor.neg()).neg();
    res = ZERO;
  } else {
    if (!divisor.unsigned) divisor = divisor.toUnsigned();
    if (divisor.gt(this)) return UZERO;
    if (divisor.gt(this.shru(1))) return UONE;
    res = UZERO;
  }

  rem = this;
  while (rem.gte(divisor)) {
    approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

    var log2 = Math.ceil(Math.log(approx) / Math.LN2),
      delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),

      approxRes = Long.fromNumber(approx),
      approxRem = approxRes.mul(divisor);
    while (approxRem.isNegative() || approxRem.gt(rem)) {
      approx -= delta;
      approxRes = Long.fromNumber(approx, this.unsigned);
      approxRem = approxRes.mul(divisor);
    }

    if (approxRes.isZero()) approxRes = ONE;

    res = res.add(approxRes);
    rem = rem.sub(approxRem);
  }
  return res;
};

Long.prototype.div = Long.prototype.divide;

Long.prototype.modulo = function(divisor) {
  if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);

  if (wasm) {
    var low = (this.unsigned ? wasm.rem_u : wasm.rem_s)(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return Long.fromBits(low, wasm.get_high(), this.unsigned);
  }

  return this.sub(this.div(divisor).mul(divisor));
};

Long.prototype.mod = Long.prototype.modulo;

Long.prototype.rem = Long.prototype.modulo;

Long.prototype.not = function() {
  return Long.fromBits(~this.low, ~this.high, this.unsigned);
};

Long.prototype.and = function(other) {
  if (!Long.isLong(other)) other = Long.fromValue(other);
  return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
};

Long.prototype.or = function(other) {
  if (!Long.isLong(other)) other = Long.fromValue(other);
  return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
};

Long.prototype.xor = function(other) {
  if (!Long.isLong(other)) other = Long.fromValue(other);
  return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
};

Long.prototype.shiftLeft = function(numBits) {
  if (Long.isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return Long.fromBits(
      this.low << numBits,
      (this.high << numBits) | (this.low >>> (32 - numBits)),
      this.unsigned
    );
  else return Long.fromBits(0, this.low << (numBits - 32), this.unsigned);
};

Long.prototype.shl = Long.prototype.shiftLeft;

Long.prototype.shiftRight = function(numBits) {
  if (Long.isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return Long.fromBits(
      (this.low >>> numBits) | (this.high << (32 - numBits)),
      this.high >> numBits,
      this.unsigned
    );
  else return Long.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
};

Long.prototype.shr = Long.prototype.shiftRight;

Long.prototype.shiftRightUnsigned = function(numBits) {
  if (Long.isLong(numBits)) numBits = numBits.toInt();
  numBits &= 63;
  if (numBits === 0) return this;
  else {
    var high = this.high;
    if (numBits < 32) {
      var low = this.low;
      return Long.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
    } else if (numBits === 32)
      return Long.fromBits(high, 0, this.unsigned);
    else
      return Long.fromBits(high >>> (numBits - 32), 0, this.unsigned);
  }
};

Long.prototype.shru = Long.prototype.shiftRightUnsigned;

Long.prototype.shr_u = Long.prototype.shiftRightUnsigned;

Long.prototype.toSigned = function() {
  if (!this.unsigned) return this;
  return Long.fromBits(this.low, this.high, false);
};

Long.prototype.toUnsigned = function() {
  if (this.unsigned) return this;
  return Long.fromBits(this.low, this.high, true);
};

Long.prototype.toBytes = function(le) {
  return le ? this.toBytesLE() : this.toBytesBE();
};

Long.prototype.toBytesLE = function() {
  var hi = this.high,
    lo = this.low;
  return [
    lo & 0xff,
    lo >>> 8 & 0xff,
    lo >>> 16 & 0xff,
    lo >>> 24,
    hi & 0xff,
    hi >>> 8 & 0xff,
    hi >>> 16 & 0xff,
    hi >>> 24
  ];
};

Long.prototype.toBytesBE = function() {
  var hi = this.high,
    lo = this.low;
  return [
    hi >>> 24,
    hi >>> 16 & 0xff,
    hi >>> 8 & 0xff,
    hi & 0xff,
    lo >>> 24,
    lo >>> 16 & 0xff,
    lo >>> 8 & 0xff,
    lo & 0xff
  ];
};

Long.fromBytes = function(bytes, unsigned, le) {
  return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
};

Long.fromBytesLE = function(bytes, unsigned) {
  return new Long(
    (bytes[0] |
      bytes[1] << 8 |
      bytes[2] << 16 |
      bytes[3] << 24) >>>
      0,
    (bytes[4] |
      bytes[5] << 8 |
      bytes[6] << 16 |
      bytes[7] << 24) >>>
      0,
    unsigned
  );
};

Long.fromBytesBE = function(bytes, unsigned) {
  return new Long(
    (bytes[4] << 24 |
      bytes[5] << 16 |
      bytes[6] << 8 |
      bytes[7]) >>>
      0,
    (bytes[0] << 24 |
      bytes[1] << 16 |
      bytes[2] << 8 |
      bytes[3]) >>>
      0,
    unsigned
  );
};
