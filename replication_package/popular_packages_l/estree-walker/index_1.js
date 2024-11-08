// estree-walker/index.js

function walk(ast, { enter, leave }) {

    function visit(node, parent = null, prop = null, index = null) {
        if (!node) return;

        const context = {
            skip() { this.shouldSkip = true; },
            remove() { this.removed = true; },
            replace(newNode) {
                this.replaced = true;
                this.newNode = newNode;
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

        for (const key of Object.keys(node)) {
            const value = node[key];
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i] && typeof value[i].type === 'string') {
                        visit(value[i], node, key, i);
                    }
                }
            } else if (value && typeof value.type === 'string') {
                visit(value, node, key);
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

    visit(ast);
}

module.exports = { walk };
