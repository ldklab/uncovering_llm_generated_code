// Reorganized JavaScript Code Generator

const estraverse = require('estraverse');
const esutils = require('esutils');

// Constants and Flags
const Precedence = {
    Sequence: 0, Yield: 1, Assignment: 1, Conditional: 2, ArrowFunction: 2,
    LogicalOR: 3, LogicalAND: 4, BitwiseOR: 5, BitwiseXOR: 6, BitwiseAND: 7,
    Equality: 8, Relational: 9, BitwiseSHIFT: 10, Additive: 11, Multiplicative: 12,
    Exponentiation: 13, Await: 14, Unary: 14, Postfix: 15, OptionalChaining: 16,
    Call: 17, New: 18, TaggedTemplate: 19, Member: 20, Primary: 21
};

const Syntax = estraverse.Syntax;

// Helper Functions
function stringRepeat(str, num) {
    return Array(num + 1).join(str);
}

function addIndent(stmt, base, indent) {
    return [base, stmt];
}

function withIndent(fn, base, indent) {
    let previousBase = base;
    base += indent;
    fn(base);
    base = previousBase;
}

// CodeGenerator Class
class CodeGenerator {
    generateExpression(node, precedence, flags) {
        let type = node.type || Syntax.Property;
        let method = CodeGenerator.Expression[type];
        if (method) {
            return method.call(this, node, precedence, flags);
        }
        throw new Error('Unknown node type: ' + node.type);
    }

    generateStatement(node, flags) {
        let type = node.type || Syntax.Property;
        let method = CodeGenerator.Statement[type];
        if (method) {
            return method.call(this, node, flags);
        }
        throw new Error('Unknown node type: ' + node.type);
    }
}

// Statement and Expression Generators
CodeGenerator.Statement = {
    Program(stmt, flags) {
        return stmt.body.map(this.generateStatement, this);
    },
    FunctionDeclaration(stmt, flags) {
        return ['function', stmt.id.name, '() ', this.generateStatement(stmt.body, flags)];
    },
    // Additional handlers...
};

CodeGenerator.Expression = {
    Identifier(expr, precedence, flags) {
        return expr.name;
    },
    Literal(expr, precedence, flags) {
        return expr.raw || expr.value;
    },
    // Additional handlers...
};

// Main Function
function generate(node, options = {}) {
    let generator = new CodeGenerator();
    return (isStatement(node) ? 
            generator.generateStatement(node, 0) : 
            generator.generateExpression(node, Precedence.Sequence, 0)
           ).join('');
}

function isStatement(node) {
    return CodeGenerator.Statement.hasOwnProperty(node.type);
}

function isExpression(node) {
    return CodeGenerator.Expression.hasOwnProperty(node.type);
}

module.exports = {
    generate,
    Precedence,
    Syntax
};

// Generate Options
function getDefaultOptions() {
    return {
        format: {
            indent: { style: '    ', base: 0 },
            newline: '\n', space: ' ', quotes: 'single'
        }
    };
} 
