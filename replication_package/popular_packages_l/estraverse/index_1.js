const estraverse = {
    VisitorOption: {
        Skip: 'skip',
        Break: 'break',
        Remove: 'remove'
    },
    
    traverse(tree, visitor) {
        function visit(node, parent) {
            let result;
            if (visitor.enter) {
                result = visitor.enter.call(visitor, node, parent);
                if (result === estraverse.VisitorOption.Break) return result;
            }

            const keys = (visitor.keys && visitor.keys[node.type]) || Object.keys(node);
            for (let key of keys) {
                let child = node[key];
                if (Array.isArray(child)) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i] && typeof child[i] === 'object') {
                            const result = visit(child[i], node);
                            if (result === estraverse.VisitorOption.Break) return result;
                        }
                    }
                } else if (child && typeof child === 'object') {
                    const result = visit(child, node);
                    if (result === estraverse.VisitorOption.Break) return result;
                }
            }

            if (visitor.leave) {
                return visitor.leave.call(visitor, node, parent);
            }
        }
        
        visit(tree, null);
    },

    replace(tree, visitor) {
        function visit(node, parent, key) {
            let result;
            if (visitor.enter) {
                result = visitor.enter.call(visitor, node, parent);
                if (result === estraverse.VisitorOption.Break) return result;
                if (result !== undefined) {
                    if (parent) parent[key] = result;
                    node = result;
                }
            }

            const keys = (visitor.keys && visitor.keys[node.type]) || Object.keys(node);
            for (let key of keys) {
                let child = node[key];
                if (Array.isArray(child)) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i] && typeof child[i] === 'object') {
                            const result = visit(child[i], node, i);
                            if (result === estraverse.VisitorOption.Break) return result;
                        }
                    }
                } else if (child && typeof child === 'object') {
                    const result = visit(child, node, key);
                    if (result === estraverse.VisitorOption.Break) return result;
                }
            }

            if (visitor.leave) {
                result = visitor.leave.call(visitor, node, parent);
                if (result !== undefined && parent) {
                    parent[key] = result;
                }
            }
        }
        
        visit(tree, null, null);
        return tree;
    }
};

module.exports = estraverse;
