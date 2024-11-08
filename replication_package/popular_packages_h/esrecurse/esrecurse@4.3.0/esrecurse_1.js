(function () {
    'use strict';
    
    const estraverse = require('estraverse');

    function isNode(node) {
        return node != null && typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) && key === 'properties';
    }

    class Visitor {
        constructor(visitor = this, options = {}) {
            this.__visitor = visitor;
            this.__childVisitorKeys = options.childVisitorKeys
                ? { ...estraverse.VisitorKeys, ...options.childVisitorKeys }
                : estraverse.VisitorKeys;
            this.__fallback = (options.fallback === 'iteration')
                ? Object.keys
                : (typeof options.fallback === 'function' ? options.fallback : undefined);
        }
        
        visitChildren(node) {
            if (node == null) return;
            
            const type = node.type || estraverse.Syntax.Property;
            let children = this.__childVisitorKeys[type] || this.__fallback?.(node);
            if (!children) throw new Error(`Unknown node type ${type}.`);

            for (const childKey of children) {
                const child = node[childKey];
                if (child) {
                    if (Array.isArray(child)) {
                        child.forEach(c => { if (c && (isNode(c) || isProperty(type, childKey))) this.visit(c); });
                    } else if (isNode(child)) {
                        this.visit(child);
                    }
                }
            }
        }
        
        visit(node) {
            if (node == null) return;
            
            const type = node.type || estraverse.Syntax.Property;
            if (typeof this.__visitor[type] === 'function') {
                this.__visitor[type](node);
            } else {
                this.visitChildren(node);
            }
        }
    }

    exports.version = require('./package.json').version;
    exports.Visitor = Visitor;
    exports.visit = (node, visitor, options) => {
        new Visitor(visitor, options).visit(node);
    };

}());
