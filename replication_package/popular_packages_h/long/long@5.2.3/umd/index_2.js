// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
    "use strict";

    // Enable module export
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = void 0;

    // WebAssembly optimizations to do native i64 multiplication and divide
    var wasm = null;

    try {
        wasm = new WebAssembly.Instance(
            new WebAssembly.Module(new Uint8Array([/* wasm binary code */])),
            {}
        ).exports;
    } catch (e) {
        // no wasm support
    }

    function Long(low, high, unsigned) {
        this.low = low | 0;
        this.high = high | 0;
        this.unsigned = !!unsigned;
    }

    Long.prototype.__isLong__ = true;

    function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
    }

    function ctz32(value) {
        var c = Math.clz32(value & -value);
        return value ? 31 - c : c;
    }

    // Static methods
    Long.isLong = isLong;
    Long.fromInt = function(value, unsigned) {
        value = unsigned ? (value >>> 0) : (value | 0);
        return new Long(value, unsigned ? 0 : (value < 0 ? -1 : 0), unsigned);
    };

    Long.fromNumber = function(value, unsigned) {
        if (isNaN(value)) return unsigned ? Long.UZERO : Long.ZERO;
        if (unsigned) {
            if (value < 0) return Long.UZERO;
            if (value >= TWO_PWR_64_DBL) return Long.MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL) return Long.MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL) return Long.MAX_VALUE;
        }
        if (value < 0) return Long.fromNumber(-value, unsigned).neg();
        return Long.fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
    };

    Long.fromBits = function(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    };

    Long.fromString = function(str, unsigned, radix) {
        radix = radix || 10;
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") 
            return unsigned ? Long.UZERO : Long.ZERO;
        if (radix < 2 || radix > 36) throw RangeError('radix');
        var p = str.indexOf('-');
        if (p > 0) throw Error('interior hyphen');
        else if (p === 0) return Long.fromString(str.substring(1), unsigned, radix).neg();
        
        var radixToPower = Long.fromNumber(Math.pow(radix, 8), unsigned);

        for (var result = Long.ZERO, i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i),
                value = parseInt(str.substring(i, i + size), radix);

            if (size < 8) {
                var power = Long.fromNumber(Math.pow(radix, size), unsigned);
                result = result.mul(power).add(Long.fromNumber(value, unsigned));
            } else {
                result = result.mul(radixToPower);
                result = result.add(Long.fromNumber(value, unsigned));
            }
        }
        return result;
    };

    Long.fromValue = function(val, unsigned) {
        if (typeof val === 'number') return Long.fromNumber(val, unsigned);
        if (typeof val === 'string') return Long.fromString(val, unsigned);
        return Long.fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
    };

    var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
    
    var prototype = Long.prototype;
    
    prototype.toInt = function() {
        return this.unsigned ? this.low >>> 0 : this.low;
    };

    prototype.toNumber = function() {
        if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    prototype.toString = function(radix) {
        radix = radix || 10;
        if (radix < 2 || radix > 36) throw RangeError('radix');
        if (this.isZero()) return '0';
        if (this.isNegative()) {
            if (this.eq(Long.MIN_VALUE)) {
                var radixLong = Long.fromNumber(radix, false),
                    div = this.div(radixLong),
                    rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            } else return '-' + this.neg().toString(radix);
        }
        var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned),
            result = '',
            rem = this;
        while (true) {
            var remDiv = rem.div(radixToPower),
                intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) return digits + result;
            while (digits.length < 6) digits = '0' + digits;
            result = digits + result;
        }
    };

    prototype.equals = function(other) {
        if (!isLong(other)) other = Long.fromValue(other);
        return this.high === other.high && this.low === other.low;
    };

    prototype.compare = function(other) {
        if (!isLong(other)) other = Long.fromValue(other);
        if (this.eq(other)) return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg) return -1;
        if (!thisNeg && otherNeg) return 1;
        if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 || 
            other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    };

    prototype.negate = function() {
        return this.not().add(Long.ONE);
    };

    prototype.add = function(addend) {
        if (!isLong(addend)) addend = Long.fromValue(addend);
        var a48 = this.high >>> 16,
            a32 = this.high & 0xFFFF,
            a16 = this.low >>> 16,
            a00 = this.low & 0xFFFF,
            b48 = addend.high >>> 16,
            b32 = addend.high & 0xFFFF,
            b16 = addend.low >>> 16,
            b00 = addend.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16; c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16; c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16; c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    };

    prototype.subtract = function(subtrahend) {
        if (!isLong(subtrahend)) subtrahend = Long.fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };

    prototype.multiply = function(multiplier) {
        if (this.isZero()) return this;
        if (!isLong(multiplier)) multiplier = Long.fromValue(multiplier);
        if (wasm) {
            var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
            return Long.fromBits(low, wasm["get_high"](), this.unsigned);
        }
        if (multiplier.isZero()) return this.unsigned ? Long.UZERO : Long.ZERO;
        if (this.eq(Long.MIN_VALUE)) return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (multiplier.eq(Long.MIN_VALUE)) return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (this.isNegative()) {
            if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
            return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg();
        if (this.lt(Long.TWO_PWR_24) && multiplier.lt(Long.TWO_PWR_24))
            return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        var a48 = this.high >>> 16,
            a32 = this.high & 0xFFFF,
            a16 = this.low >>> 16,
            a00 = this.low & 0xFFFF,
            b48 = multiplier.high >>> 16,
            b32 = multiplier.high & 0xFFFF,
            b16 = multiplier.low >>> 16,
            b00 = multiplier.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16; c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16; c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16; c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16; c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16; c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16; c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    };

    prototype.divide = function(divisor) {
        if (!isLong(divisor)) divisor = Long.fromValue(divisor);
        if (divisor.isZero()) throw Error('division by zero');
        if (wasm) {
            if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
                return this;
            }
            var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
            return Long.fromBits(low, wasm["get_high"](), this.unsigned);
        }
        if (this.isZero()) return this.unsigned ? Long.UZERO : Long.ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
            if (this.eq(Long.MIN_VALUE)) {
                if (divisor.eq(Long.ONE) || divisor.eq(Long.NEG_ONE)) return Long.MIN_VALUE;
                else if (divisor.eq(Long.MIN_VALUE)) return Long.ONE;
                else {
                    var halfThis = this.shr(1);
                    approx = halfThis.div(divisor).shl(1);
                    if (approx.eq(Long.ZERO)) {
                        return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
                    } else {
                        rem = this.sub(divisor.mul(approx));
                        res = approx.add(rem.div(divisor));
                        return res;
                    }
                }
            } else if (divisor.eq(Long.MIN_VALUE)) return this.unsigned ? Long.UZERO : Long.ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative()) return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
            res = Long.ZERO;
        } else {
            if (!divisor.unsigned) divisor = divisor.toUnsigned();
            if (divisor.gt(this)) return Long.UZERO;
            if (divisor.gt(this.shru(1))) return Long.UONE;
            res = Long.UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48),
                approxRes = Long.fromNumber(approx, this.unsigned),
                approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = Long.fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            if (approxRes.isZero()) approxRes = Long.ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };

    // Additional prototypes omitted for brevity...

    Long.ZERO = Long.fromInt(0);
    Long.UZERO = Long.fromInt(0, true);
    Long.ONE = Long.fromInt(1);
    Long.UONE = Long.fromInt(1, true);
    Long.NEG_ONE = Long.fromInt(-1);
    Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
    Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
    Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);

    var _default = Long;
    exports.default = _default;
    return _default;
})({});

if (typeof define === 'function' && define.amd) {
    define([], function() { return Long; });
} else if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Long;
}
