// estree-walker/index.js module for traversing ASTs

function traverseAST(ast, { onEnter, onLeave }) {

    function processNode(node, parent, property, idx) {
        if (!node) return;
        
        const context = {
            skip: () => context.shouldSkip = true,
            remove: () => context.removed = true,
            replaceWith: (newNode) => {
                context.replaced = true;
                context.newNode = newNode;
            },
            shouldSkip: false,
            removed: false,
            replaced: false,
            newNode: null
        };

        if (onEnter) {
            onEnter.call(context, node, parent, property, idx);
            if (context.replaced) {
                substituteNode(parent, property, idx, context.newNode);
            }
            if (context.removed || context.shouldSkip) {
                return;
            }
        }

        const keys = Object.keys(node);
        for (const key of keys) {
            const value = node[key];
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i] && typeof value[i].type === 'string') {
                        processNode(value[i], node, key, i);
                    }
                }
            } else if (value && typeof value.type === 'string') {
                processNode(value, node, key, null);
            }
        }

        if (onLeave && !context.removed && !context.replaced) {
            onLeave.call(context, node, parent, property, idx);
            if (context.replaced) {
                substituteNode(parent, property, idx, context.newNode);
            }
            if (context.removed) {
                eliminateNode(parent, property, idx);
            }
        }
    }

    function substituteNode(parent, property, idx, newNode) {
        if (parent) {
            if (idx !== null) {
                parent[property][idx] = newNode;
            } else {
                parent[property] = newNode;
            }
        }
    }

    function eliminateNode(parent, property, idx) {
        if (parent) {
            if (idx !== null) {
                parent[property].splice(idx, 1);
            } else {
                delete parent[property];
            }
        }
    }

    processNode(ast, null, null, null);
}

module.exports = { traverseAST };
