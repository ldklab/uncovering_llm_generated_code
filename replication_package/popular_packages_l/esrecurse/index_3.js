const util = require('util');

class Visitor {
    constructor(visitor, options = {}) {
        this.visitor = visitor || {};
        this.childVisitorKeys = options.childVisitorKeys || {};
        this.fallback = options.fallback || null;
        this.visitedNodes = new Set();
    }

    visit(node) {
        if (!node || typeof node !== 'object' || this.visitedNodes.has(node)) return;
        
        this.visitedNodes.add(node);
        const nodeType = node.type;
        const visitFn = this.visitor[nodeType] || null;

        if (visitFn) {
            visitFn.call(this, node);
        }
        
        this.visitChildren(node);
    }

    visitChildren(node) {
        const keys = this.getVisitKeys(node);
        for (const key of keys) {
            const childNode = node[key];
            if (Array.isArray(childNode)) {
                for (const cn of childNode) {
                    this.visit(cn);
                }
            } else {
                this.visit(childNode);
            }
        }
    }

    getVisitKeys(node) {
        let keys = this.childVisitorKeys[node.type] || [];
        if (this.fallback === 'iteration') {
            keys = Object.keys(node);
        } else if (typeof this.fallback === 'function') {
            keys = this.fallback(node);
        }
        return keys;
    }
}

function visit(ast, visitor, options) {
    const visitorInstance = new Visitor(visitor, options);
    visitorInstance.visit(ast);
}

// Example usage
const ast = {
    type: 'Program',
    body: [
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 }
    ]
};

visit(ast, {
    Literal(node) {
        console.log(`Found literal with value: ${node.value}`);
    }
}, {
    fallback: 'iteration'
});

module.exports = {
    Visitor,
    visit
};
