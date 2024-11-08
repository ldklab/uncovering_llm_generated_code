(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = global || self).esquery = factory();
    }
}(this, function() {
    'use strict';

    function getType(value) {
        return typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? typeof value : ((value && typeof Symbol === 'function' && value.constructor === Symbol && value !== Symbol.prototype) ? 'symbol' : typeof value);
    }

    function destructure(array, length) {
        if (Array.isArray(array)) return array;
        if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(array))) return;
        const result = [];
        let iter = array[Symbol.iterator]();
        let step;
        while (!(step = iter.next()).done && result.length !== length) {
            result.push(step.value);
        }
        return result;
    }

    function spread(array) {
        if (Array.isArray(array)) return Array.from(array);
        if (typeof Symbol !== 'undefined' && Symbol.iterator in Object(array)) return Array.from(array);
        return [].slice.call(array);
    }

    var exports = (function(module) {
        // Placeholder for AST types and traversal functions
        const Syntax = { /* Node types */ };
        const VisitorKeys = { /* Node relationships */ };
        const VisitorOption = { Break: {}, Skip: {}, Remove: {} };
        const Controller = function() {
            // Implementation for AST traversal
        };

        function traverse(ast, visitor) {
            // Traversal logic
        }

        function query(ast, selector) {
            // Logic to match nodes
        }

        function parse(selector) {
            // Parse selector into an AST representation for querying
        }

        return {
            Syntax,
            traverse,
            query,
            parse,
            VisitorKeys,
            VisitorOption,
            Controller
        };
    })({});

    return exports;

}));
//# sourceMappingURL=esquery.min.js.map
