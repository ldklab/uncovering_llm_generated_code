// typed-array-byte-offset.js
function isTypedArray(obj) {
    return ArrayBuffer.isView(obj) && obj instanceof TypedArray;
}

function typedArrayByteOffset(obj) {
    if (!isTypedArray(obj)) {
        return false;
    }
    return obj.byteOffset;
}

module.exports = typedArrayByteOffset;

// test/index.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

function testNonTypedArrayInputs() {
    const nonTypedInputs = [
        undefined, null, false, true, [], {}, /a/g, 
        new RegExp('a', 'g'), new Date(), 42, NaN, 
        Infinity, new Number(42), 'foo', Object('foo'), 
        function () {}, function* () {}, x => x * x
    ];

    nonTypedInputs.forEach(input => {
        assert.equal(false, typedArrayByteOffset(input));
    });
}

function testTypedArrayInputs() {
    const buffer = new ArrayBuffer(32);

    const cases = [
        { arr: new Int8Array(buffer, 8), expected: 8 },
        { arr: new Uint8Array(buffer, 8), expected: 8 },
        { arr: new Uint8ClampedArray(buffer, 8), expected: 8 },
        { arr: new Int16Array(buffer, 4), expected: 4 },
        { arr: new Uint16Array(buffer, 4), expected: 4 },
        { arr: new Int32Array(buffer, 8), expected: 8 },
        { arr: new Uint32Array(buffer, 8), expected: 8 },
        { arr: new Float32Array(buffer, 16), expected: 16 },
        { arr: new Float64Array(buffer, 16), expected: 16 },
        { arr: new BigInt64Array(buffer, 16), expected: 16 },
        { arr: new BigUint64Array(buffer, 16), expected: 16 }
    ];

    cases.forEach(({ arr, expected }) => {
        assert.equal(expected, typedArrayByteOffset(arr));
    });
}

testNonTypedArrayInputs();
testTypedArrayInputs();
