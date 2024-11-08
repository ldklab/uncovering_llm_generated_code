/*global exports:true, require:true, global:true*/
(function () {
    'use strict';

    var estraverse = require('estraverse'),
        esutils = require('esutils'),
        SourceNode,  // Conditional import for source-map usage
        Precedence = {
            Sequence: 0, Yield: 1, Assignment: 1, Conditional: 2, /* ...more types */
        },
        BinaryPrecedence = {
            '??': Precedence.Coalesce, '||': Precedence.LogicalOR, /* ...more operators */
        },
        // Expression and statement flags
        F_ALLOW_IN = 1, F_ALLOW_CALL = 1 << 1, /* ...more flags */
        E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, /* ...more expression flags */
        S_TFFF = F_ALLOW_IN, S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT, /* ...more statement flags */
        indent, base, json, renumber, hexadecimal, quotes, escapeless, newline, space, parentheses, semicolons, safeConcatenation, directive, extra, sourceMap, sourceCode, preserveBlankLines;

    function getDefaultOptions() {
        return {
            indent: null, base: null, parse: null, comment: false,
            format: {
                indent: { style: '    ', base: 0 },
                newline: '\n', space: ' ', json: false, renumber: false, hexadecimal: false,
                quotes: 'single', escapeless: false, compact: false, parentheses: true,
                semicolons: true, safeConcatenation: false, preserveBlankLines: false
            },
            moz: { comprehensionExpressionStartsWithAssignment: false, starlessGenerator: false },
            sourceMap: null, sourceMapRoot: null, sourceMapWithCode: false, directive: false,
            raw: true, verbatim: null, sourceCode: null
        };
    }

    function merge(target, override) {
        for (var key in override) {
            if (override.hasOwnProperty(key)) {
                target[key] = override[key];
            }
        }
        return target;
    }

    function updateDeeply(target, override) {
        var key, val;
        function isHashObject(obj) {
            return typeof obj === 'object' && obj instanceof Object && !(obj instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    // Generate source code based on the type of node
    function generateInternal(node) {
        var codegen = new CodeGenerator();
        if (isStatement(node)) {
            return codegen.generateStatement(node, S_TFFF);
        }
        if (isExpression(node)) {
            return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
        }
        throw new Error('Unknown node type: ' + node.type);
    }

    function generate(node, options) {
        options = updateDeeply(getDefaultOptions(), options || {});
        indent = options.format.indent.style || '';
        base = stringRepeat(indent, options.format.indent.base || 0);
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = options.format.hexadecimal;
        quotes = options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        sourceMap = options.sourceMap;
        sourceCode = options.sourceCode;
        preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
        extra = options;

        if (sourceMap) {
            SourceNode = require('source-map').SourceNode;
        }

        var result = generateInternal(node);

        if (!sourceMap) {
            return typeof result === 'string' ? result : result.toString();
        }

        var pair = result.toStringWithSourceMap({ file: options.file, sourceRoot: options.sourceMapRoot });
        if (options.sourceContent) {
            pair.map.setSourceContent(options.sourceMap, options.sourceContent);
        }
        return options.sourceMapWithCode ? pair : pair.map.toString();
    }

    function isExpression(node) {
        return CodeGenerator.Expression.hasOwnProperty(node.type);
    }

    function isStatement(node) {
        return CodeGenerator.Statement.hasOwnProperty(node.type);
    }

    function stringRepeat(str, num) {
        return new Array(num + 1).join(str);
    }

    function addComments(node, generatedCode) {
        var result = generatedCode;
        if (extra.comment) {
            if (node.leadingComments) {
                node.leadingComments.forEach(function (comment) {
                    result = '/* ' + comment.value + ' */\n' + result;
                });
            }
            if (node.trailingComments) {
                node.trailingComments.forEach(function (comment) {
                    result += '\n/* ' + comment.value + ' */';
                });
            }
        }
        return result;
    }

    function parenthesize(text, current, should) {
        return current < should ? '(' + text + ')' : text;
    }

    function CodeGenerator() {}

    CodeGenerator.prototype = {
        generateStatement: function (stmt, flags) {
            var result = this[stmt.type](stmt, flags);
            result = addComments(stmt, result);
            return result;
        },
        generateExpression: function (expr, precedence, flags) {
            var result = this[expr.type || Syntax.Property](expr, precedence, flags);
            result = addComments(expr, result);
            return result;
        },
        BlockStatement: function (stmt, flags) {
            var result = '{\n' + stmt.body.map(b => this.generateStatement(b, flags)).join('\n') + '\n}';
            return result;
        },
        // Additional methods for other Syntax types ...
    };

    // Besides generating expressions and statements, methods for flattening arrays, handling specific node types, and working with different output formats are utilized throughout.

    exports.generate = generate;
    exports.version = require('./package.json').version;
}());
