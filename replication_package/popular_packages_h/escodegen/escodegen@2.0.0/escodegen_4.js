/*global exports:true, require:true, global:true*/
(function () {
    'use strict';

    const estraverse = require('estraverse');
    const esutils = require('esutils');
    const { SourceNode } = require('source-map');

    const Syntax = estraverse.Syntax;

    const Precedence = {
        Sequence: 0, Yield: 1, Assignment: 1, Conditional: 2, ArrowFunction: 2,
        LogicalOR: 3, LogicalAND: 4, BitwiseOR: 5, BitwiseXOR: 6, BitwiseAND: 7,
        Equality: 8, Relational: 9, BitwiseSHIFT: 10, Additive: 11,
        Multiplicative: 12, Exponentiation: 13, Await: 14, Unary: 14,
        Postfix: 15, OptionalChaining: 16, Call: 17, New: 18, TaggedTemplate: 19,
        Member: 20, Primary: 21
    };

    const BinaryPrecedence = {
        '||': Precedence.LogicalOR, '&&': Precedence.LogicalAND, '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR, '&': Precedence.BitwiseAND, 
        '==': Precedence.Equality, '===': Precedence.Equality, '!=': Precedence.Equality,
        '<': Precedence.Relational, '<=': Precedence.Relational, '>': Precedence.Relational,
        'in': Precedence.Relational, 'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT, '>>': Precedence.BitwiseSHIFT, '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive, '-': Precedence.Additive, '*': Precedence.Multiplicative,
        '/': Precedence.Multiplicative, '%': Precedence.Multiplicative, '**': Precedence.Exponentiation
    };

    // Generation Flags
    const F_ALLOW_IN = 1, F_ALLOW_CALL = 1 << 1, F_ALLOW_UNPARATH_NEW = 1 << 2;
    const F_FUNC_BODY = 1 << 3, F_DIRECTIVE_CTX = 1 << 4, F_SEMICOLON_OPT = 1 << 5;

    // Default formatting options
    function getDefaultOptions() {
        return {
            indent: null, base: null, parse: null, comment: false,
            format: {
                indent: { style: '    ', base: 0, adjustMultilineComment: false },
                newline: '\n', space: ' ', json: false, renumber: false,
                hexadecimal: false, quotes: 'single', escapeless: false,
                compact: false, parentheses: true, semicolons: true,
                safeConcatenation: false, preserveBlankLines: false
            },
            moz: { comprehensionExpressionStartsWithAssignment: false, starlessGenerator: false },
            sourceMap: null, sourceMapRoot: null, sourceMapWithCode: false,
            directive: false, raw: true, verbatim: null, sourceCode: null
        };
    }

    // Utility functions
    function stringRepeat(str, num) {
        let result = '';
        for (num |= 0; num > 0; num >>>= 1, str += str) if (num & 1) result += str;
        return result;
    }

    function hasLineTerminator(str) {
        return (/[\\r\\n]/g).test(str);
    }

    function endsWithLineTerminator(str) {
        const len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }

    function merge(target, override) {
        for (const key in override) if (override.hasOwnProperty(key)) target[key] = override[key];
        return target;
    }

    function updateDeeply(target, override) {
        function isHashObject(obj) {
            return typeof obj === 'object' && obj instanceof Object && !(obj instanceof RegExp);
        }
        for (const key in override) if (override.hasOwnProperty(key)) {
            const val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) updateDeeply(target[key], val);
                else target[key] = updateDeeply({}, val);
            } else target[key] = val;
        }
        return target;
    }

    // Code Generator class
    function CodeGenerator() {}

    CodeGenerator.prototype.generateExpression = function(expr, precedence, flags) {
        const type = expr.type || Syntax.Property;
        const method = this[type];
        let result = method.call(this, expr, precedence, flags);
        if (extra.comment) result = addComments(expr, result);
        return toSourceNodeWhenNeeded(result, expr);
    };

    CodeGenerator.prototype.generateStatement = function(stmt, flags) {
        const method = this[stmt.type];
        let result = method.call(this, stmt, flags);
        if (extra.comment) result = addComments(stmt, result);
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === ''
            && result instanceof SourceNode && result.toString().charAt(result.length - 1) === '\n') {
                result = result.replaceRight(/\s+$/, '');
        }
        return result;
    };

    const FORMAT_MINIFY = {
        indent: { style: '', base: 0 },
        renumber: true, hexadecimal: true, quotes: 'auto',
        escapeless: true, compact: true, parentheses: false, semicolons: false
    };

    const FORMAT_DEFAULTS = getDefaultOptions().format;

    function generate(node, options) {
        const defaultOptions = getDefaultOptions();
        if (options != null) {
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) newline = space = indent = base = '';
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        sourceCode = options.sourceCode;
        preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
        extra = options;

        const codegen = new CodeGenerator();
        let result = codegen.generateInternal(node);

        if (!sourceMap) return { code: result.toString(), map: null };
        
        let pair = result.toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot
        });

        if (options.sourceContent) pair.map.setSourceContent(options.sourceMap, options.sourceContent);

        return options.sourceMapWithCode ? pair : pair.map.toString();
    }

    exports.version = require('./package.json').version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
}());
