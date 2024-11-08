"use strict";

const createError = (ErrorType, message, opts = {}) => {
    const errorMsg = `${opts.context ? opts.context : "Value"} ${message}.`;
    return new (opts.globals ? opts.globals[ErrorType.name] : ErrorType)(errorMsg);
};

const convertToNumber = (value, opts = {}) => {
    if (opts.globals && typeof value === "bigint") {
        throw opts.globals.TypeError("Cannot convert a BigInt value to a number");
    }
    return opts.globals ? opts.globals.Number(value) : +value;
};

const getType = (V) => {
    switch (typeof V) {
        case "undefined": return "Undefined";
        case "boolean": return "Boolean";
        case "number": return "Number";
        case "string": return "String";
        case "symbol": return "Symbol";
        case "bigint": return "BigInt";
        case "object": case "function": default: return V === null ? "Null" : "Object";
    }
};

const roundToEven = (x) => (
    (x > 0 && (x % 1) === 0.5 && (x & 1) === 0) || 
    (x < 0 && (x % 1) === -0.5 && (x & 1) === 1)
) ? removeNegativeZero(Math.floor(x)) : removeNegativeZero(Math.round(x));

const getIntegerPart = (n) => removeNegativeZero(Math.trunc(n));
const determineSign = (x) => x < 0 ? -1 : 1;

const mod = (x, y) => {
    const result = x % y;
    return determineSign(y) !== determineSign(result) ? result + y : result;
};

const removeNegativeZero = (x) => x === 0 ? 0 : x;

const integerConversion = (bitLength, typeOpts) => {
    const isSigned = !typeOpts.unsigned;
    let lowerBound, upperBound;

    if (bitLength === 64) {
        upperBound = Number.MAX_SAFE_INTEGER;
        lowerBound = isSigned ? Number.MIN_SAFE_INTEGER : 0;
    } else {
        lowerBound = isSigned ? -Math.pow(2, bitLength - 1) : 0;
        upperBound = isSigned ? Math.pow(2, bitLength - 1) - 1 : Math.pow(2, bitLength) - 1;
    }

    const twoToTheBitLength = Math.pow(2, bitLength);

    return (V, opts = {}) => {
        let x = convertToNumber(V, opts);
        x = removeNegativeZero(x);

        if (opts.enforceRange) {
            if (!Number.isFinite(x)) throw createError(TypeError, "is not a finite number", opts);
            x = getIntegerPart(x);
            if (x < lowerBound || x > upperBound) throw createError(TypeError, `is outside the range ${lowerBound} to ${upperBound}`, opts);
            return x;
        }

        if (!Number.isNaN(x) && opts.clamp) {
            x = roundToEven(Math.min(Math.max(x, lowerBound), upperBound));
            return x;
        }

        x = getIntegerPart(x);
        if (x >= lowerBound && x <= upperBound) return x;

        x = mod(x, twoToTheBitLength);
        return isSigned && x >= Math.pow(2, bitLength - 1) ? x - twoToTheBitLength : x;
    };
};

const longLongConversion = (bitLength, { unsigned }) => {
    const asBigIntN = unsigned ? BigInt.asUintN : BigInt.asIntN;
    return (V, opts = {}) => {
        let x = convertToNumber(V, opts);
        x = removeNegativeZero(x);

        if (opts.enforceRange) {
            if (!Number.isFinite(x)) throw createError(TypeError, "is not a finite number", opts);
            x = getIntegerPart(x);
            const bounds = unsigned ? [0, Number.MAX_SAFE_INTEGER] : [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
            if (x < bounds[0] || x > bounds[1]) throw createError(TypeError, `is outside the range ${bounds.join(" to ")}`, opts);
            return x;
        }

        if (!Number.isNaN(x) && opts.clamp) {
            x = roundToEven(Math.min(Math.max(x, -Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER));
            return x;
        }

        let xBigInt = BigInt(getIntegerPart(x));
        return Number(asBigIntN(bitLength, xBigInt));
    };
};

module.exports = {
    any: (V) => V,
    void: () => undefined,
    boolean: (val) => !!val,
    byte: integerConversion(8, { unsigned: false }),
    octet: integerConversion(8, { unsigned: true }),
    short: integerConversion(16, { unsigned: false }),
    unsignedShort: integerConversion(16, { unsigned: true }),
    long: integerConversion(32, { unsigned: false }),
    unsignedLong: integerConversion(32, { unsigned: true }),
    longLong: longLongConversion(64, { unsigned: false }),
    unsignedLongLong: longLongConversion(64, { unsigned: true }),
    double: (V, opts) => {
        const x = convertToNumber(V, opts);
        if (!Number.isFinite(x)) throw createError(TypeError, "is not a finite floating-point value", opts);
        return x;
    },
    unrestrictedDouble: (V, opts) => convertToNumber(V, opts),
    float: (V, opts) => {
        const x = convertToNumber(V, opts);
        if (!Number.isFinite(x)) throw createError(TypeError, "is not a finite floating-point value", opts);
        const y = Math.fround(x);
        if (!Number.isFinite(y)) throw createError(TypeError, "is outside the range of a single-precision floating-point value", opts);
        return y;
    },
    unrestrictedFloat: (V, opts) => Math.fround(convertToNumber(V, opts)),
    DOMString: (V, opts = {}) => {
        if (opts.treatNullAsEmptyString && V === null) return "";
        if (typeof V === "symbol") throw createError(TypeError, "cannot be a symbol", opts);
        return (opts.globals ? opts.globals.String : String)(V);
    },
    ByteString: (V, opts) => {
        const x = exports.DOMString(V, opts);
        if ([...x].some(c => c.codePointAt(0) > 255)) throw createError(TypeError, "is not a valid ByteString", opts);
        return x;
    },
    USVString: (V, opts) => {
        const S = exports.DOMString(V, opts);
        const U = [...S].map(c => {
            const code = c.codePointAt(0);
            if (code < 0xD800 || code > 0xDFFF) return c;
            return String.fromCodePoint(0xFFFD);
        });
        return U.join("");
    },
    object: (V, opts) => {
        if (getType(V) !== "Object") throw createError(TypeError, "is not an object", opts);
        return V;
    },
    Function: (V, opts) => {
        if (typeof V !== "function") throw createError(TypeError, "is not a function", opts);
        return V;
    },
    VoidFunction: (V, opts) => {
        if (typeof V !== "function") throw createError(TypeError, "is not a function", opts);
        return V;
    },
    ArrayBuffer: (V, opts = {}) => {
        const isNonShared = () => {
            try {
                abByteLengthGetter.call(V); return true;
            } catch { return false; }
        };
        const isShared = () => {
            try {
                sabByteLengthGetter.call(V); return true;
            } catch { return false; }
        };
        const isDetached = () => {
            try { new Uint8Array(V); return false; } catch { return true; }
        };

        if (!isNonShared()) {
            if (opts.allowShared && !isShared()) throw createError(TypeError, "is not an ArrayBuffer or SharedArrayBuffer", opts);
            if (!opts.allowShared) throw createError(TypeError, "is not an ArrayBuffer", opts);
        }
        if (isDetached()) throw createError(TypeError, "is a detached ArrayBuffer", opts);
        return V;
    },
    DataView: (V, opts = {}) => {
        try { dvByteLengthGetter.call(V); } catch { throw createError(TypeError, "is not a DataView", opts); }
        
        if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) throw createError(TypeError, "is backed by a SharedArrayBuffer, which is not allowed", opts);
        if (isArrayBufferDetached(V.buffer)) throw createError(TypeError, "is backed by a detached ArrayBuffer", opts);
        return V;
    },
    ArrayBufferView: (V, opts = {}) => {
        if (!ArrayBuffer.isView(V)) throw createError(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", opts);

        if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) throw createError(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", opts);
        if (isArrayBufferDetached(V.buffer)) throw createError(TypeError, "is a view on a detached ArrayBuffer", opts);
        return V;
    },
    BufferSource: (V, opts = {}) => {
        if (ArrayBuffer.isView(V)) {
            if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) throw createError(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", opts);
            if (isArrayBufferDetached(V.buffer)) throw createError(TypeError, "is a view on a detached ArrayBuffer", opts);
            return V;
        }

        if (!opts.allowShared && !isNonSharedArrayBuffer(V)) throw createError(TypeError, "is not an ArrayBuffer or a view on one", opts);
        if (opts.allowShared && !isSharedArrayBuffer(V) && !isNonSharedArrayBuffer(V)) throw createError(TypeError, "is not an ArrayBuffer, SharedArrayBuffer, or a view on one", opts);
        if (isArrayBufferDetached(V)) throw createError(TypeError, "is a detached ArrayBuffer", opts);
        return V;
    },
    DOMTimeStamp: longLongConversion(64, { unsigned: true })
};
