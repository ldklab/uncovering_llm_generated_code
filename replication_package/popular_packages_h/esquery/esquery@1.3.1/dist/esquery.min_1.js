(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = global || self).esquery = factory();
    }
}(this, (function () {
    'use strict';

    // Type checking utility
    function getType(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
            return typeof obj === 'symbol' ? 'symbol' : typeof obj;
        }
        return typeof obj;
    }

    // Function to handle array-like destructuring
    function destructureArray(arr, count) {
        if (Array.isArray(arr)) return arr;
        if (Symbol.iterator in Object(arr)) {
            const result = [];
            for (const item of arr) {
                result.push(item);
                if (result.length === count) break;
            }
            return result;
        }
        throw new Error("Invalid attempt to destructure non-iterable instance.");
    }

    // Function to handle spread operation for non-array iterables
    function spreadObject(obj) {
        if (Array.isArray(obj)) return obj;
        if (Symbol.iterator in Object(obj)) return Array.from(obj);
        throw new Error("Invalid attempt to spread non-iterable instance.");
    }

    // Polyfill for globalThis
    const globalScope = typeof globalThis !== 'undefined' ? globalThis :
        typeof window !== 'undefined' ? window :
        typeof global !== 'undefined' ? global :
        typeof self !== 'undefined' ? self : {};

    // Function for creating a module
    function createModule(fn) {
        const exports = { exports: {} };
        fn(exports, exports.exports);
        return exports.exports;
    }

    // Main esquery module
    const esquery = createModule((module, exports) => {
        'use strict';

        function matchNode(node, selector) {
            // Logic for matching node goes here
            // Placeholder as the actual implementation is complex
            if (selector.type === 'wildcard') return true;
            // Implement other selector matching
            return false;
        }

        // Traverse and apply a callback function on each node
        function traverse(ast, visitor) {
            // Simplified traversal logic
            const stack = [ast];
            while (stack.length) {
                const node = stack.pop();
                if (node) {
                    visitor.enter && visitor.enter(node);
                    stack.push(...Object.values(node));
                    visitor.leave && visitor.leave(node);
                }
            }
        }

        // Main query function
        function query(ast, selector) {
            const parsedSelector = parse(selector);
            const results = [];
            traverse(ast, {
                enter: node => {
                    if (matchNode(node, parsedSelector)) {
                        results.push(node);
                    }
                }
            });
            return results;
        }

        // Simple parser placeholder
        function parse(selector) {
            // This would be more complex in a real implementation
            return { type: selector };
        }

        // Export the primary function
        return { query, parse };
    });

    return esquery;

})));
