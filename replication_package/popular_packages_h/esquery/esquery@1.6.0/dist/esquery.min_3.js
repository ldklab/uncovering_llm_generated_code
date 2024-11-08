(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (root = root || self).esquery = factory();
    }
}(this, function () {
    'use strict';

    // Utility functions to handle Symbol, destructuring, etc.
    function getType(value) {
        return typeof value;
    }

    function arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
    }

    function iterableToArrayLimit(arr, limit) {
        if (typeof Symbol === "undefined" || arr[Symbol.iterator] == null) return;
        var _arr = [], _n = true, _d = false, _e;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (limit && _arr.length === limit) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"] != null) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }

    function sliceOfArray(arr, n) {
        if (arr != null) {
            if ('undefined' != typeof Symbol && arr[Symbol.iterator] != null) {
                return Array.from(arr);
            } else if (Object.prototype.toString.call(arr) === "[object Array]") {
                return Array.prototype.slice.call(arr, n);
            }
        }
    }

    function assertThisInitialized(self) {
        if (self === void 0) throw new ReferenceError("this hasn't been initialized - super() hasn't been called");
        return self;
    }

    function iterUnsupportedFallback() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance. " +
            "In order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    // Controller for navigating the AST
    function Controller() {}

    Controller.prototype.path = function () {
        if (!this.__current.path) return null;
        var path = [], i;
        for (i=2; i<this.__leavelist.length; i++) {
            path.push.apply(path, sliceOfArray(this.__leavelist[i].path));
        }
        path.push.apply(path, sliceOfArray(this.__current.path));
        return path;
    };

    Controller.prototype.type = function () {
        return this.current().type || this.__current.wrap;
    };

    Controller.prototype.current = function () {
        return this.__current.node;
    };

    Controller.prototype.traverse = function (node, visitor) {
        this.__initialize(node, visitor);
        var worklist = this.__worklist,
            leavelist = this.__leavelist,
            node,
            ret;
        worklist.push(new Element(node, null, null, null));
        leavelist.push(new Element(null, null, null, null));
        while (worklist.length) {
            ElementReference = worklist.pop();
            if (ElementReference !== sentinel) {
                if (ElementReference.node) {
                    ret = this.__execute(visitor.enter, ElementReference);
                    if (ret === VisitorOption.Break) break;
                    if (ret === VisitorOption.Skip) continue;
                    if (ElementReference === sentinel) leavelist.push(ElementReference);
                    if (ret === VisitorOption.Remove) {
                        ElementReference.remove();
                        ElementReference.node = null;
                    }
                    var keys = this.__keys[ElementReference.node.type || ElementReference.wrap];
                    if (!keys) {
                        if (!this.__fallback) {
                            throw new Error('Unknown node type ' + ElementReference.node.type + '.');
                        }
                        keys = this.__fallback(ElementReference.node);
                    }
                    var currentNode = ElementReference.node;
                    for (var k = keys.length; k--; ) {
                        var child = currentNode[keys[k]];
                        if (!child) continue;
                        if (Array.isArray(child)) {
                            for (var i = child.length; i--; ) {
                                if (child[i] && !ElementReference.isCircular(child[i])) {
                                    worklist.push(new Element(child[i], [keys[k], i], null, null));
                                }
                            }
                        } else if (isNode(child)) {
                            worklist.push(new Element(child, keys[k], null, null));
                        }
                    }
                }
            } else {
                ret = this.__execute(visitor.leave, leavelist.pop());
                if (ret === VisitorOption.Break) break;
                if (ret === VisitorOption.Skip) {
                    ElementReference.node = null;
                }
            }
        }
    };

    // AST node utilities
    function isNode(value) {
        return value !== null && typeof value === 'object' && typeof value.type === 'string';
    }

    function isLiteral(node) {
        return node && typeof node.value === 'string';
    }

    function getNodeName(node, field) {
        return node.type === Syntax.Literal ? node.value : node[field];
    }

    // Selectors
    function Match(selector) {
        return selector.type === 'query' ? selector : { type: 'query', selectors: [selector] };
    }

    function isField(namespace, name, type) {
        var token = [namespace];
        if (name) {
            token.push(name);
        }
        if (type) {
            token.push(type.toLowerCase());
        }
        return token.join('::');
    }

    // Main query method
    function query(ast, selector, options) {
        return search(ast, parse(selector), options);
    }

    function search(ast, node, options) {
        var matched = [];
        traverse(ast, {}, function (node) {
            if (match(node, ast, options) > 0) {
                matched.push(node);
            }
            return matched.length;
        }, options);
        return matched;
    }

    // Parsing and compiling selectors
    var parse = function (selector) {
        return parser.parse(selector);
    };

    // Exporting main functions
    return {
        query: query,
        match: search,
        parse: parse,
    };

}));
