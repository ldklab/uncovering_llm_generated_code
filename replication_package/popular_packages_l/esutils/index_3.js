class ESUtils {

    static ast = {
        isExpression(node) {
            const expressionTypes = [
                'ArrayExpression', 'AssignmentExpression', 'BinaryExpression',
                'CallExpression', 'ConditionalExpression', 'FunctionExpression',
                'Identifier', 'LogicalExpression', 'MemberExpression', 'NewExpression',
                'ObjectExpression', 'SequenceExpression', 'ThisExpression',
                'UnaryExpression', 'UpdateExpression'
            ];
            return expressionTypes.includes(node.type);
        },

        isStatement(node) {
            const statementTypes = [
                'BlockStatement', 'BreakStatement', 'ContinueStatement',
                'DebuggerStatement', 'DoWhileStatement', 'EmptyStatement',
                'ExpressionStatement', 'ForInStatement', 'ForStatement', 'IfStatement',
                'LabeledStatement', 'ReturnStatement', 'SwitchStatement',
                'ThrowStatement', 'TryStatement', 'VariableDeclaration', 'WhileStatement',
                'WithStatement'
            ];
            return statementTypes.includes(node.type);
        },

        isIterationStatement(node) {
            const iterationTypes = [
                'DoWhileStatement', 'ForInStatement', 'ForStatement', 'WhileStatement'
            ];
            return iterationTypes.includes(node.type);
        },

        isSourceElement(node) {
            return ESUtils.ast.isStatement(node) || node.type === 'FunctionDeclaration';
        },

        trailingStatement(node) {
            return node.type === 'IfStatement' ? node.consequent : null;
        },

        isProblematicIfStatement(node) {
            return node.type === 'IfStatement' &&
                   node.consequent?.type === 'WithStatement' &&
                   node.consequent.body?.type === 'IfStatement' &&
                   node.consequent.body.consequent.type === 'EmptyStatement' &&
                   node.alternate.type === 'EmptyStatement';
        }
    };

    static code = {
        isDecimalDigit(code) {
            return code >= 48 && code <= 57;
        },

        isHexDigit(code) {
            return (code >= 48 && code <= 57) || 
                   (code >= 65 && code <= 70) || 
                   (code >= 97 && code <= 102);
        },

        isOctalDigit(code) {
            return code >= 48 && code <= 55;
        },

        isWhiteSpace(code) {
            return [32, 9, 0xB, 0xC, 160].includes(code) || (code >= 5760 && code <= 6158);
        },

        isLineTerminator(code) {
            return [10, 13, 0x2028, 0x2029].includes(code);
        },

        isIdentifierStart(code) {
            return code === 36 || code === 95 || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        },

        isIdentifierPart(code) {
            return this.isIdentifierStart(code) || this.isDecimalDigit(code);
        }
    };

    static keyword = {
        isKeywordES5(id, strict) {
            const keywords = [
                'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 
                'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 
                'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 
                'void', 'while', 'with'
            ];
            const strictKeywords = ['implements', 'interface', 'package', 'private', 
                'protected', 'public', 'static', 'yield'];
            return keywords.includes(id) || (strict && strictKeywords.includes(id));
        },

        isKeywordES6(id, strict) {
            const keywords = [
                'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
                'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
                'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
                'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
            ];
            const strictKeywords = ['await', 'implements', 'interface', 'package', 'private', 
                'protected', 'public', 'static', 'yield'];
            return keywords.includes(id) || (strict && strictKeywords.includes(id));
        },

        isReservedWordES5(id, strict) {
            return this.isKeywordES5(id, strict);
        },

        isReservedWordES6(id, strict) {
            return this.isKeywordES6(id, strict);
        },

        isRestrictedWord(id) {
            return ['eval', 'arguments'].includes(id);
        },

        isIdentifierNameES5(id) {
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id);
        },

        isIdentifierNameES6(id) {
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id);
        },

        isIdentifierES5(id, strict) {
            return this.isIdentifierNameES5(id) && !this.isKeywordES5(id, strict);
        },

        isIdentifierES6(id, strict) {
            return this.isIdentifierNameES6(id) && !this.isKeywordES6(id, strict);
        }
    };
}

module.exports = ESUtils;
