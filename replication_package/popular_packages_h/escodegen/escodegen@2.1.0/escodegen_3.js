(function () {
    'use strict';

    const estraverse = require('estraverse');
    const esutils = require('esutils');
    
    let Syntax = estraverse.Syntax;
    const Precedence = {
        Sequence: 0, Assignment: 1, Conditional: 2, ArrowFunction: 2, Coalesce: 3,
        LogicalOR: 4, LogicalAND: 5, BitwiseOR: 6, BitwiseXOR: 7, BitwiseAND: 8,
        Equality: 9, Relational: 10, BitwiseSHIFT: 11, Additive: 12,
        Multiplicative: 13, Exponentiation: 14, Await: 15, Unary: 15, Postfix: 16,
        OptionalChaining: 17, Call: 18, New: 19, TaggedTemplate: 20,
        Member: 21, Primary: 22
    };
    const BinaryPrecedence = {
        '??': Precedence.Coalesce, '||': Precedence.LogicalOR, '&&': Precedence.LogicalAND, '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR, '&': Precedence.BitwiseAND, '==': Precedence.Equality, '!=': Precedence.Equality,
        '===': Precedence.Equality, '!==': Precedence.Equality, 'is': Precedence.Equality, 'isnt': Precedence.Equality,
        '<': Precedence.Relational, '>': Precedence.Relational, '<=': Precedence.Relational, '>=': Precedence.Relational,
        'in': Precedence.Relational, 'instanceof': Precedence.Relational, '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT, '>>>': Precedence.BitwiseSHIFT, '+': Precedence.Additive, '-': Precedence.Additive,
        '*': Precedence.Multiplicative, '%': Precedence.Multiplicative, '/': Precedence.Multiplicative,
        '**': Precedence.Exponentiation
    };

    // Configure Format Minified and Defaults Options.
    const FORMAT_MINIFY = {
        indent: { style: '', base: 0 }, renumber: true, hexadecimal: true,
        quotes: 'auto', escapeless: true, compact: true, parentheses: false, semicolons: false
    };
    const FORMAT_DEFAULTS = {
        indent: { style: '    ', base: 0, adjustMultilineComment: false },
        newline: '\n', space: ' ', json: false, renumber: false, hexadecimal: false,
        quotes: 'single', escapeless: false, compact: false, parentheses: true, semicolons: true,
        safeConcatenation: false, preserveBlankLines: false
    };

    function getDefaultOptions() {
        return {
            indent: null, base: null, parse: null, comment: false, format: {...FORMAT_DEFAULTS},
            moz: { comprehensionExpressionStartsWithAssignment: false, starlessGenerator: false },
            sourceMap: null, sourceMapRoot: null, sourceMapWithCode: false, directive: false,
            raw: true, verbatim: null, sourceCode: null
        };
    }

    function stringRepeat(str, num) {
        let result = '';
        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) result += str;
        }
        return result;
    }

    function merge(target, override) {
        for (const key in override) if (override.hasOwnProperty(key)) target[key] = override[key];
        return target;
    }

    function updateDeeply(target, override) {
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                const val = override[key];
                if (typeof val === 'object' && val instanceof Object && !(val instanceof RegExp)) {
                    if (typeof target[key] === 'object' && target[key] instanceof Object && !(target[key] instanceof RegExp)) {
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

    class CodeGenerator {
        constructor() {}
        
        generateExpression(expr, precedence, flags) {
            let result, type = expr.type || Syntax.Property;
            if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) return generateVerbatim(expr, precedence);
            result = this[type](expr, precedence, flags);
            if (extra.comment) result = addComments(expr, result);
            return toSourceNodeWhenNeeded(result, expr);
        }

        generateStatement(stmt, flags) {
            let result = this[stmt.type](stmt, flags);
            if (extra.comment) result = addComments(stmt, result);
            const fragment = toSourceNodeWhenNeeded(result).toString();
            if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
                result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
            }
            return toSourceNodeWhenNeeded(result, stmt);
        }
        
        // Additional methods would be here for handling specific node types...
    }

    function generateInternal(node) {
        const codegen = new CodeGenerator();
        if (isStatement(node)) return codegen.generateStatement(node, S_TFFF);
        if (isExpression(node)) return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
        throw new Error('Unknown node type: ' + node.type);
    }

    function generate(node, options) {
        let defaultOptions = getDefaultOptions();
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
        if (sourceMap) SourceNode = require('source-map').SourceNode;
        const result = generateInternal(node);
        if (!sourceMap) return options.sourceMapWithCode ? { code: result.toString(), map: null } : result.toString();
        let pair = result.toStringWithSourceMap({ file: options.file, sourceRoot: options.sourceMapRoot });
        if (options.sourceContent) pair.map.setSourceContent(options.sourceMap, options.sourceContent);
        return options.sourceMapWithCode ? pair : pair.map.toString();
    }

    // Apply the options, initializing global variables.
    let base, indent, json, renumber, hexadecimal, quotes, escapeless, newline, space, parentheses, semicolons, safeConcatenation, directive, parse, sourceMap, sourceCode, preserveBlankLines, extra;
    const S_TFFF = 1, E_TTT = 1;
    let isStatement = node => typeof node === 'object' && !!node.type;
    let isExpression = node => typeof node === 'object' && !!node.type;
    let toSourceNodeWhenNeeded = (result, node) => result;

    // Export the module
    exports.version = require('./package.json').version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
})();
