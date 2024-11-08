// estree-walker/index.js

function walk(ast, { enter, leave }) {

    function traverse(node, parent, prop, index) {
        if (!node) return;

        const context = {
            skip: () => context.shouldSkip = true,
            remove: () => context.removed = true,
            replace: (newNode) => {
                context.replaced = true;
                context.newNode = newNode;
            },
            shouldSkip: false,
            removed: false,
            replaced: false,
            newNode: null
        };

        if (enter) {
            enter.call(context, node, parent, prop, index);
            if (context.replaced) {
                updateNode(parent, prop, index, context.newNode);
            }
            if (context.removed || context.shouldSkip) return;
        }

        for (const key of Object.keys(node)) {
            const value = node[key];
            if (Array.isArray(value)) {
                value.forEach((child, i) => {
                    if (child && typeof child.type === 'string') {
                        traverse(child, node, key, i);
                    }
                });
            } else if (value && typeof value.type === 'string') {
                traverse(value, node, key, null);
            }
        }

        if (leave && !context.removed && !context.replaced) {
            leave.call(context, node, parent, prop, index);
            if (context.replaced) {
                updateNode(parent, prop, index, context.newNode);
            }
            if (context.removed) {
                deleteNode(parent, prop, index);
            }
        }
    }

    function updateNode(parent, prop, index, newNode) {
        if (parent) {
            if (index !== null) {
                parent[prop][index] = newNode;
            } else {
                parent[prop] = newNode;
            }
        }
    }

    function deleteNode(parent, prop, index) {
        if (parent) {
            if (index !== null) {
                parent[prop].splice(index, 1);
            } else {
                delete parent[prop];
            }
        }
    }

    traverse(ast, null, null, null);
}

module.exports = { walk };
