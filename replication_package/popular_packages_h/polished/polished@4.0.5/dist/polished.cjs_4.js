'use strict';

import { max, min } from 'math';

// Math operations
function last(args) {
    let lastIndex = args.length - 1;
    return args[lastIndex];
}

function basicOperations(a, b, operation) {
    switch (operation) {
        case 'addition': return a + b;
        case 'subtraction': return a - b;
        case 'multiplication': return a * b;
        case 'division': return a / b;
        default: return 0;
    }
}

// Simple math functions
function negate(a) {
    return -a;
}

function maxVariation() {
    return Math.max(...arguments);
}

function minVariation() {
    return Math.min(...arguments);
}

function listCommaSeparated() {
    return Array.of(...arguments);
}

// Default symbols for basic operations
const defaultSymbols = {
    '+': {
        infix: { symbol: '+', operation: 'addition', precedence: 2 },
        prefix: { symbol: '+', operation: last, precedence: 3 }
    },
    '-': {
        infix: { symbol: '-', operation: 'subtraction', precedence: 2 },
        prefix: { symbol: '-', operation: negate, precedence: 3 }
    },
    '*': { infix: { symbol: '*', operation: 'multiplication', precedence: 4 } },
    '/': { infix: { symbol: '/', operation: 'division', precedence: 4 } },
};

// Errors map
const ERRORS = {
    "1": "Passed invalid arguments to hsl...",
    // continues for various codes...
};

// Error Handling
function PolishedError(code, ...args) {
    const message = ERRORS[code];
    console.error(`Error ${code}: ${message}`, ...args);
    return new Error(`Error ${code}: ${message}`);
}

// Helper functions
function generateStyles(property, values) {
    const styles = {};
    values.forEach((value, i) => {
        if (value || value === 0) {
            styles[`${property}${positionMap[i]}`] = value;
        }
    });
    return styles;
}

function directionalProperty(property, ...values) {
    const [firstValue, secondValue, thirdValue, fourthValue] = values;
    return generateStyles(property, [firstValue, secondValue ?? firstValue, thirdValue ?? firstValue, fourthValue ?? secondValue ?? firstValue]);
}

// Export functions for modular usage
export {
    last,
    basicOperations,
    negate,
    maxVariation,
    minVariation,
    listCommaSeparated,
    defaultSymbols,
    PolishedError,
    generateStyles,
    directionalProperty
};
