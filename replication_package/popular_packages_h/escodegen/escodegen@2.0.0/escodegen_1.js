// Module Imports
'use strict';
const estraverse = require('estraverse');
const esutils = require('esutils');
const { SourceNode } = require('source-map'); // Assuming use in non-browser context

// Precedence Levels
const Precedence = {
    Sequence: 0,
    Yield: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    LogicalOR: 3,
    LogicalAND: 4,
    BitwiseOR: 5,
    BitwiseXOR: 6,
    BitwiseAND: 7,
    Equality: 8,
    Relational: 9,
    BitwiseSHIFT: 10,
    Additive: 11,
    Multiplicative: 12,
    Exponentiation: 13,
    Await: 14,
    Unary: 14,
    Postfix: 15,
    OptionalChaining: 16,
    Call: 17,
    New: 18,
    TaggedTemplate: 19,
    Member: 20,
    Primary: 21
};

// Binary Operator Precedence
const BinaryPrecedence = {
    '||': Precedence.LogicalOR,
    '&&': Precedence.LogicalAND,
    '|': Precedence.BitwiseOR,
    '^': Precedence.BitwiseXOR,
    '&': Precedence.BitwiseAND,
    '==': Precedence.Equality,
    '!=': Precedence.Equality,
    '===': Precedence.Equality,
    '!==': Precedence.Equality,
    '<': Precedence.Relational,
    '>': Precedence.Relational,
    '<=': Precedence.Relational,
    '>=': Precedence.Relational,
    'in': Precedence.Relational,
    'instanceof': Precedence.Relational,
    '<<': Precedence.BitwiseSHIFT,
    '>>': Precedence.BitwiseSHIFT,
    '>>>': Precedence.BitwiseSHIFT,
    '+': Precedence.Additive,
    '-': Precedence.Additive,
    '*': Precedence.Multiplicative,
    '/': Precedence.Multiplicative,
    '%': Precedence.Multiplicative,
    '**': Precedence.Exponentiation
};

// Default Options for Formatting
function getDefaultOptions() {
    return {
        indent: null,
        base: null,
        parse: null,
        comment: false,
        format: {
            indent: {
                style: '    ',
                base: 0,
                adjustMultilineComment: false
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false,
            preserveBlankLines: false
        },
        sourceMap: null,
        directive: false,
        raw: true,
        verbatim: null,
        sourceCode: null
    };
}

// Utility Functions
function stringRepeat(str, num) {
    let result = '';
    for (num |= 0; num > 0; num >>>= 1, str += str) {
        if (num & 1) {
            result += str;
        }
    }
    return result;
}

function hasLineTerminator(str) {
    return (/[\r\n]/g).test(str);
}

function merge(target, override) {
    for (const key in override) {
        if (override.hasOwnProperty(key)) {
            target[key] = override[key];
        }
    }
    return target;
}

function generateInternal(node) {
    const codegen = new CodeGenerator();
    if (isStatement(node)) {
        return codegen.generateStatement(node, S_TFFF);
    }
    if (isExpression(node)) {
        return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
    }
    throw new Error(`Unknown node type: ${node.type}`);
}

function generate(node, options) {
    const defaultOptions = getDefaultOptions();
    let base, indent, newline, space, parentheses, semicolons;
    if (options != null) {
        if (typeof options.indent === 'string') {
            defaultOptions.format.indent.style = options.indent;
        }
        if (typeof options.base === 'number') {
            defaultOptions.format.indent.base = options.base;
        }
        options = updateDeeply(defaultOptions, options);
        indent = options.format.indent.style;
        base = typeof options.base === 'string' ? options.base : stringRepeat(indent, options.format.indent.base);
    } else {
        options = defaultOptions;
        indent = options.format.indent.style;
        base = stringRepeat(indent, options.format.indent.base);
    }
    const json = options.format.json;
    const renumber = options.format.renumber;
    const hexadecimal = json ? false : options.format.hexadecimal;
    const quotes = json ? 'double' : options.format.quotes;
    const escapeless = options.format.escapeless;
    newline = options.format.newline;
    space = options.format.space;
    if (options.format.compact) {
        newline = space = indent = base = '';
    }
    parentheses = options.format.parentheses;
    semicolons = options.format.semicolons;
    const safeConcatenation = options.format.safeConcatenation;
    const directive = options.directive;
    const parse = json ? null : options.parse;
    const sourceMap = options.sourceMap;
    const sourceCode = options.sourceCode;
    const preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
    const extra = options;

    let result = generateInternal(node);
    if (!sourceMap) {
        return options.sourceMapWithCode ? { code: result.toString(), map: null } : result.toString();
    }

    let pair = result.toStringWithSourceMap({ file: options.file, sourceRoot: options.sourceMapRoot });
    if (options.sourceContent) {
        pair.map.setSourceContent(options.sourceMap, options.sourceContent);
    }
    return options.sourceMapWithCode ? pair : pair.map.toString();
}

// Export
module.exports = {
    generate,
    getDefaultOptions,
    Precedence
};
