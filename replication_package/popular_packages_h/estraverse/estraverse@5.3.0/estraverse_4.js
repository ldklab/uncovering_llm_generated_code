(function(exports) {
    'use strict';

    const Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        BinaryExpression: 'BinaryExpression',
        //... other syntax types
        YieldExpression: 'YieldExpression'
    };

    const VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        BinaryExpression: ['left', 'right'],
        //... other visitor keys
        YieldExpression: ['argument']
    };

    const VisitorOption = {
        Break: {},
        Skip: {},
        Remove: {}
    };

    function deepCopy(obj) {
        const ret = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const val = obj[key];
                ret[key] = (typeof val === 'object' && val !== null) ? deepCopy(val) : val;
            }
        }
        return ret;
    }

    function upperBound(array, func) {
        let len = array.length, i = 0;
        while (len) {
            const diff = len >>> 1;
            const current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

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
            this.node = node;
            this.path = path;
            this.wrap = wrap;
            this.ref = ref;
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
            this.__fallback = null;
            this.__keys = VisitorKeys;
            if (visitor.keys) {
                this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
            }
            if (visitor.fallback === 'iteration') {
                this.__fallback = Object.keys;
            } else if (typeof visitor.fallback === 'function') {
                this.__fallback = visitor.fallback;
            }
        }
        path() {
            if (!this.__current.path) {
                return null;
            }
            const result = [];
            for (let i = 2, iz = this.__leavelist.length; i < iz; ++i) {
                const element = this.__leavelist[i];
                if (Array.isArray(element.path)) {
                    result.push(...element.path);
                } else {
                    result.push(element.path);
                }
            }
            if (Array.isArray(this.__current.path)) {
                result.push(...this.__current.path);
            } else {
                result.push(this.__current.path);
            }
            return result;
        }
        type() {
            const node = this.current();
            return node.type || this.__current.wrap;
        }
        parents() {
            return this.__leavelist.slice(1).map(e => e.node);
        }
        current() {
            return this.__current.node;
        }
        __execute(callback, element) {
            let result = undefined;
            const previous = this.__current;
            this.__current = element;
            this.__state = null;
            if (callback) {
                result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
            }
            this.__current = previous;
            return result;
        }
        notify(flag) {
            this.__state = flag;
        }
        skip() {
            this.notify(VisitorOption.Skip);
        }
        break() {
            this.notify(VisitorOption.Break);
        }
        remove() {
            this.notify(VisitorOption.Remove);
        }
        traverse(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {};
            const worklist = this.__worklist;
            const leavelist = this.__leavelist;
            worklist.push(new Element(root, null, null, null));
            leavelist.push(new Element(null, null, null, null));

            while (worklist.length) {
                let element = worklist.pop();

                if (element === sentinel) {
                    element = leavelist.pop();
                    const ret = this.__execute(visitor.leave, element);
                    if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) return;
                    continue;
                }

                if (element.node) {
                    const ret = this.__execute(visitor.enter, element);
                    if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) return;

                    worklist.push(sentinel);
                    leavelist.push(element);

                    if (this.__state === VisitorOption.Skip || ret === VisitorOption.Skip) continue;

                    const node = element.node;
                    const nodeType = node.type || element.wrap;
                    let candidates = this.__keys[nodeType];
                    if (!candidates) {
                        if (this.__fallback) {
                            candidates = this.__fallback(node);
                        } else {
                            throw new Error('Unknown node type ' + nodeType + '.');
                        }
                    }

                    for (let i = candidates.length - 1; i >= 0; --i) {
                        const key = candidates[i];
                        const candidate = node[key];
                        if (!candidate) continue;

                        if (Array.isArray(candidate)) {
                            for (let j = candidate.length - 1; j >= 0; --j) {
                                if (!candidate[j]) continue;
                                if (elementExistsInLeaveList(leavelist, candidate[j])) continue;
                                const elem = isProperty(nodeType, key)
                                    ? new Element(candidate[j], [key, j], 'Property', null)
                                    : isNode(candidate[j])
                                    ? new Element(candidate[j], [key, j], null, null)
                                    : null;
                                if (elem) worklist.push(elem);
                            }
                        } else if (isNode(candidate)) {
                            if (elementExistsInLeaveList(leavelist, candidate)) continue;
                            worklist.push(new Element(candidate, key, null, null));
                        }
                    }
                }
            }
        }
        replace(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {};
            const worklist = this.__worklist;
            const leavelist = this.__leavelist;
            const outer = { root };
            const element = new Element(root, null, null, new Reference(outer, 'root'));
            worklist.push(element);
            leavelist.push(element);

            while (worklist.length) {
                let element = worklist.pop();

                if (element === sentinel) {
                    element = leavelist.pop();
                    const target = this.__execute(visitor.leave, element);
                    if (target !== undefined && target !== VisitorOption.Break && target !== VisitorOption.Skip && target !== VisitorOption.Remove) {
                        element.ref.replace(target);
                    }
                    if (this.__state === VisitorOption.Remove || target === VisitorOption.Remove) {
                        removeElement(element);
                        element.node = null;
                    }
                    if (this.__state === VisitorOption.Break || target === VisitorOption.Break) {
                        return outer.root;
                    }
                    continue;
                }

                const target = this.__execute(visitor.enter, element);
                if (target !== undefined && target !== VisitorOption.Break && target !== VisitorOption.Skip && target !== VisitorOption.Remove) {
                    element.ref.replace(target);
                    element.node = target;
                }
                if (this.__state === VisitorOption.Remove || target === VisitorOption.Remove) {
                    removeElement(element);
                    element.node = null;
                }
                if (this.__state === VisitorOption.Break || target === VisitorOption.Break) return outer.root;

                const node = element.node;
                if (!node) continue;

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === VisitorOption.Skip || target === VisitorOption.Skip) continue;

                const nodeType = node.type || element.wrap;
                let candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) candidates = this.__fallback(node);
                    else throw new Error('Unknown node type ' + nodeType + '.');
                }

                for (let i = candidates.length - 1; i >= 0; --i) {
                    const key = candidates[i];
                    const candidate = node[key];
                    if (!candidate) continue;
                    if (Array.isArray(candidate)) {
                        for (let j = candidate.length - 1; j >= 0; --j) {
                            if (!candidate[j]) continue;
                            const elem = isProperty(nodeType, key)
                                ? new Element(candidate[j], [key, j], 'Property', new Reference(candidate, j))
                                : isNode(candidate[j])
                                ? new Element(candidate[j], [key, j], null, new Reference(candidate, j))
                                : null;
                            if (elem) worklist.push(elem);
                        }
                    } else if (isNode(candidate)) {
                        worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    }
                }
            }
            return outer.root;
        }
    }

    function elementExistsInLeaveList(leavelist, element) {
        return leavelist.some(e => e.node === element);
    }

    function isNode(node) {
        return node != null && typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === 'properties';
    }

    function removeElement(element) {
        if (element.ref.remove()) {
            const { key, parent } = element.ref;
            for (let i = worklist.length - 1; i >= 0; --i) {
                const nextElem = worklist[i];
                if (nextElem.ref && nextElem.ref.parent === parent && nextElem.ref.key > key) {
                    nextElem.ref.key--;
                }
            }
        }
    }

    function traverse(root, visitor) {
        const controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        const controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        const target = upperBound(tokens, token => token.range[0] > comment.range[0]);
        comment.extendedRange = [comment.range[0], comment.range[1]];
        if (target !== tokens.length) comment.extendedRange[1] = tokens[target].range[0];
        if (target > 0) comment.extendedRange[0] = tokens[target - 1].range[1];
        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        if (!tree.range) throw new Error('attachComments needs range information');
        const comments = providedComments.map(comment => extendCommentRange(deepCopy(comment), tokens));
        if (!tokens.length && comments.length) {
            tree.leadingComments = comments.map(comment => ({ ...comment, extendedRange: [0, tree.range[0]] }));
            return tree;
        }
        let cursor = 0;
        traverse(tree, {
            enter(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) break;
                    if (comment.extendedRange[1] === node.range[0]) {
                        (node.leadingComments || (node.leadingComments = [])).push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === comments.length || comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Break;
                }
            }
        });
        cursor = 0;
        traverse(tree, {
            leave(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) break;
                    if (node.range[1] === comment.extendedRange[0]) {
                        (node.trailingComments || (node.trailingComments = [])).push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === comments.length || comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Break;
                }
            }
        });
        return tree;
    }

    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = () => clone({});

    function clone(obj) {
        return Object.assign({}, obj);
    }
})(typeof exports === 'undefined' ? this['exports'] = {} : exports);
