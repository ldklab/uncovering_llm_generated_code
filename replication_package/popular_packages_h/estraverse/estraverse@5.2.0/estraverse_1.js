/* eslint-env node */
(function clone(exports) {
    'use strict';

    const Syntax = {},
        VisitorOption = {},
        VisitorKeys = {},
        BREAK = {},
        SKIP = {},
        REMOVE = {};

    function deepCopy(obj) {
        const ret = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const val = obj[key];
                ret[key] = (typeof val === 'object' && val !== null) ? deepCopy(val) : val;
            }
        }
        return ret;
    }

    function upperBound(array, func) {
        let diff, len = array.length, i = 0;
        while (len) {
            diff = len >>> 1;
            const current = i + diff;
            if (func(array[current])) len = diff;
            else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    Object.assign(Syntax, {
        AssignmentExpression: 'AssignmentExpression',
        // ... (other syntax types)
        YieldExpression: 'YieldExpression'
    });

    Object.assign(VisitorKeys, {
        AssignmentExpression: ['left', 'right'],
        // ... (other visitor keys)
        YieldExpression: ['argument']
    });

    Object.assign(VisitorOption, {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
    });

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
        constructor() { }
        path() {
            if (!this.__current.path) return null;
            const result = [];
            this.__leavelist.forEach((element, i) => {
                if (i > 1) result.push(...element.path);
            });
            result.push(...this.__current.path);
            return result;
        }
        type() {
            const node = this.current();
            return node.type || this.__current.wrap;
        }
        parents() {
            return this.__leavelist.slice(1).map(el => el.node);
        }
        current() {
            return this.__current.node;
        }
        __execute(callback, element) {
            const previous = this.__current;
            this.__current = element;
            this.__state = null;
            const result = callback ? callback.call(this, element.node, this.__leavelist.at(-1).node) : undefined;
            this.__current = previous;
            return result;
        }
        notify(flag) {
            this.__state = flag;
        }
        skip() {
            this.notify(SKIP);
        }
        break() {
            this.notify(BREAK);
        }
        remove() {
            this.notify(REMOVE);
        }
        __initialize(root, visitor) {
            this.visitor = visitor;
            this.root = root;
            this.__worklist = [];
            this.__leavelist = [];
            this.__current = null;
            this.__state = null;
            this.__fallback = visitor.fallback === 'iteration' ? Object.keys :
                typeof visitor.fallback === 'function' ? visitor.fallback : null;
            this.__keys = visitor.keys ? Object.assign(Object.create(VisitorKeys), visitor.keys) : VisitorKeys;
        }
        traverse(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {}, worklist = this.__worklist, leavelist = this.__leavelist;
            worklist.push(new Element(root, null, null, null));
            leavelist.push(new Element(null, null, null, null));
            while (worklist.length) {
                let element = worklist.pop();
                if (element === sentinel) {
                    element = leavelist.pop();
                    const ret = this.__execute(visitor.leave, element);
                    if (this.__state === BREAK || ret === BREAK) return;
                    continue;
                }
                if (element.node) {
                    const ret = this.__execute(visitor.enter, element);
                    if (this.__state === BREAK || ret === BREAK) return;
                    worklist.push(sentinel);
                    leavelist.push(element);
                    if (this.__state === SKIP || ret === SKIP) continue;
                    const node = element.node, nodeType = node.type || element.wrap, candidates = this.__keys[nodeType] || this.__fallback(node);
                    if (!candidates) throw new Error(`Unknown node type ${nodeType}.`);
                    for (let key of candidates.reverse()) {
                        const candidate = node[key];
                        if (!candidate) continue;
                        if (Array.isArray(candidate)) {
                            candidate.forEach((cand, current2) => {
                                if (cand && !candidateExistsInLeaveList(leavelist, cand)) {
                                    worklist.push(new Element(cand, [key, current2], isProperty(nodeType, key) ? 'Property' : null, null));
                                }
                            });
                        } else if (isNode(candidate) && !candidateExistsInLeaveList(leavelist, candidate)) {
                            worklist.push(new Element(candidate, key, null, null));
                        }
                    }
                }
            }
        }
        replace(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {}, worklist = this.__worklist, leavelist = this.__leavelist;
            const outer = { root };
            let element = new Element(root, null, null, new Reference(outer, 'root'));
            worklist.push(element);
            leavelist.push(element);
            while (worklist.length) {
                element = worklist.pop();
                if (element === sentinel) {
                    element = leavelist.pop();
                    let target = this.__execute(visitor.leave, element);
                    if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                        element.ref.replace(target);
                    }
                    if (this.__state === REMOVE || target === REMOVE) removeElem(element);
                    if (this.__state === BREAK || target === BREAK) return outer.root;
                    continue;
                }
                let target = this.__execute(visitor.enter, element);
                if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                    element.ref.replace(target);
                    element.node = target;
                }
                if (this.__state === REMOVE || target === REMOVE) {
                    removeElem(element);
                    element.node = null;
                }
                if (this.__state === BREAK || target === BREAK) return outer.root;
                const node = element.node;
                if (!node) continue;
                worklist.push(sentinel);
                leavelist.push(element);
                if (this.__state === SKIP || target === SKIP) continue;
                const nodeType = node.type || element.wrap;
                const candidates = this.__keys[nodeType] || this.__fallback(node);
                if (!candidates) throw new Error(`Unknown node type ${nodeType}.`);
                for (let key of candidates.reverse()) {
                    const candidate = node[key];
                    if (!candidate) continue;
                    if (Array.isArray(candidate)) {
                        candidate.forEach((cand, current2) => {
                            if (cand && !candidateExistsInLeaveList(leavelist, cand)) {
                                worklist.push(new Element(cand, [key, current2], isProperty(nodeType, key) ? 'Property' : null, new Reference(candidate, current2)));
                            }
                        });
                    } else if (isNode(candidate) && !candidateExistsInLeaveList(leavelist, candidate)) {
                        worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    }
                }
            }
            return outer.root;
        }
    }

    function isNode(node) {
        return node != null && typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === 'properties';
    }

    function candidateExistsInLeaveList(leavelist, candidate) {
        return leavelist.some(element => element.node === candidate);
    }

    function removeElem(element) {
        if (element.ref.remove()) {
            const key = element.ref.key, parent = element.ref.parent;
            for (let nextElem of worklist) {
                if (nextElem.ref && nextElem.ref.parent === parent) {
                    if (nextElem.ref.key < key) break;
                    --nextElem.ref.key;
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
        if (!tokens.length) {
            if (providedComments.length) {
                tree.leadingComments = providedComments.map(comment => ({...comment, extendedRange: [0, tree.range[0]]}));
            }
            return tree;
        }
        let cursor = 0;
        traverse(tree, {
            enter(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) break;
                    if (comment.extendedRange[1] === node.range[0]) {
                        node.leadingComments = node.leadingComments || [];
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else cursor++;
                }
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });

        cursor = 0;
        traverse(tree, {
            leave(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) break;
                    if (node.range[1] === comment.extendedRange[0]) {
                        node.trailingComments = node.trailingComments || [];
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else cursor++;
                }
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
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
})(exports);
/* vim: set sw=4 ts=4 et tw=80 : */
