'use strict';

const estraverse = require('estraverse');

class Visitor {
    constructor(visitor = this, options = {}) {
        this.__visitor = visitor;
        this.__childVisitorKeys = options.childVisitorKeys 
            ? {...estraverse.VisitorKeys, ...options.childVisitorKeys} 
            : estraverse.VisitorKeys;
            
        this.__fallback = options.fallback === 'iteration' 
            ? Object.keys 
            : options.fallback;
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

        for (let i = 0; i < children.length; i++) {
            const child = node[children[i]];
            if (child) {
                if (Array.isArray(child)) {
                    for (let j = 0; j < child.length; j++) {
                        if (child[j] && (isNode(child[j]) || isProperty(type, children[i]))) {
                            this.visit(child[j]);
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

function isNode(node) {
    return node != null && typeof node === 'object' && typeof node.type === 'string';
}

function isProperty(nodeType, key) {
    return (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) && key === 'properties';
}

exports.version = require('./package.json').version;
exports.Visitor = Visitor;
exports.visit = function(node, visitor, options) {
    const v = new Visitor(visitor, options);
    v.visit(node);
};
