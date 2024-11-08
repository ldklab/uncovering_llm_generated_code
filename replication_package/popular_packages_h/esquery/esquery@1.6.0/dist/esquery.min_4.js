(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.esquery = factory();
    }
}(this, function() {
    'use strict';

    function typeofEx(obj) {
        return typeof obj === "object" && obj !== null ? "object" : typeof obj;
    }
    
    function astTraverse(ast, visitFn, opts) {
        let stack = [ast];
        while (stack.length) {
            let current = stack.pop();
            if (visitFn.enter) visitFn.enter(current);
            let keys = Object.keys(current);
            for (let key of keys) {
                let value = current[key];
                if (Array.isArray(value)) {
                    stack.push(...value);
                } else if (typeofEx(value) === "object") {
                    stack.push(value);
                }
            }
            if (visitFn.leave) visitFn.leave(current);
        }
    }

    function selectorMatch(node, selector, context) {
        // A simplified matcher, replace with a more complex logic if needed
        if (selector.type === 'wildcard') return true;
        if (selector.type === 'identifier' && node.type === selector.value) return true;
        return false;
    }

    function astQuery(ast, query, context) {
        let results = [];
        astTraverse(ast, {
            enter: function(node) {
                if (selectorMatch(node, query, context)) {
                    results.push(node);
                }
            }
        });
        return results;
    }

    function parseSelector(selector) {
        // Mock parse function. Replace with actual parsing logic if needed
        return { type: 'identifier', value: selector };
    }

    function query(ast, selector) {
        let parsedSelector = parseSelector(selector);
        return astQuery(ast, parsedSelector);
    }

    return {
        query: query,
        parseSelector: parseSelector,
        astTraverse: astTraverse
    };
}));
