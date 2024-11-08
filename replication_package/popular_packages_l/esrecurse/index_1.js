class Visitor {
    constructor(visitorConfig = {}, { childKeys = {}, fallbackMethod = null } = {}) {
        this.visitorConfig = visitorConfig;
        this.childKeys = childKeys;
        this.fallbackMethod = fallbackMethod;
        this.visited = new Set();
    }

    visit(node) {
        if (!node || typeof node !== 'object' || this.visited.has(node)) return;

        this.visited.add(node);
        const visitorFunction = this.visitorConfig[node.type];
        if (visitorFunction) visitorFunction.call(this, node);

        this.traverseChildren(node);
    }

    traverseChildren(node) {
        const keys = this.determineKeys(node);
        for (const key of keys) {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(subNode => this.visit(subNode));
            } else {
                this.visit(child);
            }
        }
    }

    determineKeys(node) {
        if (this.fallbackMethod === 'iteration') {
            return Object.keys(node);
        } else if (typeof this.fallbackMethod === 'function') {
            return this.fallbackMethod(node);
        }
        return this.childKeys[node.type] || [];
    }
}

function traverseAST(ast, visitorRules, options) {
    const traversal = new Visitor(visitorRules, options);
    traversal.visit(ast);
}

// Example usage
const astSample = {
    type: 'Program',
    body: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]
};

traverseAST(astSample, {
    Literal(node) {
        console.log(`Found literal with value: ${node.value}`);
    }
}, { fallbackMethod: 'iteration' });

module.exports = { Visitor, traverseAST };
