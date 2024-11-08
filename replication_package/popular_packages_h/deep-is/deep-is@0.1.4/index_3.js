const arraySlice = Array.prototype.slice;
const getObjectKeys = typeof Object.keys === 'function'
    ? Object.keys
    : function (obj) {
        const keys = [];
        for (const key in obj) keys.push(key);
        return keys;
    };

const deepEqual = module.exports = function (actual, expected) {
    if (actual === 0 && expected === 0) {
        return areZerosEqual(actual, expected);
    } else if (actual === expected) {
        return true;
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
    } else if (isNumberNaN(actual)) {
        return isNumberNaN(expected);
    } else if (typeof actual !== 'object' && typeof expected !== 'object') {
        return actual == expected;
    } else {
        return objectsEquivalent(actual, expected);
    }
};

function isUndefinedOrNull(value) {
    return value === null || value === undefined;
}

function isArguments(object) {
    return Object.prototype.toString.call(object) === '[object Arguments]';
}

function isNumberNaN(value) {
    return typeof value === 'number' && value !== value;
}

function areZerosEqual(zeroA, zeroB) {
    return (1 / zeroA) === (1 / zeroB);
}

function objectsEquivalent(a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;

    if (a.prototype !== b.prototype) return false;

    if (isArguments(a)) {
        if (!isArguments(b)) return false;
        a = arraySlice.call(a);
        b = arraySlice.call(b);
        return deepEqual(a, b);
    }

    try {
        var keysA = getObjectKeys(a);
        var keysB = getObjectKeys(b);
    } catch (e) {
        return false;
    }

    if (keysA.length !== keysB.length) return false;

    keysA.sort();
    keysB.sort();

    for (let i = keysA.length - 1; i >= 0; i--) {
        if (keysA[i] !== keysB[i]) return false;
    }

    for (let i = keysA.length - 1; i >= 0; i--) {
        const key = keysA[i];
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
}
