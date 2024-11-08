(function(global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = global || self).esquery = factory();
    }
}(this, function() {
    'use strict';

    function getType(item) {
        return (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
            ? function(obj) { return typeof obj; }
            : function(obj) {
                return obj && typeof Symbol === 'function' && obj.constructor === Symbol &&
                obj !== Symbol.prototype ? "symbol" : typeof obj;
            }
        )(item);
    }

    function safeArrayConversion(input, length) {
        if (Array.isArray(input)) return input;
        if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(input))) return [];
        let result = [], done = false, error;
        try {
            for (let iterator = input[Symbol.iterator](), step; !done; ) {
                step = iterator.next();
                if (step.done || result.length === length) done = true;
                else result.push(step.value);
            }
        } catch (err) {
            error = err;
            done = true;
        } finally {
            if (!done) throw error;
        }
        return result;
    }

    function oneOrArray(item, count) {
        if (Array.isArray(item)) return item;
        if (typeof Symbol !== "undefined" && Symbol.iterator in Object(item)) return Array.from(item);
        return arrayLikeToArray(item, count);
    }

    function arrayLikeToArray(arr, len) {
        if (arr == null) return;
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
    }

    // Placeholder for global detection
    const globalObject = "undefined" !== typeof globalThis ? globalThis : "undefined" !== typeof window ? window : 
                         "undefined" !== typeof global ? global : "undefined" !== typeof self && self;

    function importHandler(mod, temp) {
        mod(temp = { exports: {} }, temp.exports);
        return temp.exports;
    }

    const coreFunctionality = importHandler(function(module, exports) {
        !function(exports) {
            let ASTNodeTypes = {
                AssignmentExpression: "AssignmentExpression", // Different node types...
            };
            
            let VisitorKeys = {
                AssignmentExpression: ["left", "right"],
            };

            // Functions handling AST traversal and modification...
            function cloneDeep(obj) { /* deep cloning logic */ }
            function traverseAST(node, callback) { /* Traversal logic */ }
            function replaceAST(node, visitor) { /* Replacement logic */ }

            let ESQueryController = function() { /* Controller for traversal */ };

            // exports for the module
            exports.Syntax = ASTNodeTypes;
            exports.traverse = traverseAST;
            exports.replace = replaceAST;
            exports.Controller = ESQueryController;

        }(exports);
    });

    const parser = importHandler(function(module) {
        module.exports = function() {
            function SyntaxError(message, expected, found, location) {
                this.message = message;
                this.expected = expected;
                this.found = found;
                this.location = location;
                this.name = 'SyntaxError';
                if (typeof Error.captureStackTrace === 'function') Error.captureStackTrace(this, SyntaxError);
            }

            // Prototype inheritance for the syntax errors...
            SyntaxError.buildMessage = function(expected, found) {
                // Builds error message logic for parsing...
                return "Expected " + expected + " but " + found + " found.";
            };

            return {
                SyntaxError: SyntaxError,
                parse: function(input, options) {
                    options = options !== undefined ? options : {};
                    let startRule;
                    // ... Parsing logic goes here ...
                }
            };
        }();
    });

    const esquery = (function() {
        const defaults = {
            // preset defaults
        };

        function matches(node, selector, ancestry) {
            // ... pattern matching logic ...
        }

        function query(tree, selector) {
            let parsedSelector = parser.parse(selector);
            let results = [];
            coreFunctionality.traverse(tree, {
                enter: function (node, parents) {
                    // ... query logic ...
                }
            });
            return results;
        }

        function parse(selector) {
            return parser.parse(selector);
        }

        query.parse = parse;
        query.matches = matches;
        query.traverse = coreFunctionality.traverse;
        
        return query;

    })();

    return esquery;

}));
//# sourceMappingURL=esquery.min.js.map
