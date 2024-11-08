(function cli() {
    "use strict";

    const Syntax = {
        AssignmentExpression: "AssignmentExpression",
        AssignmentPattern: "AssignmentPattern",
        // ... other node types
        YieldExpression: "YieldExpression"
    };

    const VisitorKeys = {
        AssignmentExpression: ["left", "right"],
        AssignmentPattern: ["left", "right"],
        // ... other node visitation keys
        YieldExpression: ["argument"]
    };

    const VisitorOption = {
        Break: "BREAK",
        Skip: "SKIP",
        Remove: "REMOVE"
    };

    class Reference {
        constructor(parent, key) {
            this.parent = parent;
            this.key = key;
        }
        replace(node) {
            this.parent[this.key] = node;
        }
        remove() {
            if (Array.isArray(this.parent)) {
                this.parent.splice(this.key, 1);
                return true;
            } else {
                this.replace(null);
                return false;
            }
        }
    }

    class Element {
        constructor(node, path, wrap, ref) {
            Object.assign(this, { node, path, wrap, ref });
        }
    }

    class Controller {
        __initialize(root, visitor) {
            this.visitor = visitor;
            this.root = root;
            this.__worklist = [];
            this.__leavelist = [];
            this.__current = null;
            this.__state = null;
            this.__fallback = visitor.fallback === "iteration" ? Object.keys : visitor.fallback;
            this.__keys = Object.assign(Object.create(VisitorKeys), visitor.keys || {});
        }

        traverse(root, visitor) {
            this.__initialize(root, visitor);

            const sentinel = {};
            this.__worklist.push(new Element(root, null, null, null));
            this.__leavelist.push(new Element(null, null, null, null));

            while (this.__worklist.length) {
                let element = this.__worklist.pop();

                if (element === sentinel) {
                    element = this.__leavelist.pop();
                    const ret = this.__execute(visitor.leave, element);
                    if (this.__state === "BREAK" || ret === VisitorOption.Break) return;
                    continue;
                }

                const ret = this.__execute(visitor.enter, element);
                if (this.__state === "BREAK" || ret === VisitorOption.Break) return;

                if (element.node) {
                    this.__worklist.push(sentinel);
                    this.__leavelist.push(element);

                    if (this.__state === "SKIP" || ret === VisitorOption.Skip) continue;

                    const node = element.node;
                    const keys = this.__keys[node.type] || this.__fallback(node);
                    if (!keys) throw new Error("Unknown node type " + node.type);

                    for (const key of keys.reverse()) {
                        const candidate = node[key];
                        if (!candidate) continue;

                        for (let i = candidate.length - 1; i >= 0; i--) {
                            if (!candidate[i]) continue;
                            if (Array.isArray(candidate)) {
                                this.__worklist.push(new Element(candidate[i], [key, i], null, null));
                            } else if (typeof candidate === "object") {
                                this.__worklist.push(new Element(candidate, [key], null, null));
                            }
                        }
                    }
                }
            }
            return root;
        }

        replace(root, visitor) {
            this.__initialize(root, visitor);

            const sentinel = {};
            const element = new Element(root, null, null, new Reference({ root }, 'root'));
            this.__worklist.push(element);
            this.__leavelist.push(element);

            while (this.__worklist.length) {
                let element = this.__worklist.pop();

                if (element === sentinel) {
                    element = this.__leavelist.pop();
                    let target = this.__execute(visitor.leave, element);
                    if (target !== undefined && target !== VisitorOption.Break) {
                        element.ref.replace(target);
                        element.node = target;
                    }
                    if (this.__state === VisitorOption.Remove) this.__removeElement(element);
                    if (this.__state === "BREAK" || target === VisitorOption.Break) return root;
                    continue;
                }

                let target = this.__execute(visitor.enter, element);
                if (target !== undefined && target !== VisitorOption.Break) {
                    element.ref.replace(target);
                    element.node = target;
                }
                if (this.__state === VisitorOption.Remove) this.__removeElement(element);

                if (this.__state === "BREAK" || target === VisitorOption.Break) return root;

                const node = element.node;
                if (!node) continue;

                this.__worklist.push(sentinel);
                this.__leavelist.push(element);

                if (this.__state === "SKIP" || target === VisitorOption.Skip) continue;

                const keys = this.__keys[node.type] || this.__fallback(node);
                if (!keys) throw new Error("Unknown node type " + node.type);

                for (const key of keys.reverse()) {
                    const candidate = node[key];
                    if (!candidate) continue;

                    for (let i = candidate.length - 1; i >= 0; i--) {
                        if (!candidate[i]) continue;
                        if (Array.isArray(candidate)) {
                            this.__worklist.push(new Element(candidate[i], [key, i], null, new Reference(candidate, i)));
                        } else if (typeof candidate === "object") {
                            this.__worklist.push(new Element(candidate, [key], null, new Reference(node, key)));
                        }
                    }
                }
            }
            return root;
        }

        __removeElement(element) {
            if (element.ref.remove()) {
                const key = element.ref.key;
                const parent = element.ref.parent;
                for (let i = this.__worklist.length - 1; i >= 0; i--) {
                    const nextElem = this.__worklist[i];
                    if (nextElem.ref && nextElem.ref.parent === parent && nextElem.ref.key > key) {
                        --nextElem.ref.key;
                    }
                }
            }
        }

        __execute(callback, element) {
            const previous = this.__current;
            this.__current = element;
            this.__state = null;
            const result = callback ? callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node) : undefined;
            this.__current = previous;
            return result;
        }
    }

    function traverse(root, visitor) {
        return new Controller().traverse(root, visitor);
    }

    function replace(root, visitor) {
        return new Controller().replace(root, visitor);
    }

    function attachComments(tree, comments, tokens) {
        if (!tree.range) throw new Error("Tree must have range information to attach comments");
        
        const extendedComments = comments.map((comment) => extendCommentRange(deepCopy(comment), tokens));

        let cursor = 0;
        traverse(tree, {
            enter: (node) => {
                while (cursor < extendedComments.length) {
                    const comment = extendedComments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) break;

                    if (comment.extendedRange[1] === node.range[0]) {
                        node.leadingComments = node.leadingComments || [];
                        node.leadingComments.push(comment);
                        extendedComments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === extendedComments.length) return VisitorOption.Break;
                if (extendedComments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: (node) => {
                while (cursor < extendedComments.length) {
                    const comment = extendedComments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) break;

                    if (node.range[1] === comment.extendedRange[0]) {
                        node.trailingComments = node.trailingComments || [];
                        node.trailingComments.push(comment);
                        extendedComments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === extendedComments.length) return VisitorOption.Break;
                if (extendedComments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });

        return tree;
    }

    function extendCommentRange(comment, tokens) {
        let target = upperBound(tokens, (token) => token.range[0] > comment.range[0]);

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }
        target--;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function upperBound(array, func) {
        let i = 0;
        for (let len = array.length; len; len >>= 1) {
            const current = i + (len >> 1);
            if (func(array[current])) len >>= 1;
            else i = current + 1;
        }
        return i;
    }

    function deepCopy(obj) {
        return Object.entries(obj).reduce((copy, [key, value]) => {
            copy[key] = (typeof value === 'object' && value !== null) ? deepCopy(value) : value;
            return copy;
        }, {});
    }

    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = () => cli();

})();
