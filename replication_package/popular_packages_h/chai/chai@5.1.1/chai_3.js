// Utility functions for creating properties, methods, and defining behavior.
function defineProperty(obj, name, descriptor) {
    Object.defineProperty(obj, name, descriptor);
}

function defineMethod(ctx, name, method) {
    ctx[name] = function(...args) {
        return method.apply(this, args);
    };
}

// Helper function for checking types and comparisons
function isType(obj, type) {
    return typeof obj === type;
}

function isEqual(a, b) {
    return a === b;
}

function isDeepEqual(a, b) {
    // Simplified deep equal function
    return JSON.stringify(a) === JSON.stringify(b);
}

// AssertionError class to handle error messages in assertions
class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = "AssertionError";
    }
}

// Main Assertion class to define assertion methods and utility
class Assertion {
    constructor(obj, message) {
        this.object = obj;
        this.message = message;
    }

    assert(condition, successMessage, errorMessage) {
        if (!condition) {
            throw new AssertionError(errorMessage.replace('#{this}', this.object));
        }
    }

    equal(val) {
        this.assert(
            isEqual(this.object, val),
            `expected #{this} to equal ${val}`,
            `expected #{this} not to equal ${val}`
        );
    }

    deepEqual(val) {
        this.assert(
            isDeepEqual(this.object, val),
            `expected #{this} to deeply equal ${val}`,
            `expected #{this} not to deeply equal ${val}`
        );
    }

    isType(type) {
        this.assert(
            isType(this.object, type),
            `expected #{this} to be of type ${type}`,
            `expected #{this} not to be of type ${type}`
        );
    }

    exists() {
        this.assert(
            this.object !== null && this.object !== undefined,
            "expected #{this} to exist",
            "expected #{this} not to exist"
        );
    }
}

// Exposing a method to use assertions
function expect(obj) {
    return new Assertion(obj);
}

// Assertion framework interface
const assert = {
    equal: (actual, expected, message) => new Assertion(actual, message).equal(expected),
    notEqual: (actual, expected, message) => new Assertion(actual, message).assert(!isEqual(actual, expected), "", "expected values not to be equal"),
    exists: (obj, message) => new Assertion(obj, message).exists()
};

module.exports = {
    Assertion,
    AssertionError,
    expect,
    assert
};
