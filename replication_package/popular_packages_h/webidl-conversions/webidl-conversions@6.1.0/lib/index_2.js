"use strict";

// Utility function to throw errors based on ErrorType and a message
function makeException(ErrorType, message, opts = {}) {
    if (opts.globals) {
        ErrorType = opts.globals[ErrorType.name];
    }
    return new ErrorType(`${opts.context ? opts.context : "Value"} ${message}.`);
}

// Convert a value to a number
function toNumber(value, opts = {}) {
    if (!opts.globals) {
        return +value;
    }
    if (typeof value === "bigint") {
        throw opts.globals.TypeError("Cannot convert a BigInt value to a number");
    }
    return opts.globals.Number(value);
}

// Determine the type of a given value in string format
function type(V) {
    if (V === null) {
        return "Null";
    }
    // Switch-case to match JavaScript value type 
    switch (typeof V) {
        case "undefined":
            return "Undefined";
        case "boolean":
            return "Boolean";
        case "number":
            return "Number";
        case "string":
            return "String";
        case "symbol":
            return "Symbol";
        case "bigint":
            return "BigInt";
        case "object":
        case "function":
        default:
            return "Object";
    }
}

// Rounds a number to the nearest even integer
function evenRound(x) {
    if ((x > 0 && (x % 1) === +0.5 && (x & 1) === 0) ||
        (x < 0 && (x % 1) === -0.5 && (x & 1) === 1)) {
        return censorNegativeZero(Math.floor(x));
    }
    return censorNegativeZero(Math.round(x));
}

// Returns the integer part of a number
function integerPart(n) {
    return censorNegativeZero(Math.trunc(n));
}

// Returns the sign of a number
function sign(x) {
    return x < 0 ? -1 : 1;
}

// Calculates the modulo value
function modulo(x, y) {
    const signMightNotMatch = x % y;
    if (sign(y) !== sign(signMightNotMatch)) {
        return signMightNotMatch + y;
    }
    return signMightNotMatch;
}

// Converts -0 to 0
function censorNegativeZero(x) {
    return x === 0 ? 0 : x;
}

// Creates a conversion for integers with bit length and type options
function createIntegerConversion(bitLength, typeOpts) {
    const isSigned = !typeOpts.unsigned;
    let lowerBound, upperBound;
    if (bitLength === 64) {
        upperBound = Number.MAX_SAFE_INTEGER;
        lowerBound = isSigned ? Number.MIN_SAFE_INTEGER : 0;
    } else if (!isSigned) {
        lowerBound = 0;
        upperBound = Math.pow(2, bitLength) - 1;
    } else {
        lowerBound = -Math.pow(2, bitLength - 1);
        upperBound = Math.pow(2, bitLength - 1) - 1;
    }

    const twoToTheBitLength = Math.pow(2, bitLength);
    const twoToOneLessThanTheBitLength = Math.pow(2, bitLength - 1);

    return (V, opts = {}) => {
        let x = toNumber(V, opts);
        x = censorNegativeZero(x);
        // Enforce range constraints
        if (opts.enforceRange) {
            if (!Number.isFinite(x)) {
                throw makeException(TypeError, "is not a finite number", opts);
            }
            x = integerPart(x);
            if (x < lowerBound || x > upperBound) {
                throw makeException(TypeError,
                    `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, opts);
            }
            return x;
        }

        // Clamp value if within range
        if (!Number.isNaN(x) && opts.clamp) {
            x = Math.min(Math.max(x, lowerBound), upperBound);
            x = evenRound(x);
            return x;
        }

        // Handle non-finite and zero values
        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }
        x = integerPart(x);

        // Efficient bit operation for bit length
        if (x >= lowerBound && x <= upperBound) {
            return x;
        }

        x = modulo(x, twoToTheBitLength);
        if (isSigned && x >= twoToOneLessThanTheBitLength) {
            return x - twoToTheBitLength;
        }
        return x;
    };
}

// Creates conversion for long long integers with options
function createLongLongConversion(bitLength, { unsigned }) {
    const upperBound = Number.MAX_SAFE_INTEGER;
    const lowerBound = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    const asBigIntN = unsigned ? BigInt.asUintN : BigInt.asIntN;

    return (V, opts = {}) => {
        if (opts === undefined) {
            opts = {};
        }

        let x = toNumber(V, opts);
        x = censorNegativeZero(x);

        // Enforce range constraints
        if (opts.enforceRange) {
            if (!Number.isFinite(x)) {
                throw makeException(TypeError, "is not a finite number", opts);
            }
            x = integerPart(x);
            if (x < lowerBound || x > upperBound) {
                throw makeException(TypeError,
                    `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, opts);
            }
            return x;
        }

        // Clamp value if within range
        if (!Number.isNaN(x) && opts.clamp) {
            x = Math.min(Math.max(x, lowerBound), upperBound);
            x = evenRound(x);
            return x;
        }

        // Handle non-finite values
        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }

        let xBigInt = BigInt(integerPart(x));
        xBigInt = asBigIntN(bitLength, xBigInt);
        return Number(xBigInt);
    };
}

// Common conversion utilities

exports.any = V => V;
exports.void = () => undefined;
exports.boolean = val => !!val;

// Define type conversion exports for different primitive types
exports.byte = createIntegerConversion(8, { unsigned: false });
exports.octet = createIntegerConversion(8, { unsigned: true });
exports.short = createIntegerConversion(16, { unsigned: false });
exports["unsigned short"] = createIntegerConversion(16, { unsigned: true });
exports.long = createIntegerConversion(32, { unsigned: false });
exports["unsigned long"] = createIntegerConversion(32, { unsigned: true });
exports["long long"] = createLongLongConversion(64, { unsigned: false });
exports["unsigned long long"] = createLongLongConversion(64, { unsigned: true });

// Define conversion utilities for double and float types
exports.double = (V, opts) => {
    const x = toNumber(V, opts);
    if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", opts);
    }
    return x;
};

exports["unrestricted double"] = toNumber;

exports.float = (V, opts) => {
    const x = toNumber(V, opts);
    if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", opts);
    }
    const y = Math.fround(x);
    if (!Number.isFinite(y)) {
        throw makeException(TypeError, "is outside the range of a single-precision floating-point value", opts);
    }
    return y;
};

exports["unrestricted float"] = (V, opts) => {
    const x = toNumber(V, opts);
    return Math.fround(x);
};

// String conversion utilities considering DOMString and symbols
exports.DOMString = (V, opts = {}) => {
    if (opts.treatNullAsEmptyString && V === null) return "";
    if (typeof V === "symbol") {
        throw makeException(TypeError, "is a symbol, which cannot be converted to a string", opts);
    }
    return opts.globals ? opts.globals.String(V) : String(V);
};

exports.ByteString = (V, opts) => {
    const str = exports.DOMString(V, opts);
    for (let i = 0; i < str.length; ++i) {
        if (str.codePointAt(i) > 255) {
            throw makeException(TypeError, "is not a valid ByteString", opts);
        }
    }
    return str;
};

exports.USVString = (V, opts) => {
    const str = exports.DOMString(V, opts);
    const U = [];
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 0xD800 || c > 0xDFFF) {
            U.push(c);
        } else {
            U.push(0xFFFD);
        }
    }
    return String.fromCharCode(...U);
};

// Ensure a value is an object or throw an error
exports.object = (V, opts) => {
    if (type(V) !== "Object") {
        throw makeException(TypeError, "is not an object", opts);
    }
    return V;
};

// Function to convert callback functions
function convertCallbackFunction(V, opts) {
    if (typeof V !== "function") {
        throw makeException(TypeError, "is not a function", opts);
    }
    return V;
}

// Function to confirm TypedArray or ArrayBufferView validity
function isNonSharedArrayBuffer(V) {
    try {
        Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get.call(V);
        return true;
    } catch {
        return false;
    }
}

function isSharedArrayBuffer(V) {
    try {
        Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get.call(V);
        return true;
    } catch {
        return false;
    }
}

function isArrayBufferDetached(V) {
    try {
        new Uint8Array(V);
        return false;
    } catch {
        return true;
    }
}

// Exports for ArrayBuffer, DataView, and other TypedArray types
exports.ArrayBuffer = (V, opts = {}) => {
    if (!isNonSharedArrayBuffer(V) && (!opts.allowShared || !isSharedArrayBuffer(V))) {
        throw makeException(TypeError, "is not an ArrayBuffer or SharedArrayBuffer", opts);
    }
    if (isArrayBufferDetached(V)) {
        throw makeException(TypeError, "is a detached ArrayBuffer", opts);
    }
    return V;
};

exports.DataView = (V, opts = {}) => {
    if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) {
        throw makeException(TypeError, "is backed by a SharedArrayBuffer, which is not allowed", opts);
    }
    if (isArrayBufferDetached(V.buffer)) {
        throw makeException(TypeError, "is backed by a detached ArrayBuffer", opts);
    }
    return V;
};

exports.Function = convertCallbackFunction;
exports.VoidFunction = convertCallbackFunction;

exports.ArrayBufferView = (V, opts = {}) => {
    if (!ArrayBuffer.isView(V)) {
        throw makeException(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", opts);
    }
    if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) {
        throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", opts);
    }
    if (isArrayBufferDetached(V.buffer)) {
        throw makeException(TypeError, "is a view on a detached ArrayBuffer", opts);
    }
    return V;
};

exports.BufferSource = (V, opts = {}) => {
    if (ArrayBuffer.isView(V)) {
        if (!opts.allowShared && isSharedArrayBuffer(V.buffer)) {
            throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", opts);
        }
        if (isArrayBufferDetached(V.buffer)) {
            throw makeException(TypeError, "is a view on a detached ArrayBuffer", opts);
        }
        return V;
    }
    if (!opts.allowShared && !isNonSharedArrayBuffer(V)) {
        throw makeException(TypeError, "is not an ArrayBuffer or a view on one", opts);
    }
    if (isArrayBufferDetached(V)) {
        throw makeException(TypeError, "is a detached ArrayBuffer", opts);
    }
    return V;
};

// Definitions for DOMTimeStamp and function utilities
exports.DOMTimeStamp = exports["unsigned long long"];
