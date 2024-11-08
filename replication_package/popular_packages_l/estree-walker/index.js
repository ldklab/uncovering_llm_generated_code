// estree-walker/index.js

function walk(ast, { enter, leave }) {

    function visit(node, parent, prop, index) {
        if (!node) return;
        
        let context = {
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
                replaceNode(parent, prop, index, context.newNode);
            }
            if (context.removed || context.shouldSkip) {
                return;
            }
        }

        let keys = Object.keys(node);
        for (let key of keys) {
            let value = node[key];
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i] && typeof value[i].type === 'string') {
                        visit(value[i], node, key, i);
                    }
                }
            } else if (value && typeof value.type === 'string') {
                visit(value, node, key, null);
            }
        }

        if (leave && !context.removed && !context.replaced) {
            leave.call(context, node, parent, prop, index);
            if (context.replaced) {
                replaceNode(parent, prop, index, context.newNode);
            }
            if (context.removed) {
                removeNode(parent, prop, index);
            }
        }
    }

    function replaceNode(parent, prop, index, newNode) {
        if (parent) {
            if (index !== null) {
                parent[prop][index] = newNode;
            } else {
                parent[prop] = newNode;
            }
        }
    }

    function removeNode(parent, prop, index) {
        if (parent) {
            if (index !== null) {
                parent[prop].splice(index, 1);
            } else {
                delete parent[prop];
            }
        }
    }

    visit(ast, null, null, null);
}

module.exports = { walk };
