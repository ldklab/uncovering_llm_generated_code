/*
  This code is under the BSD license, allowing redistribution and use with certain conditions.
*/

(function () {
    'use strict';

    const estraverse = require('estraverse');

    function isNode(node) {
        return node && typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (
            (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) &&
            key === 'properties'
        );
    }

    class Visitor {
        constructor(visitor, options = {}) {
            this.__visitor = visitor || this;
            this.__childVisitorKeys = options.childVisitorKeys
                ? { ...estraverse.VisitorKeys, ...options.childVisitorKeys }
                : estraverse.VisitorKeys;

            if (options.fallback === 'iteration') {
                this.__fallback = Object.keys;
            } else if (typeof options.fallback === 'function') {
                this.__fallback = options.fallback;
            }
        }

        visitChildren(node) {
            if (!node) return;

            const type = node.type || estraverse.Syntax.Property;
            let children = this.__childVisitorKeys[type];

            if (!children) {
                if (this.__fallback) {
                    children = this.__fallback(node);
                } else {
                    throw new Error(`Unknown node type ${type}.`);
                }
            }

            for (const key of children) {
                const child = node[key];
                if (child) {
                    if (Array.isArray(child)) {
                        for (const element of child) {
                            if (element && (isNode(element) || isProperty(type, key))) {
                                this.visit(element);
                            }
                        }
                    } else if (isNode(child)) {
                        this.visit(child);
                    }
                }
            }
        }

        visit(node) {
            if (!node) return;

            const type = node.type || estraverse.Syntax.Property;
            if (this.__visitor[type]) {
                this.__visitor[type].call(this, node);
            } else {
                this.visitChildren(node);
            }
        }
    }

    exports.version = require('./package.json').version;
    exports.Visitor = Visitor;
    exports.visit = function (node, visitor, options) {
        const v = new Visitor(visitor, options);
        v.visit(node);
    };
})();
