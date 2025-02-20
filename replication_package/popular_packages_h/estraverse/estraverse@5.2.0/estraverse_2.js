/* Node.js AST Processing Library */

(function clone(exports) {
    'use strict';

    const Syntax = {
        // ... (Listing of syntax node types)
    };

    const VisitorKeys = {
        // ... (Node traversal rules for each syntax type)
    };

    const VisitorOption = {
        Break: {},
        Skip: {},
        Remove: {}
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
            }
            this.replace(null);
            return false;
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
        constructor() {
            this.__current = null;
            this.__state = null;
        }

        path() {
            const result = [];
            for (let element of this.__leavelist.slice(2)) {
                this._addToPath(result, element.path);
            }
            this._addToPath(result, this.__current.path);
            return result;
        }

        _addToPath(result, path) {
            if (Array.isArray(path)) {
                result.push(...path);
            } else {
                result.push(path);
            }
        }

        type() {
            return this.current().type || this.__current.wrap;
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
            this.notify(VisitorOption.Skip);
        }

        'break'() {
            this.notify(VisitorOption.Break);
        }

        remove() {
            this.notify(VisitorOption.Remove);
        }

        __initialize(root, visitor) {
            this.root = root;
            this.visitor = visitor;
            this.__worklist = [];
            this.__leavelist = [];
            this.__keys = visitor.keys ? Object.assign(Object.create(VisitorKeys), visitor.keys) : VisitorKeys;
            this.__fallback = visitor.fallback === 'iteration' ? Object.keys : visitor.fallback;
            this.__current = this.__state = null;
        }

        traverse(root, visitor) {
            this.__initialize(root, visitor);
            this.__worklist.push(new Element(root, null, null, null));
            this.__leavelist.push(new Element(null, null, null, null));
        
            while (this.__worklist.length) {
                const element = this.__worklist.pop();
                const node = element.node;

                if (element === this._sentinel) {
                    const element = this.__leavelist.pop();
                    this.__execute(visitor.leave, element);
                    if (this.__state === VisitorOption.Break) return;
                    continue;
                }

                if (node) {
                    this.__execute(visitor.enter, element);
                    if (this.__state === VisitorOption.Break) return;
        
                    this.__worklist.push(this._sentinel);
                    this.__leavelist.push(element);
        
                    if (this.__state === VisitorOption.Skip) continue;

                    const nodeType = node.type || element.wrap;
                    let candidates = this.__keys[nodeType];
                    if (!candidates) {
                        if (this.__fallback) {
                            candidates = this.__fallback(node);
                        } else {
                            throw new Error(`Unknown node type: ${nodeType}`);
                        }
                    }

                    for (let current = candidates.length; current--;) {
                        const key = candidates[current];
                        let candidate = node[key];
                        if (!candidate) continue;
        
                        if (Array.isArray(candidate)) {
                            for (let current2 = candidate.length; current2--;) {
                                if (!candidate[current2]) continue;
                                const element = this._createElement(candidate[current2], nodeType, key, current, leavelist);
                                this.__worklist.push(element);
                            }
                        } else if (this._isNode(candidate)) {
                            this.__worklist.push(new Element(candidate, key, null, null));
                        }
                    }
                }
            }
        }

        _createElement(node, nodeType, key, index, leavelist) {
            if (this._isProperty(nodeType, key)) {
                return new Element(node, [key, index], 'Property', null);
            }
            if (this._isNode(node) && !this._candidateExists(leavelist, node)) {
                return new Element(node, [key, index], null, null);
            }
        }

        replace(root, visitor) {
            this.__initialize(root, visitor);
            const outer = { root };
        
            const initialElement = new Element(root, null, null, new Reference(outer, 'root'));
            this.__worklist.push(initialElement);
            this.__leavelist.push(initialElement);

            while (this.__worklist.length) {
                let element = this.__worklist.pop();

                if (element === this._sentinel) {
                    const element = this.__leavelist.pop();
                    const target = this.__execute(visitor.leave, element);
                    if (target !== undefined && target !== VisitorOption.Break && target !== VisitorOption.Skip && target !== VisitorOption.Remove) {
                        element.ref.replace(target);
                    }
                    if (this.__state === VisitorOption.Remove) {
                        this._removeElement(element);
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
                if (this.__state === VisitorOption.Remove) {
                    this._removeElement(element);
                    element.node = null;
                }
                if (this.__state === VisitorOption.Break || target === VisitorOption.Break) {
                    return outer.root;
                }

                if (!element.node) continue;

                this.__worklist.push(this._sentinel);
                this.__leavelist.push(element);

                if (this.__state === VisitorOption.Skip || target === VisitorOption.Skip) {
                    continue;
                }

                const nodeType = element.node.type || element.wrap;
                let candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) {
                        candidates = this.__fallback(element.node);
                    } else {
                        throw new Error(`Unknown node type: ${nodeType}`);
                    }
                }
                for (let current = candidates.length; current--;) {
                    const key = candidates[current];
                    const candidate = element.node[key];
                    if (!candidate) continue;
                    
                    if (Array.isArray(candidate)) {
                        for (let current2 = candidate.length; current2--;) {
                            if (!candidate[current2]) continue;
                            const elem = this._createElement(candidate[current2], nodeType, key, current2, this.__leavelist);
                            this.__worklist.push(elem);
                        }
                    } else if (this._isNode(candidate)) {
                        this.__worklist.push(new Element(candidate, key, null, new Reference(element.node, key)));
                    }
                }
            }
            return outer.root;
        }

        _removeElement(element) {
            if (element.ref.remove()) {
                const key = element.ref.key, parent = element.ref.parent;
                const len = this.__worklist.length;
                for (let i = len; i--;) {
                    const nextElem = this.__worklist[i];
                    if (nextElem.ref && nextElem.ref.parent === parent && nextElem.ref.key >= key) {
                        --nextElem.ref.key;
                    }
                }
            }
        }

        _isNode(node) {
            return node != null && typeof node === 'object' && typeof node.type === 'string';
        }

        _isProperty(nodeType, key) {
            return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === 'properties';
        }

        _candidateExists(leavelist, candidate) {
            return leavelist.some(el => el.node === candidate);
        }
    }

    function deepCopy(obj) {
        const ret = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const val = obj[key];
                ret[key] = typeof val === 'object' && val !== null ? deepCopy(val) : val;
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

    function extendCommentRange(comment, tokens) {
        const target = upperBound(tokens, token => token.range[0] > comment.range[0]);
        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }
        if (target > 0) {
            comment.extendedRange[0] = tokens[target - 1].range[1];
        }
        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        if (!tree.range) throw new Error('attachComments needs range information');
        if (!tokens.length && providedComments.length) {
            tree.leadingComments = providedComments.map(comment => {
                const deepCopiedComment = deepCopy(comment);
                deepCopiedComment.extendedRange = [0, tree.range[0]];
                return deepCopiedComment;
            });
            return tree;
        }

        const comments = providedComments.map(comment => extendCommentRange(deepCopy(comment), tokens));

        addCommentsToNode(tree, comments, 'leadingComments', 
            (node, comment) => comment.extendedRange[1] === node.range[0],
            node => comment => comment.extendedRange[1] > node.range[0]
        );

        addCommentsToNode(tree, comments, 'trailingComments', 
            (node, comment) => node.range[1] === comment.extendedRange[0],
            node => comment => node.range[1] < comment.extendedRange[0]
        );

        return tree;
    }

    function addCommentsToNode(tree, comments, commentKey, compare, nodeTraverseCondition) {
      let cursor = 0;
      traverse(tree, {
          enter(node) {
              while (cursor < comments.length) {
                  const comment = comments[cursor];
                  if (nodeTraverseCondition(node)(comment)) break;
  
                  if (compare(node, comment)) {
                      if (!node[commentKey]) node[commentKey] = [];
                      node[commentKey].push(comment);
                      comments.splice(cursor, 1);
                  } else {
                      cursor += 1;
                  }
              }
  
              if (cursor === comments.length) return VisitorOption.Break;
              if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
          }
      });
    }

    exports.Syntax = Syntax;
    exports.traverse = (root, visitor) => new Controller().traverse(root, visitor);
    exports.replace = (root, visitor) => new Controller().replace(root, visitor);
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.cloneEnvironment = () => clone({});

}(exports));
