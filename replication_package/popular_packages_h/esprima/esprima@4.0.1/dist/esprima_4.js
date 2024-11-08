(function (root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        exports["esprima"] = factory();
    } else {
        root["esprima"] = factory();
    }
})(this, function () {
    var installedModules = {};

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false
        };

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }

    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";

    return __webpack_require__(0);
})
([
    function (module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        var commentHandler = __webpack_require__(1);
        var jsxParser = __webpack_require__(3);
        var parser = __webpack_require__(8);
        var tokenizer = __webpack_require__(15);

        function parse(code, options, delegate) {
            var commentHandler = null;
            var proxyDelegate = function (node, metadata) {
                if (delegate) delegate(node, metadata);
                if (commentHandler) commentHandler.visit(node, metadata);
            };
            var parserDelegate = typeof delegate === 'function' ? proxyDelegate : null;
            var collectComment = options && options.comment === true;
            if (collectComment || options.attachComment) {
                commentHandler = new commentHandler.CommentHandler();
                commentHandler.attach = options.attachComment;
                options.comment = true;
                parserDelegate = proxyDelegate;
            }
            var isModule = options && options.sourceType === 'module';
            var parserInstance = options && options.jsx ? 
                new jsxParser.JSXParser(code, options, parserDelegate) :
                new parser.Parser(code, options, parserDelegate);
            var program = isModule ? parserInstance.parseModule() : parserInstance.parseScript();
            var ast = program;
            if (collectComment && commentHandler) {
                ast.comments = commentHandler.comments;
            }
            if (parserInstance.config.tokens) {
                ast.tokens = parserInstance.tokens;
            }
            if (parserInstance.config.tolerant) {
                ast.errors = parserInstance.errorHandler.errors;
            }
            return ast;
        }
        exports.parse = parse;
        
        function parseModule(code, options, delegate) {
          var parsingOptions = options || {};
          parsingOptions.sourceType = 'module';
          return parse(code, parsingOptions, delegate);
        }
        exports.parseModule = parseModule;
        
        function parseScript(code, options, delegate) {
          var parsingOptions = options || {};
          parsingOptions.sourceType = 'script';
          return parse(code, parsingOptions, delegate);
        }
        exports.parseScript = parseScript;
        
        function tokenize(code, options, delegate) {
          var tokenizerInstance = new tokenizer.Tokenizer(code, options);
          var tokens = [];
          try {
            while (true) {
              var token = tokenizerInstance.getNextToken();
              if (!token) break;
              if (delegate) {
                token = delegate(token);
              }
              tokens.push(token);
            }
          } catch (e) {
            tokenizerInstance.errorHandler.tolerate(e);
          }
          if (tokenizerInstance.errorHandler.tolerant) {
            tokens.errors = tokenizerInstance.errors();
          }
          return tokens;
        }
        exports.tokenize = tokenize;
        
        var syntax = __webpack_require__(2);
        exports.Syntax = syntax.Syntax;
        exports.version = '4.0.1';
    },
    function (module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        var syntax_1 = __webpack_require__(2);
        var CommentHandler = (function () {
            function CommentHandler() {
                this.attach = false;
                this.comments = [];
                this.stack = [];
                this.leading = [];
                this.trailing = [];
            }
            CommentHandler.prototype.insertInnerComments = function (node, metadata) {
                if (node.type === syntax_1.Syntax.BlockStatement && node.body.length === 0) {
                    var innerComments = [];
                    for (var i = this.leading.length - 1; i >= 0; --i) {
                        var entry = this.leading[i];
                        if (metadata.end.offset >= entry.start) {
                            innerComments.unshift(entry.comment);
                            this.leading.splice(i, 1);
                            this.trailing.splice(i, 1);
                        }
                    }
                    if (innerComments.length) {
                        node.innerComments = innerComments;
                    }
                }
            };
            CommentHandler.prototype.findTrailingComments = function (metadata) {
                var trailingComments = [];
                if (this.trailing.length > 0) {
                    for (var i = this.trailing.length - 1; i >= 0; --i) {
                        var entry = this.trailing[i];
                        if (entry.start >= metadata.end.offset) {
                            trailingComments.unshift(entry.comment);
                        }
                    }
                    this.trailing.length = 0;
                    return trailingComments;
                }
                var entry = this.stack[this.stack.length - 1];
                if (entry && entry.node.trailingComments) {
                    var firstComment = entry.node.trailingComments[0];
                    if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                        trailingComments = entry.node.trailingComments;
                        delete entry.node.trailingComments;
                    }
                }
                return trailingComments;
            };
            CommentHandler.prototype.findLeadingComments = function (metadata) {
                var leadingComments = [];
                var target;
                while (this.stack.length > 0) {
                    var entry = this.stack[this.stack.length - 1];
                    if (entry && entry.start >= metadata.start.offset) {
                        target = entry.node;
                        this.stack.pop();
                    } else {
                        break;
                    }
                }
                if (target) {
                    var count = target.leadingComments ? target.leadingComments.length : 0;
                    for (var i = count - 1; i >= 0; --i) {
                        var comment = target.leadingComments[i];
                        if (comment.range[1] <= metadata.start.offset) {
                            leadingComments.unshift(comment);
                            target.leadingComments.splice(i, 1);
                        }
                    }
                    if (target.leadingComments && target.leadingComments.length === 0) {
                        delete target.leadingComments;
                    }
                    return leadingComments;
                }
                for (var i = this.leading.length - 1; i >= 0; --i) {
                    var entry = this.leading[i];
                    if (entry.start <= metadata.start.offset) {
                        leadingComments.unshift(entry.comment);
                        this.leading.splice(i, 1);
                    }
                }
                return leadingComments;
            };
            CommentHandler.prototype.visitNode = function (node, metadata) {
                if (node.type === syntax_1.Syntax.Program && node.body.length > 0) {
                    return;
                }
                this.insertInnerComments(node, metadata);
                var trailingComments = this.findTrailingComments(metadata);
                var leadingComments = this.findLeadingComments(metadata);
                if (leadingComments.length > 0) {
                    node.leadingComments = leadingComments;
                }
                if (trailingComments.length > 0) {
                    node.trailingComments = trailingComments;
                }
                this.stack.push({
                    node: node,
                    start: metadata.start.offset
                });
            };
            CommentHandler.prototype.visitComment = function (node, metadata) {
                var type = (node.type[0] === 'L') ? 'Line' : 'Block';
                var comment = {
                    type: type,
                    value: node.value
                };
                if (node.range) {
                    comment.range = node.range;
                }
                if (node.loc) {
                    comment.loc = node.loc;
                }
                this.comments.push(comment);
                if (this.attach) {
                    var entry = {
                        comment: {
                            type: type,
                            value: node.value,
                            range: [metadata.start.offset, metadata.end.offset]
                        },
                        start: metadata.start.offset
                    };
                    if (node.loc) {
                        entry.comment.loc = node.loc;
                    }
                    node.type = type;
                    this.leading.push(entry);
                    this.trailing.push(entry);
                }
            };
            CommentHandler.prototype.visit = function (node, metadata) {
                if (node.type === 'LineComment') {
                    this.visitComment(node, metadata);
                } else if (node.type === 'BlockComment') {
                    this.visitComment(node, metadata);
                } else if (this.attach) {
                    this.visitNode(node, metadata);
                }
            };
            return CommentHandler;
        }());
        exports.CommentHandler = CommentHandler;
    },
    function (module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.Syntax = {
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
            DoWhileStatement: 'DoWhileStatement',
            DebuggerStatement: 'DebuggerStatement',
            EmptyStatement: 'EmptyStatement',
            ExportAllDeclaration: 'ExportAllDeclaration',
            ExportDefaultDeclaration: 'ExportDefaultDeclaration',
            ExportNamedDeclaration: 'ExportNamedDeclaration',
            ExportSpecifier: 'ExportSpecifier',
            ExpressionStatement: 'ExpressionStatement',
            ForStatement: 'ForStatement',
            ForOfStatement: 'ForOfStatement',
            ForInStatement: 'ForInStatement',
            FunctionDeclaration: 'FunctionDeclaration',
            FunctionExpression: 'FunctionExpression',
            Identifier: 'Identifier',
            IfStatement: 'IfStatement',
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
            SwitchCase: 'SwitchCase',
            SwitchStatement: 'SwitchStatement',
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
    },
    function (module, exports, __webpack_require__) {
        "use strict";
        var __extends = (this && this.__extends) || (function () {
            var extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        Object.defineProperty(exports, "__esModule", { value: true });
        var character = __webpack_require__(4);
        var JSXNode = __webpack_require__(5);
        var jsx_syntax = __webpack_require__(6);
        var Node = __webpack_require__(7);
        var parser_1 = __webpack_require__(8);
        var token = __webpack_require__(13);
        var xhtml_entities = __webpack_require__(14);
        token.TokenName[100 /* Identifier */] = 'JSXIdentifier';
        token.TokenName[101 /* Text */] = 'JSXText';

        function getQualifiedElementName(elementName) {
            var qualifiedName;
            switch (elementName.type) {
                case jsx_syntax.JSXSyntax.JSXIdentifier:
                    var id = elementName;
                    qualifiedName = id.name;
                    break;
                case jsx_syntax.JSXSyntax.JSXNamespacedName:
                    var ns = elementName;
                    qualifiedName = getQualifiedElementName(ns.namespace) + ':' +
                        getQualifiedElementName(ns.name);
                    break;
                case jsx_syntax.JSXSyntax.JSXMemberExpression:
                    var expr = elementName;
                    qualifiedName = getQualifiedElementName(expr.object) + '.' +
                        getQualifiedElementName(expr.property);
                    break;
                default:
                    break;
            }
            return qualifiedName;
        }

        var JSXParser = (function (_super) {
            __extends(JSXParser, _super);
            function JSXParser(code, options, delegate) {
                return _super.call(this, code, options, delegate) || this;
            }

            JSXParser.prototype.parsePrimaryExpression = function () {
                return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
            };

            JSXParser.prototype.startJSX = function () {
                this.scanner.index = this.startMarker.index;
                this.scanner.lineNumber = this.startMarker.line;
                this.scanner.lineStart = this.startMarker.index - this.startMarker.column;
            };

            JSXParser.prototype.finishJSX = function () {
                this.nextToken();
            };

            JSXParser.prototype.reenterJSX = function () {
                this.startJSX();
                this.expectJSX('}');
                if (this.config.tokens) {
                    this.tokens.pop();
                }
            };

            JSXParser.prototype.createJSXNode = function () {
                this.collectComments();
                return {
                    index: this.scanner.index,
                    line: this.scanner.lineNumber,
                    column: this.scanner.index - this.scanner.lineStart
                };
            };

            JSXParser.prototype.createJSXChildNode = function () {
                return {
                    index: this.scanner.index,
                    line: this.scanner.lineNumber,
                    column: this.scanner.index - this.scanner.lineStart
                };
            };

            JSXParser.prototype.scanXHTMLEntity = function (quote) {
                var result = '&';
                var valid = true;
                var terminated = false;
                var numeric = false;
                var hex = false;
                while (!this.scanner.eof() && valid && !terminated) {
                    var ch = this.scanner.source[this.scanner.index];
                    if (ch === quote) {
                        break;
                    }
                    terminated = (ch === ';');
                    result += ch;
                    ++this.scanner.index;
                    if (!terminated) {
                        switch (result.length) {
                            case 2:
                                numeric = (ch === '#');
                                break;
                            case 3:
                                if (numeric) {
                                    hex = (ch === 'x');
                                    valid = hex || character.Character.isDecimalDigit(ch.charCodeAt(0));
                                    numeric = numeric && !hex;
                                }
                                break;
                            default:
                                valid = valid && !(numeric && !character.Character.isDecimalDigit(ch.charCodeAt(0)));
                                valid = valid && !(hex && !character.Character.isHexDigit(ch.charCodeAt(0)));
                                break;
                        }
                    }
                }
                if (valid && terminated && result.length > 2) {
                    var str = result.substr(1, result.length - 2);
                    if (numeric && str.length > 1) {
                        result = String.fromCharCode(parseInt(str.substr(1), 10));
                    } else if (hex && str.length > 2) {
                        result = String.fromCharCode(parseInt('0' + str.substr(1), 16));
                    } else if (!numeric && !hex && xhtml_entities.XHTMLEntities[str]) {
                        result = xhtml_entities.XHTMLEntities[str];
                    }
                }
                return result;
            };

            JSXParser.prototype.lexJSX = function () {
                var cp = this.scanner.source.charCodeAt(this.scanner.index);

                if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
                    var value = this.scanner.source[this.scanner.index++];
                    return {
                        type: 7 /* Punctuator */,
                        value: value,
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: this.scanner.index - 1,
                        end: this.scanner.index
                    };
                }

                if (cp === 34 || cp === 39) {
                    var start = this.scanner.index;
                    var quote = this.scanner.source[this.scanner.index++];
                    var str = '';
                    while (!this.scanner.eof()) {
                        var ch = this.scanner.source[this.scanner.index++];
                        if (ch === quote) {
                            break;
                        } else if (ch === '&') {
                            str += this.scanXHTMLEntity(quote);
                        } else {
                            str += ch;
                        }
                    }
                    return {
                        type: 8 /* StringLiteral */,
                        value: str,
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: start,
                        end: this.scanner.index
                    };
                }

                if (cp === 46) {
                    var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
                    var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
                    var value = (n1 === 46 && n2 === 46) ? '...' : '.';
                    var start = this.scanner.index;
                    this.scanner.index += value.length;
                    return {
                        type: 7 /* Punctuator */,
                        value: value,
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: start,
                        end: this.scanner.index
                    };
                }

                if (cp === 96) {
                    return {
                        type: 10 /* Template */,
                        value: '',
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: this.scanner.index,
                        end: this.scanner.index
                    };
                }

                if (character.Character.isIdentifierStart(cp) && (cp !== 92)) {
                    var start = this.scanner.index;
                    ++this.scanner.index;
                    while (!this.scanner.eof()) {
                        var ch = this.scanner.source.charCodeAt(this.scanner.index);
                        if (character.Character.isIdentifierPart(ch) && (ch !== 92)) {
                            ++this.scanner.index;
                        } else if (ch === 45) {
                            ++this.scanner.index;
                        } else {
                            break;
                        }
                    }
                    var id = this.scanner.source.slice(start, this.scanner.index);
                    return {
                        type: 100 /* Identifier */,
                        value: id,
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: start,
                        end: this.scanner.index
                    };
                }
                return this.scanner.lex();
            };

            JSXParser.prototype.nextJSXToken = function () {
                this.collectComments();
                this.startMarker.index = this.scanner.index;
                this.startMarker.line = this.scanner.lineNumber;
                this.startMarker.column = this.scanner.index - this.scanner.lineStart;
                var token = this.lexJSX();
                this.lastMarker.index = this.scanner.index;
                this.lastMarker.line = this.scanner.lineNumber;
                this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                if (this.config.tokens) {
                    this.tokens.push(this.convertToken(token));
                }
                return token;
            };

            JSXParser.prototype.nextJSXText = function () {
                this.startMarker.index = this.scanner.index;
                this.startMarker.line = this.scanner.lineNumber;
                this.startMarker.column = this.scanner.index - this.scanner.lineStart;
                var start = this.scanner.index;
                var text = '';
                while (!this.scanner.eof()) {
                    var ch = this.scanner.source[this.scanner.index];
                    if (ch === '{' || ch === '<') {
                        break;
                    }
                    ++this.scanner.index;
                    text += ch;
                    if (character.Character.isLineTerminator(ch.charCodeAt(0))) {
                        ++this.scanner.lineNumber;
                        if (ch === '\r' && this.scanner.source[this.scanner.index] === '\n') {
                            ++this.scanner.index;
                        }
                        this.scanner.lineStart = this.scanner.index;
                    }
                }
                this.lastMarker.index = this.scanner.index;
                this.lastMarker.line = this.scanner.lineNumber;
                this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                var token = {
                    type: 101 /* Text */,
                    value: text,
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: start,
                    end: this.scanner.index
                };
                if ((text.length > 0) && this.config.tokens) {
                    this.tokens.push(this.convertToken(token));
                }
                return token;
            };

            JSXParser.prototype.peekJSXToken = function () {
                var state = this.scanner.saveState();
                this.scanner.scanComments();
                var next = this.lexJSX();
                this.scanner.restoreState(state);
                return next;
            };

            JSXParser.prototype.expectJSX = function (value) {
                var token = this.nextJSXToken();
                if (token.type !== 7 /* Punctuator */ || token.value !== value) {
                    this.throwUnexpectedToken(token);
                }
            };

            JSXParser.prototype.matchJSX = function (value) {
                var next = this.peekJSXToken();
                return next.type === 7 /* Punctuator */ && next.value === value;
            };

            JSXParser.prototype.parseJSXIdentifier = function () {
                var node = this.createJSXNode();
                var token = this.nextJSXToken();
                if (token.type !== 100 /* Identifier */) {
                    this.throwUnexpectedToken(token);
                }
                return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
            };

            JSXParser.prototype.parseJSXElementName = function () {
                var node = this.createJSXNode();
                var elementName = this.parseJSXIdentifier();
                if (this.matchJSX(':')) {
                    var namespace = elementName;
                    this.expectJSX(':');
                    var name = this.parseJSXIdentifier();
                    elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name));
                } else if (this.matchJSX('.')) {
                    while (this.matchJSX('.')) {
                        var object = elementName;
                        this.expectJSX('.');
                        var property = this.parseJSXIdentifier();
                        elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
                    }
                }
                return elementName;
            };

            JSXParser.prototype.parseJSXAttributeName = function () {
                var node = this.createJSXNode();
                var attributeName;
                var identifier = this.parseJSXIdentifier();
                if (this.matchJSX(':')) {
                    var namespace = identifier;
                    this.expectJSX(':');
                    var name = this.parseJSXIdentifier();
                    attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name));
                } else {
                    attributeName = identifier;
                }
                return attributeName;
            };

            JSXParser.prototype.parseJSXStringLiteralAttribute = function () {
                var node = this.createJSXNode();
                var token = this.nextJSXToken();
                if (token.type !== 8 /* StringLiteral */) {
                    this.throwUnexpectedToken(token);
                }
                var raw = this.getTokenRaw(token);
                return this.finalize(node, new Node.Literal(token.value, raw));
            };

            JSXParser.prototype.parseJSXExpressionAttribute = function () {
                var node = this.createJSXNode();
                this.expectJSX('{');
                this.finishJSX();
                if (this.match('}')) {
                    this.tolerateError('JSX attributes must only be assigned a non-empty expression');
                }
                var expression = this.parseAssignmentExpression();
                this.reenterJSX();
                return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
            };

            JSXParser.prototype.parseJSXAttributeValue = function () {
                return this.matchJSX('{') ? this.parseJSXExpressionAttribute() :
                    this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
            };

            JSXParser.prototype.parseJSXNameValueAttribute = function () {
                var node = this.createJSXNode();
                var name = this.parseJSXAttributeName();
                var value = null;
                if (this.matchJSX('=')) {
                    this.expectJSX('=');
                    value = this.parseJSXAttributeValue();
                }
                return this.finalize(node, new JSXNode.JSXAttribute(name, value));
            };

            JSXParser.prototype.parseJSXSpreadAttribute = function () {
                var node = this.createJSXNode();
                this.expectJSX('{');
                this.expectJSX('...');
                this.finishJSX();
                var argument = this.parseAssignmentExpression();
                this.reenterJSX();
                return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
            };

            JSXParser.prototype.parseJSXAttributes = function () {
                var attributes = [];
                while (!this.matchJSX('/') && !this.matchJSX('>')) {
                    var attribute = this.matchJSX('{') ? this.parseJSXSpreadAttribute() :
                        this.parseJSXNameValueAttribute();
                    attributes.push(attribute);
                }
                return attributes;
            };

            JSXParser.prototype.parseJSXOpeningElement = function () {
                var node = this.createJSXNode();
                this.expectJSX('<');
                var name = this.parseJSXElementName();
                var attributes = this.parseJSXAttributes();
                var selfClosing = this.matchJSX('/');
                if (selfClosing) {
                    this.expectJSX('/');
                }
                this.expectJSX('>');
                return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
            };

            JSXParser.prototype.parseJSXBoundaryElement = function () {
                var node = this.createJSXNode();
                this.expectJSX('<');
                if (this.matchJSX('/')) {
                    this.expectJSX('/');
                    var name = this.parseJSXElementName();
                    this.expectJSX('>');
                    return this.finalize(node, new JSXNode.JSXClosingElement(name));
                }
                var name = this.parseJSXElementName();
                var attributes = this.parseJSXAttributes();
                var selfClosing = this.matchJSX('/');
                if (selfClosing) {
                    this.expectJSX('/');
                }
                this.expectJSX('>');
                return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
            };

            JSXParser.prototype.parseJSXEmptyExpression = function () {
                var node = this.createJSXChildNode();
                this.collectComments();
                this.lastMarker.index = this.scanner.index;
                this.lastMarker.line = this.scanner.lineNumber;
                this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                return this.finalize(node, new JSXNode.JSXEmptyExpression());
            };

            JSXParser.prototype.parseJSXExpressionContainer = function () {
                var node = this.createJSXNode();
                this.expectJSX('{');
                var expression;
                if (this.matchJSX('}')) {
                    expression = this.parseJSXEmptyExpression();
                    this.expectJSX('}');
                } else {
                    this.finishJSX();
                    expression = this.parseAssignmentExpression();
                    this.reenterJSX();
                }
                return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
            };

            JSXParser.prototype.parseJSXChildren = function () {
                var children = [];
                while (!this.scanner.eof()) {
                    var node = this.createJSXChildNode();
                    var token = this.nextJSXText();
                    if (token.start < token.end) {
                        var raw = this.getTokenRaw(token);
                        var child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                        children.push(child);
                    }
                    if (this.scanner.source[this.scanner.index] === '{') {
                        var container = this.parseJSXExpressionContainer();
                        children.push(container);
                    } else {
                        break;
                    }
                }
                return children;
            };

            JSXParser.prototype.parseComplexJSXElement = function (el) {
                var stack = [];
                while (!this.scanner.eof()) {
                    el.children = el.children.concat(this.parseJSXChildren());
                    var node = this.createJSXChildNode();
                    var element = this.parseJSXBoundaryElement();
                    if (element.type === jsx_syntax.JSXSyntax.JSXOpeningElement) {
                        var opening = element;
                        if (opening.selfClosing) {
                            var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                            el.children.push(child);
                        } else {
                            stack.push(el);
                            el = { node: node, opening: opening, closing: null, children: [] };
                        }
                    }
                    if (element.type === jsx_syntax.JSXSyntax.JSXClosingElement) {
                        el.closing = element;
                        var open = getQualifiedElementName(el.opening.name);
                        var close = getQualifiedElementName(el.closing.name);
                        if (open !== close) {
                            this.tolerateError('Expected corresponding JSX closing tag for %0', open);
                        }
                        if (stack.length > 0) {
                            var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                            el = stack[stack.length - 1];
                            el.children.push(child);
                            stack.pop();
                        } else {
                            break;
                        }
                    }
                }
                return el;
            };

            JSXParser.prototype.parseJSXElement = function () {
                var node = this.createJSXNode();
                var opening = this.parseJSXOpeningElement();
                var children = [];
                var closing = null;
                if (!opening.selfClosing) {
                    var el = this.parseComplexJSXElement({ node: node, opening: opening, closing: closing, children: children });
                    children = el.children;
                    closing = el.closing;
                }
                return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
            };

            JSXParser.prototype.parseJSXRoot = function () {
                if (this.config.tokens) {
                    this.tokens.pop();
                }
                this.startJSX();
                var element = this.parseJSXElement();
                this.finishJSX();
                return element;
            };

            JSXParser.prototype.isStartOfExpression = function () {
                return _super.prototype.isStartOfExpression.call(this) || this.match('<');
            };

            return JSXParser;
        }(parser_1.Parser));
        exports.JSXParser = JSXParser;
    },
    function (module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });

        var Regex = {
            NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\x066F\u0671-\u06D3\x06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\x0710\x0712-\u072\x074D-\u07A5\u07B1\x07CA-\u07\x07F4\x07F5\x07\x0800-\u0815\u081A\x0824\x0828\u0840-\u085\x08A0-\u085\x0904-\u0859\u0950\x0958-\x0961\x0971-\u980\u0985-\u089\u0990\u0993-\0928\u09AA-\0930\u0932\x0933\u0936-\u938\u093D\u093C\u095*\u0952\x097E\u09F0-\u9E\0\uA05-\uA0A\u0A0F\u0A13-\u08A8\u0A2A-\uA3\u0A32\xA36\u0A5\x0A3\x0B07\x0F\x0C5\x0C7uC08\x0C09\x0C12\u0C13-\u0C18\x0C1A-\C20\x0C9A9\u0Cb0`
        };
        exports.Character = {
            fromCodePoint: function (cp) {
                return (cp < 0x10000) ? String.fromCharCode(cp) :
                    String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
                    String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
            },
            isWhiteSpace: function (cp) {
                return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
                    (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
            },
            isLineTerminator: function (cp) {
                return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
            },
            isIdentifierStart: function (cp) {
                return (cp === 0x24) || (cp === 0x5F) ||
                    (cp >= 0x41 && cp <= 0x5A) ||
                    (cp >= 0x61 && cp <= 0x7A) ||
                    (cp === 0x5C) || 
                    ((cp >= 0x80) && Regex.NonAsciiIdentifierStart.test(exports.Character.fromCodePoint(cp)));
            },
            isIdentifierPart: function (cp) {
                return (cp === 0x24) || (cp === 0x5F) ||
                    (cp >= 0x41 && cp <= 0x5A) ||
                    (cp >= 0x61 && cp <= 0x7A) ||
                    (cp >= 0x30 && cp <= 0x39) ||
                    (cp === 0x5C) || 
                    ((cp >= 0x80) && Regex.NonAsciiIdentifierPart.test(exports.Character.fromCodePoint(cp)));
            },
            isDecimalDigit: function (cp) {
                return (cp >= 0x30 && cp <= 0x39); 
            },
            isHexDigit: function (cp) {
                return (cp >= 0x30 && cp <= 0x39) || 
                    (cp >= 0x‌41 && cp <= 0x46) || 
                    (cp >= 0x61 && cp <= 0x66);
            },
            isOctalDigit: function (cp) {
                return (cp >= 0x30 && cp <= 0x37);
            }
        };
    }, 
    function (module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        var jsx_syntax_1 = __webpack_require__(6);
        var JSXClosingElement = (function () {
            function JSXClosingElement(name) {
                this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement;
                this.name = name;
            }
            return JSXClosingElement;
        }());
        exports.JSXClosingElement = JSXClosingElement;
        
        var JSXElement = (function () {
            function JSXElement(openingElement, children, closingElement) {
                this.type = jsx_syntax_1.JSXSyntax.JSXElement;
                this.openingElement = openingElement;
                this.children = children;
                this.closingElement = closingElement;
            }
            return JSXElement;
        }());
        exports.JSXElement = JSXElement;
        
        var JSXEmptyExpression = (function () {
            function JSXEmptyExpression() {
                this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
            }
            return JSXEmptyExpression;
        }());
        exports.JSXEmptyExpression = JSXEmptyExpression;
        
        var JSXExpressionContainer = (function () {
            function JSXExpressionContainer(expression) {
                this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer;
                this.expression = expression;
            }
            return JSXExpressionContainer;
        }());
        exports.JSXExpressionContainer = JSXExpressionContainer;
        
        var JSXIdentifier = (function () {
            function JSXIdentifier(name) {
                this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier;
                this.name = name;
            }
            return JSXIdentifier;
        }());
        exports.JSXIdentifier = JSXIdentifier;
        
        var JSXMemberExpression = (function () {
            function JSXMemberExpression(object, property) {
                this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression;
                this.object = object;
                this.property = property;
            }
            return JSXMemberExpression;
        }());
        exports.JSXMemberExpression = JSXMemberExpression;
        
        var JSXAttribute = (function () {
            function JSXAttribute(name, value) {
                this.type = jsx_syntax_1.JSXSyntax.JSXAttribute;
                this.name = name;
                this.value = value;
            }
            return JSXAttribute;
        }());
        exports.JSXAttribute = JSXAttribute;
        
        var JSXNamespacedName = (function () {
            function JSXNamespacedName(namespace, name) {
                this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName;
                this.namespace = namespace;
                this.name = name;
            }
            return JSXNamespacedName;
        }());
        exports.JSXNamespacedName = JSXNamespacedName;
        
        var JSXOpeningElement = (function () {
            function JSXOpeningElement(name, selfClosing, attributes) {
                this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement;
                this.name = name;
                this.selfClosing = selfClosing;
                this.attributes = attributes;
            }
            return JSXOpeningElement;
        }());
        exports.JSXOpeningElement = JSXOpeningElement;
        
        var JSXSpreadAttribute = (function () {
            function JSXSpreadAttribute(argument) {
                this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute;
                this.argument = argument;
            }
            return JSXSpreadAttribute;
        }());
        exports.JSXSpreadAttribute = JSXSpreadAttribute;
        
        var JSXText = (function () {
            function JSXText(value, raw) {
                this.type = jsx_syntax_1.JSXSyntax.JSXText;
                this.value = value;
                this.raw = raw;
            }
            return JSXText;
        }());
        exports.JSXText = JSXText;
    },
    function (module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.JSXSyntax = {
            JSXAttribute: 'JSXAttribute',
            JSXClosingElement: 'JSXClosingElement',
            JSXElement: 'JSXElement',
            JSXEmptyExpression: 'JSXEmptyExpression',
            JSXExpressionContainer: 'JSXExpressionContainer',
            JSXIdentifier: 'JSXIdentifier',
            JSXMemberExpression: 'JSXMemberExpression',
            JSXNamespacedName: 'JSXNamespacedName',
            JSXOpeningElement: 'JSXOpeningElement',
            JSXSpreadAttribute: 'JSXSpreadAttribute',
            JSXText: 'JSXText'
        };
    }
]);
