'use strict';

module.exports = function (data, options) {
    // Initialize options if not provided
    options = options || {};
    
    // If options is a function, assume it is the comparator
    if (typeof options === 'function') {
        options = { comparator: options };
    }

    // Determine if cycles are allowed
    const allowCycles = typeof options.cycles === 'boolean' ? options.cycles : false;

    // Prepare comparator function if provided
    const comparator = options.comparator ? createComparator(options.comparator) : null;

    const visitedNodes = [];

    return (function stringify(node) {
        // Handle objects with toJSON method
        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        // Handle primitive types and undefined
        if (node === undefined) {
            return undefined;
        }
        if (typeof node === 'number') {
            return isFinite(node) ? String(node) : 'null';
        }
        if (typeof node !== 'object') {
            return JSON.stringify(node);
        }

        // Handle arrays
        if (Array.isArray(node)) {
            const arrayOutput = node.map(item => stringify(item) || 'null');
            return `[${arrayOutput.join(',')}]`;
        }

        // Handle null
        if (node === null) {
            return 'null';
        }

        // Check for circular references
        if (visitedNodes.includes(node)) {
            if (allowCycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        // Add current object to visited nodes
        visitedNodes.push(node);
        const keys = Object.keys(node).sort(comparator && comparator(node));
        const objectOutput = keys.reduce((accum, key) => {
            const value = stringify(node[key]);
            if (value !== undefined) {
                accum.push(`${JSON.stringify(key)}:${value}`);
            }
            return accum;
        }, []);
        
        // Remove current object from visited nodes
        visitedNodes.pop();
        return `{${objectOutput.join(',')}}`;
    })(data);
  
    // Helper function to create a comparator
    function createComparator(func) {
        return function (node) {
            return function (keyA, keyB) {
                const a = { key: keyA, value: node[keyA] };
                const b = { key: keyB, value: node[keyB] };
                return func(a, b);
            };
        };
    }
};
