const estraverse = {
    VisitorOption: {
        Skip: 'skip',
        Break: 'break',
        Remove: 'remove'
    },

    traverse: function (ast, visitor) {
        const visitNode = (node, parent) => {
            let result;
            if (visitor.enter) {
                result = visitor.enter.call(visitor, node, parent);
                if (result === estraverse.VisitorOption.Break) return result;
            }

            const keys = (visitor.keys && visitor.keys[node.type]) || Object.keys(node);
            for (const key of keys) {
                const child = node[key];
                
                if (Array.isArray(child)) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i] && typeof child[i] === 'object') {
                            result = visitNode(child[i], node);
                            if (result === estraverse.VisitorOption.Break) return result;
                        }
                    }
                } else if (child && typeof child === 'object') {
                    result = visitNode(child, node);
                    if (result === estraverse.VisitorOption.Break) return result;
                }
            }
            
            if (visitor.leave) {
                return visitor.leave.call(visitor, node, parent);
            }
        };
        
        visitNode(ast, null);
    },

    replace: function (ast, visitor) {
        const visitNode = (node, parent, key) => {
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
            for (const key of keys) {
                const child = node[key];
                
                if (Array.isArray(child)) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i] && typeof child[i] === 'object') {
                            result = visitNode(child[i], node, i);
                            if (result === estraverse.VisitorOption.Break) return result;
                        }
                    }
                } else if (child && typeof child === 'object') {
                    result = visitNode(child, node, key);
                    if (result === estraverse.VisitorOption.Break) return result;
                }
            }

            if (visitor.leave) {
                result = visitor.leave.call(visitor, node, parent);
                if (result !== undefined && parent) {
                    parent[key] = result;
                }
            }
        };
        
        visitNode(ast, null, null);
        return ast;
    }
};

module.exports = estraverse;
