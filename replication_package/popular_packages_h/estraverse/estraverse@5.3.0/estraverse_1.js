/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

'use strict';

(function(exports) {

    // Deep copy utility function to clone objects
    function deepCopy(obj) {
        let ret = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let val = obj[key];
                ret[key] = (typeof val === 'object' && val !== null) ? deepCopy(val) : val;
            }
        }
        return ret;
    }

    // Binary search utility
    function upperBound(array, func) {
        let len = array.length;
        let i = 0;
        while (len) {
            let diff = len >>> 1;
            let current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    // Syntax node types
    const Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ChainExpression: 'ChainExpression',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportExpression: 'ImportExpression',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        ModuleSpecifier: 'ModuleSpecifier',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        PrivateIdentifier: 'PrivateIdentifier',
        Program: 'Program',
        Property: 'Property',
        PropertyDefinition: 'PropertyDefinition',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    // Node traversal keys
    const VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        AssignmentPattern: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'body'],
        AwaitExpression: ['argument'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ChainExpression: ['expression'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'superClass', 'body'],
        ClassExpression: ['id', 'superClass', 'body'],
        ComprehensionBlock: ['left', 'right'],
        ComprehensionExpression: ['blocks', 'filter', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExportAllDeclaration: ['source'],
        ExportDefaultDeclaration: ['declaration'],
        ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
        ExportSpecifier: ['exported', 'local'],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        GeneratorExpression: ['blocks', 'filter', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        ImportExpression: ['source'],
        ImportDeclaration: ['specifiers', 'source'],
        ImportDefaultSpecifier: ['local'],
        ImportNamespaceSpecifier: ['local'],
        ImportSpecifier: ['imported', 'local'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MetaProperty: ['meta', 'property'],
        MethodDefinition: ['key', 'value'],
        ModuleSpecifier: [],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        PrivateIdentifier: [],
        Program: ['body'],
        Property: ['key', 'value'],
        PropertyDefinition: ['key', 'value'],
        RestElement: ['argument'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SpreadElement: ['argument'],
        Super: [],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        TaggedTemplateExpression: ['tag', 'quasi'],
        TemplateElement: [],
        TemplateLiteral: ['quasis', 'expressions'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handler', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // Visitor control options
    const VisitorOption = {
        Break: {},
        Skip: {},
        Remove: {}
    };

    // Reference class for AST node manipulation
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

    // Element class representing nodes during traversal
    class Element {
        constructor(node, path, wrap, ref) {
            this.node = node;
            this.path = path;
            this.wrap = wrap;
            this.ref = ref;
        }
    }

    // Controller class for traversing and replacing nodes in an AST
    class Controller {
        constructor() {
            this.__initialize = function(root, visitor) {
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
                this.__keys = VisitorKeys;
                if (visitor.keys) {
                    this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
                }
            };
        }

        path() {
            const result = [];
            if (!this.__current.path) return null;
            for (let i = 2, iz = this.__leavelist.length; i < iz; ++i) {
                const element = this.__leavelist[i];
                addToPath(result, element.path);
            }
            addToPath(result, this.__current.path);
            return result;
        }

        type() {
            const node = this.current();
            return node.type || this.__current.wrap;
        }

        parents() {
            const result = [];
            for (let i = 1, iz = this.__leavelist.length; i < iz; ++i) {
                result.push(this.__leavelist[i].node);
            }
            return result;
        }

        current() {
            return this.__current.node;
        }

        __execute(callback, element) {
            let result;
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

                    if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) {
                        return;
                    }
                    continue;
                }

                if (element.node) {
                    const ret = this.__execute(visitor.enter, element);

                    if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) {
                        return;
                    }

                    worklist.push(sentinel);
                    leavelist.push(element);

                    if (this.__state === VisitorOption.Skip || ret === VisitorOption.Skip) {
                        continue;
                    }

                    const node = element.node;
                    const nodeType = node.type || element.wrap;
                    let candidates = this.__keys[nodeType];
                    if (!candidates) {
                        if (this.__fallback) {
                            candidates = this.__fallback(node);
                        } else {
                            throw new Error(`Unknown node type ${nodeType}.`);
                        }
                    }

                    let current = candidates.length;
                    while ((current -= 1) >= 0) {
                        const key = candidates[current];
                        const candidate = node[key];
                        if (!candidate) continue;

                        if (Array.isArray(candidate)) {
                            let current2 = candidate.length;
                            while ((current2 -= 1) >= 0) {
                                if (!candidate[current2]) continue;
                                if (candidateExistsInLeaveList(leavelist, candidate[current2])) continue;
                                if (isProperty(nodeType, candidates[current])) {
                                    element = new Element(candidate[current2], [key, current2], 'Property', null);
                                } else if (isNode(candidate[current2])) {
                                    element = new Element(candidate[current2], [key, current2], null, null);
                                } else {
                                    continue;
                                }
                                worklist.push(element);
                            }
                        } else if (isNode(candidate)) {
                            if (candidateExistsInLeaveList(leavelist, candidate)) continue;
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

            const outer = { root: root };
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
                        removeElem(element);
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
                    removeElem(element);
                    element.node = null;
                }

                if (this.__state === VisitorOption.Break || target === VisitorOption.Break) {
                    return outer.root;
                }

                const node = element.node;
                if (!node) continue;

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === VisitorOption.Skip || target === VisitorOption.Skip) continue;

                const nodeType = node.type || element.wrap;
                let candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) {
                        candidates = this.__fallback(node);
                    } else {
                        throw new Error(`Unknown node type ${nodeType}.`);
                    }
                }

                let current = candidates.length;
                while ((current -= 1) >= 0) {
                    const key = candidates[current];
                    const candidate = node[key];
                    if (!candidate) continue;

                    if (Array.isArray(candidate)) {
                        let current2 = candidate.length;
                        while ((current2 -= 1) >= 0) {
                            if (!candidate[current2]) continue;
                            if (isProperty(nodeType, candidates[current])) {
                                element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                            } else if (isNode(candidate[current2])) {
                                element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                            } else {
                                continue;
                            }
                            worklist.push(element);
                        }
                    } else if (isNode(candidate)) {
                        worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    }
                }
            }

            return outer.root;
        }
    }

    // Checks if an object is a node
    function isNode(node) {
        return node !== null && typeof node === 'object' && typeof node.type === 'string';
    }

    // Checks if a key is a property
    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === 'properties';
    }

    // Checks if a candidate node exists in the leave list
    function candidateExistsInLeaveList(leavelist, candidate) {
        for (let i = leavelist.length - 1; i >= 0; --i) {
            if (leavelist[i].node === candidate) return true;
        }
        return false;
    }

    // Attaches comments to nodes in the AST
    function attachComments(tree, providedComments, tokens) {
        if (!tree.range) throw new Error('attachComments needs range information');

        const comments = [];
        if (!tokens.length) {
            if (providedComments.length) {
                for (let i = 0, len = providedComments.length; i < len; i++) {
                    const comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (let i = 0, len = providedComments.length; i < len; i++) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        let cursor = 0;
        new Controller().traverse(tree, {
            enter(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) break;

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) node.leadingComments = [];
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });

        cursor = 0;
        new Controller().traverse(tree, {
            leave(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) break;

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) node.trailingComments = [];
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor++;
                    }
                }
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });

        return tree;
    }

    // Exporting the necessary APIs
    exports.Syntax = Syntax;
    exports.traverse = (root, visitor) => new Controller().traverse(root, visitor);
    exports.replace = (root, visitor) => new Controller().replace(root, visitor);
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = () => clone({});

})(typeof exports !== 'undefined' ? exports : (typeof window !== 'undefined' ? window : this));
