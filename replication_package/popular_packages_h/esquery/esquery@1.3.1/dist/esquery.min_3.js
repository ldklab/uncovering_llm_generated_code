(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = global || self).esquery = factory();
    }
}(this, (function() {
    'use strict';

    function determineType(value) {
        return typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' 
            ? function(value) { return typeof value; } 
            : function(value) {
                return value && typeof Symbol === 'function' && value.constructor === Symbol && value !== Symbol.prototype
                    ? 'symbol' 
                    : typeof value;
            };
    }

    function arrayOrArgs(e, count) {
        return Array.isArray(e) ? e 
            : (function(e, count) {
                if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(e))) return;
                const arr = [];
                let n = true, done = false;
                let iterator = e[Symbol.iterator]();
                let result;
                try {
                    for (; !(n = (result = iterator.next()).done) && (arr.push(result.value), !count || arr.length !== count); n = true);
                } catch (err) {
                    done = true;
                    error = err;
                } finally {
                    try {
                        if (!n && iterator['return'] != null) iterator['return']();
                    } finally {
                        if (done) throw error;
                    }
                }
                return arr;
            })(e, count) || extract(e, count);
    }

    function convertToArray(e) {
        return Array.isArray(e) ? e 
            : (typeof Symbol !== 'undefined' && Symbol.iterator in Object(e)) ? Array.from(e) 
            : extract(e);
    }

    function extract(e, count) {
        if (e) {
            if ('string' === typeof e) return Array.from(e.length > count ? e.slice(0, e.length) : e);
            const r = Object.prototype.toString.call(e).slice(8, -1);
            return 'Object' === r && e.constructor && (r = e.constructor.name), 
                'Map' === r || 'Set' === r 
                    ? Array.from(r)
                    : regexMatch(r) ? Array.from(e, count) : void 0;
        }
    }

    function traverse(ast, visitor) {
        const controller = new Controller();
        return controller.traverse(ast, visitor);
    }

    function shouldContinueWithState(state) {
        return state !== Exit.Stop && state !== Exit.Break && state !== Exit.Remove;
    }

    const nodeTypes = {
        AssignmentExpression: 'AssignmentExpression',
        // More types defined here...
    };

    const visitorKeys = {
        AssignmentExpression: ['left', 'right'],
        // More visitor keys defined here...
    };

    const Exit = {
        Stop: {},
        Skip: {},
        Remove: {}
    };

    class NodeReference {
        constructor(parent, key) {
            this.parent = parent;
            this.key = key;
        }
    }

    class WorkEntry {
        constructor(node, path, wrap, ref) {
            this.node = node;
            this.path = path;
            this.wrap = wrap;
            this.ref = ref;
        }
    }

    class Controller {
        constructor() {
            this.__state = null;
            this.__current = null;
            this.__leavelist = [];
            this.__worklist = [];
            this.__fallback = null;
        }

        path() {
            const resultPath = [];
            if (!this.__current.path) return null;
            for (let i = 2, len = this.__leavelist.length; i < len; ++i) {
                resultPath.push(this.__leavelist[i].path);
            }
            resultPath.push(this.__current.path);
            return resultPath;
        }

        type() {
            return this.current().type || this.__current.wrap;
        }

        parents() {
            return this.__leavelist.slice(1).map(entry => entry.node);
        }

        current() {
            return this.__current.node;
        }

        notify(state) {
            this.__state = state;
        }

        skip() {
            this.notify(Exit.Skip);
        }

        stop() {
            this.notify(Exit.Stop);
        }

        remove() {
            this.notify(Exit.Remove);
        }

        traverse(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {};
            const worklist = this.__worklist;
            const leavelist = this.__leavelist;

            worklist.push(new WorkEntry(root, null, null, null));
            leavelist.push(new WorkEntry(null, null, null, null));

            while (worklist.length) {
                const element = worklist.pop();
                if (element !== sentinel) {
                    if (element.node) {
                        this.__current = element;
                        const res = visitor.enter(this.current(), this.__leavelist[this.__leavelist.length - 1].node);
                        if (this.__state === Exit.Stop || res === Exit.Stop) return;
                        worklist.push(sentinel, element);
                        leavelist.push(element);
                        if (this.__state !== Exit.Skip && res !== Exit.Skip) {
                            const current = this.current();
                            const type = current.type || element.wrap;
                            const children = visitorKeys[type] || (this.__fallback ? this.__fallback(current) : []);
                            for (let i = children.length - 1; i >= 0; --i) {
                                const child = current[children[i]];
                                if (Array.isArray(child)) {
                                    for (let j = child.length - 1; j >= 0; --j) {
                                        if (child[j]) {
                                            if (matchNodeWithType(child[j], current, children[i])) {
                                                worklist.push(new WorkEntry(child[j], [children[i], j], null, null));
                                            }
                                        }
                                    }
                                } else if (matchNodeWithType(child, current, children[i])) {
                                    worklist.push(new WorkEntry(child, children[i], null, null));
                                }
                            }
                        }
                    } else {
                        this.__current = element;

                        if (visitor.leave) {
                            const res = visitor.leave(element.node, this.__leavelist[this.__leavelist.length - 1].node);
                            if (this.__state === Exit.Stop || res === Exit.Stop) return;
                        }

                        leavelist.pop();
                    }
                }
            }

            this.__current = null;
        }

        __execute(callback, entry) {
            let savedCurrent = this.__current;
            this.__current = entry;
            try {
                return callback.call(this, entry.node, this.__leavelist[this.__leavelist.length - 1].node);
            } finally {
                this.__current = savedCurrent;
            }
        }

        __initialize(root, visitor) {
            this.visitor = visitor;
            this.root = root;
            this.__worklist = [];
            this.__leavelist = [];
            this.__current = null;
            this.__state = null;
            this.__fallback = null;

            if (visitor.fallback === 'iteration') {
                this.__fallback = Object.keys;
            } else if (typeof visitor.fallback === 'function') {
                this.__fallback = visitor.fallback;
            }

            this.__keys = visitorKeys;
            if (visitor.keys) {
                this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
            }
        }

        matches(node, selector, ancestry) {
            // Matching logic...
            return selectorMatch(node, selector, ancestry);
        }
    }

    function selectorMatch(node, selector, ancestry = []) {
        if (!node) return false;
        if (!selector) return true;

        switch (selector.type) {
            case 'wildcard':
                return true;

            case 'identifier':
                return selector.value.toLowerCase() === node.type.toLowerCase();

            case 'field':
                const path = selector.name.split('.');
                const ancestor = ancestry[path.length - 1];
                return matchField(node, ancestor, path);

            case 'matches':
                return selector.selectors.some(sel => selectorMatch(node, sel, ancestry));

            // More cases...

            default:
                throw new Error(`Unknown selector type: ${selector.type}`);
        }
    }

    // Additional helper functions and classes...

    return {
        query(ast, selector) {
            const parsedSelector = parseSelector(selector);
            return collectMatchingNodes(ast, parsedSelector);
        },

        parseSelector(queryString) {
            return parseQuery(queryString);
        },

        // More public API methods...

    };

    // Parsing logic using a PEG-like style...

})));
