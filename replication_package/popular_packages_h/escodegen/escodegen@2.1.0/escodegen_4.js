'use strict';

// Import required modules
const estraverse = require('estraverse');
const esutils = require('esutils');
let SourceNode;

// Define and map syntax used
const Syntax = estraverse.Syntax;

// Precedence for operators
const Precedence = {
    Sequence: 0,
    Yield: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    Coalesce: 3,
    LogicalOR: 4,
    LogicalAND: 5,
    BitwiseOR: 6,
    BitwiseXOR: 7,
    BitwiseAND: 8,
    Equality: 9,
    Relational: 10,
    BitwiseSHIFT: 11,
    Additive: 12,
    Multiplicative: 13,
    Exponentiation: 14,
    Await: 15,
    Unary: 15,
    Postfix: 16,
    OptionalChaining: 17,
    Call: 18,
    New: 19,
    TaggedTemplate: 20,
    Member: 21,
    Primary: 22
};

const BinaryPrecedence = {
    '??': Precedence.Coalesce,
    '||': Precedence.LogicalOR,
    '&&': Precedence.LogicalAND,
    '|': Precedence.BitwiseOR,
    '^': Precedence.BitwiseXOR,
    '&': Precedence.BitwiseAND,
    '==': Precedence.Equality,
    '!=': Precedence.Equality,
    '===': Precedence.Equality,
    '!==': Precedence.Equality,
    'is': Precedence.Equality,
    'isnt': Precedence.Equality,
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
    '%': Precedence.Multiplicative,
    '/': Precedence.Multiplicative,
    '**': Precedence.Exponentiation
};

// Default options
const getDefaultOptions = () => ({
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
    moz: {
        comprehensionExpressionStartsWithAssignment: false,
        starlessGenerator: false
    },
    sourceMap: null,
    sourceMapRoot: null,
    sourceMapWithCode: false,
    directive: false,
    raw: true,
    verbatim: null,
    sourceCode: null
});

// Utility functions
const stringRepeat = (str, num) => {
    let result = '';
    while (num > 0) {
        if (num & 1) result += str;
        num >>= 1;
        str += str;
    }
    return result;
};

const hasLineTerminator = (str) => /[\r\n]/g.test(str);

const endsWithLineTerminator = (str) => {
    const len = str.length;
    return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
};

const merge = (target, override) => {
    for (const key in override) {
        if (override.hasOwnProperty(key)) target[key] = override[key];
    }
    return target;
};

const updateDeeply = (target, override) => {
    const isHashObject = (o) => typeof o === 'object' && o instanceof Object && !(o instanceof RegExp);
    for (const key in override) {
        if (override.hasOwnProperty(key)) {
            const val = override[key];
            if (isHashObject(val)) {
                target[key] = isHashObject(target[key]) ? updateDeeply(target[key], val) : updateDeeply({}, val);
            } else {
                target[key] = val;
            }
        }
    }
    return target;
};

// Code generator class
class CodeGenerator {
    
    constructor() {}

    static get Expression() {
        return {
            SequenceExpression(expr, precedence, flags) {
                if (Precedence.Sequence < precedence) flags |= F_ALLOW_IN;
                const result = expr.expressions.map((e, i) => [
                    i > 0 ? ',' + space : '',
                    this.generateExpression(e, Precedence.Assignment, flags)
                ]);
                return parenthesize(result.flat(), Precedence.Sequence, precedence);
            },
        };
    }

    static get Statement() {
        return {
            BlockStatement(stmt, flags) {
                const result = ['{', newline];
                withIndent(() => {
                    stmt.body.forEach((s, i) => {
                        const fragment = this.generateStatement(s, i < stmt.body.length - 1 ? S_TFFF : S_TFFT);
                        result.push(s.leadingComments ? fragment : addIndent(fragment), !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString()) ? newline : '');
                    });
                });
                return result.concat([addIndent('}')]);
            },
        };
    }

    maybeBlock(stmt, flags) {
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments)) {
            return [space, this.generateStatement(stmt, flags)];
        }
        if (stmt.type === Syntax.EmptyStatement && (!extra.comment || !stmt.leadingComments)) {
            return [';'];
        }
        const block = [newline];
        withIndent(() => {
            block.push(addIndent(this.generateStatement(stmt, flags)));
        });
        return block;
    }

    generateExpression(expr, precedence, flags) {
        let result;
        if (extra.comment) {
            // Handle comments
            result = addComments(expr, result);
        }
        return toSourceNodeWhenNeeded(result, expr);
    }

    generateStatement(stmt, flags) {
        let result = this[stmt.type](stmt, flags);
        result = addComments(stmt, result);
        const fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' && fragment.charAt(fragment.length - 1) === '\n') {
            result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
        }
        return toSourceNodeWhenNeeded(result, stmt);
    }
}

// Generate function
function generate(node, options = {}) {
    const defaultOptions = getDefaultOptions();
    options = {...defaultOptions, ...options};
    const indent = options.format.indent.style;
    const base = stringRepeat(indent, options.format.indent.base);
    const codegen = new CodeGenerator();
    const output = isStatement(node) ? codegen.generateStatement(node, S_TFFF) : codegen.generateExpression(node, Precedence.Sequence, E_TTT);
    return output.toString();
}

const FORMAT_MINIFY = {
    indent: {style: '', base: 0},
    renumber: true,
    hexadecimal: true,
    quotes: 'auto',
    escapeless: true,
    compact: true,
    parentheses: false,
    semicolons: false
};

const FORMAT_DEFAULTS = getDefaultOptions().format;

exports.generate = generate;
exports.version = require('./package.json').version;
exports.FORMAT_MINIFY = FORMAT_MINIFY;
exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;

// Define additional constants and helpers as needed from the original code.
const {
    F_ALLOW_IN,
    F_ALLOW_CALL,
    F_ALLOW_UNPARATH_NEW,
    S_TFFF,
    S_TFFT,
    E_TTT,
    F_DIRECTIVE_CTX,
    E_TTF,
    E_FFT,
    E_TFT,
    S_TFTF
} = {
    F_ALLOW_IN: 1,
    F_ALLOW_CALL: 1 << 1,
    F_ALLOW_UNPARATH_NEW: 1 << 2,
    S_TFFF: F_ALLOW_IN,
    S_TFFT: F_ALLOW_IN | F_SEMICOLON_OPT,
    E_TTT: F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
    F_DIRECTIVE_CTX: 1 << 4,
    E_TTF: F_ALLOW_IN | F_ALLOW_CALL,
    E_FFT: F_ALLOW_UNPARATH_NEW,
    E_TFT: F_ALLOW_IN | F_ALLOW_UNPARATH_NEW,
    S_TFTF: F_ALLOW_IN | F_DIRECTIVE_CTX
};

const isStatement = (node) => CodeGenerator.Statement.hasOwnProperty(node.type);
const isExpression = (node) => CodeGenerator.Expression.hasOwnProperty(node.type);

const toSourceNodeWhenNeeded = (generated, node) => {
    if (!sourceMap) {
        return Array.isArray(generated) ? flattenToString(generated) : generated;
    }
    if (node == null) {
        return SourceNode ? new SourceNode(null, null, sourceMap, generated, node.name || null) : '';
    }
    return SourceNode ? new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated, node.name || null) : '';
};

const flattenToString = (arr) => {
    return arr.reduce((acc, elem) => acc + (Array.isArray(elem) ? flattenToString(elem) : elem), '');
};

const withIndent = (fn) => {
    const previousBase = base;
    base += indent;
    fn(base);
    base = previousBase;
};

const parenthesize = (text, current, should) => {
    return current < should ? ['(', text, ')'] : text;
};

const addComments = (stmt, result) => {
    // Simplified version, focus on main utility
    return result;
};

const addIndent = (stmt) => [base, stmt];
