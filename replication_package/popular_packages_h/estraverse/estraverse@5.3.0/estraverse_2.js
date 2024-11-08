(function setupExports(exports) {
    'use strict';

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
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        LabeledStatement: 'LabeledStatement',
        Literal: 'Literal',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
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
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'superClass', 'body'],
        ClassExpression: ['id', 'superClass', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExportAllDeclaration: ['source'],
        ExportDefaultDeclaration: ['declaration'],
        ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        ImportDeclaration: ['specifiers', 'source'],
        ImportDefaultSpecifier: ['local'],
        ImportNamespaceSpecifier: ['local'],
        ImportSpecifier: ['imported', 'local'],
        LabeledStatement: ['label', 'body'],
        Literal: [],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
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

    const VisitorOption = {
        Break: {},
        Skip: {},
        Remove: {}
    };

    function deepCopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        return Array.isArray(obj) ? obj.map(deepCopy) : Object.keys(obj).reduce((copied, key) => {
            copied[key] = deepCopy(obj[key]);
            return copied;
        }, {});
    }

    function upperBound(array, func) {
        let low = 0, high = array.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (func(array[mid])) high = mid;
            else low = mid + 1;
        }
        return low;
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
        constructor() {
            this.__worklist = [];
            this.__leavelist = [];
            this.__state = null;
            this.__current = null;
        }

        __initialize(root, visitor) {
            this.visitor = visitor;
            this.root = root;
            this.__keys = Object.assign({}, VisitorKeys, visitor.keys);
            this.__worklist = [new Element(root, null, null, null)];
            this.__leavelist = [new Element(null, null, null, null)];
            this.__fallback = visitor.fallback === 'iteration' ? Object.keys : visitor.fallback;
        }

        __execute(callback, element) {
            if (!callback) return undefined;
            const previous = this.__current;
            this.__current = element;
            this.__state = null;
            const result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
            this.__current = previous;
            return result;
        }

        traverse(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {};

            while (this.__worklist.length) {
                let element = this.__worklist.pop();
                if (element === sentinel) {
                    element = this.__leavelist.pop();
                    const ret = this.__execute(visitor.leave, element);
                    if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) {
                        return this.root;
                    }
                    continue;
                }

                const node = element.node;
                const ret = this.__execute(visitor.enter, element);
                if (this.__state === VisitorOption.Break || ret === VisitorOption.Break) {
                    return this.root;
                }

                this.__worklist.push(sentinel);
                this.__leavelist.push(element);

                if (this.__state === VisitorOption.Skip || ret === VisitorOption.Skip) {
                    continue;
                }

                const nodeType = node.type || element.wrap;
                let candidates = this.__keys[nodeType];
                if (!candidates && this.__fallback) {
                    candidates = this.__fallback(node);
                }
                if (!candidates) {
                    throw new Error(`Unknown node type ${nodeType}.`);
                }

                for (let i = candidates.length - 1; i >= 0; --i) {
                    const key = candidates[i];
                    const candidate = node[key];
                    if (!candidate) continue;

                    if (Array.isArray(candidate)) {
                        for (let j = candidate.length - 1; j >= 0; --j) {
                            const currCandidate = candidate[j];
                            if (!currCandidate) continue;
                            
                            const wrap = this.isProperty(nodeType, key) ? 'Property' : null;
                            this.__worklist.push(new Element(currCandidate, [key, j], wrap, new Reference(node, j)));
                        }
                    } else if (this.isNode(candidate)) {
                        this.__worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    }
                }
            }
            return this.root;
        }

        replace(root, visitor) {
            this.__initialize(root, visitor);
            const sentinel = {};

            while (this.__worklist.length) {
                let element = this.__worklist.pop();
                if (element === sentinel) {
                    element = this.__leavelist.pop();
                    const target = this.__execute(visitor.leave, element);

                    if (target !== undefined && target !== VisitorOption.Break && target !== VisitorOption.Skip && target !== VisitorOption.Remove) {
                        element.ref.replace(target);
                    }

                    if (this.__state === VisitorOption.Remove || target === VisitorOption.Remove) {
                        this.removeElement(element);
                    }

                    if (this.__state === VisitorOption.Break || target === VisitorOption.Break) {
                        return this.root;
                    }
                    continue;
                }

                const target = this.__execute(visitor.enter, element);
                if (target !== undefined && target !== VisitorOption.Break && target !== VisitorOption.Skip && target !== VisitorOption.Remove) {
                    element.ref.replace(target);
                    element.node = target;
                }

                if (this.__state === VisitorOption.Remove || target === VisitorOption.Remove) {
                    this.removeElement(element);
                    element.node = null;
                }

                if (this.__state === VisitorOption.Break || target === VisitorOption.Break) {
                    return this.root;
                }

                const node = element.node;
                if (!node) continue;

                this.__worklist.push(sentinel);
                this.__leavelist.push(element);

                if (this.__state === VisitorOption.Skip || target === VisitorOption.Skip) {
                    continue;
                }

                const nodeType = node.type || element.wrap;
                let candidates = this.__keys[nodeType];
                if (!candidates && this.__fallback) {
                    candidates = this.__fallback(node);
                }
                if (!candidates) {
                    throw new Error(`Unknown node type ${nodeType}.`);
                }

                for (let i = candidates.length - 1; i >= 0; --i) {
                    const key = candidates[i];
                    const candidate = node[key];
                    if (!candidate) continue;

                    if (Array.isArray(candidate)) {
                        for (let j = candidate.length - 1; j >= 0; --j) {
                            const currCandidate = candidate[j];
                            if (!currCandidate) continue;

                            const wrap = this.isProperty(nodeType, key) ? 'Property' : null;
                            this.__worklist.push(new Element(currCandidate, [key, j], wrap, new Reference(node, j)));
                        }
                    } else if (this.isNode(candidate)) {
                        this.__worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    }
                }
            }
            return this.root;
        }

        removeElement(element) {
            if (Array.isArray(element.ref.parent)) {
                element.ref.parent.splice(element.ref.key, 1);
                const newWorklist = this.__worklist.map(el => {
                    if (el.ref && el.ref.parent === element.ref.parent && el.ref.key > element.ref.key) {
                        el.ref.key--;
                    }
                    return el;
                });
                this.__worklist = newWorklist;
            } else {
                element.ref.replace(null);
            }
        }

        isNode(node) {
            return node !== null && typeof node === 'object' && typeof node.type === 'string';
        }

        isProperty(nodeType, key) {
            return ['ObjectExpression', 'ObjectPattern'].includes(nodeType) && key === 'properties';
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
        comment.extendedRange = [...comment.range];
        
        let position = upperBound(tokens, token => token.range[0] > comment.range[0]);
        
        if (position !== tokens.length) {
            comment.extendedRange[1] = tokens[position].range[0];
        }
        
        if (position > 0) {
            comment.extendedRange[0] = tokens[position - 1].range[1];
        }
        
        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        const comments = providedComments.map(comment => extendCommentRange(deepCopy(comment), tokens));
        let cursor = 0;

        traverse(tree, {
            enter(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }
                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) node.leadingComments = [];
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                        continue;
                    }
                    cursor++;
                }

                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }
                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            },
            leave(node) {
                while (cursor < comments.length) {
                    const comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }
                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) node.trailingComments = [];
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                        continue;
                    }
                    cursor++;
                }
            }
        });

        return tree;
    }

    exports.Syntax = Syntax;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.Controller = Controller;
    exports.cloneEnvironment = () => setupExports({});

    return exports;
}(typeof exports === 'undefined' ? this['astUtils'] = {} : exports));
