class ESUtils {

    static ast = {
        isExpression(node) {
            const expressions = [
                'ArrayExpression', 'AssignmentExpression', 'BinaryExpression',
                'CallExpression', 'ConditionalExpression', 'FunctionExpression',
                'Identifier', 'LogicalExpression', 'MemberExpression', 'NewExpression',
                'ObjectExpression', 'SequenceExpression', 'ThisExpression',
                'UnaryExpression', 'UpdateExpression'
            ];
            return expressions.includes(node.type);
        },

        isStatement(node) {
            const statements = [
                'BlockStatement', 'BreakStatement', 'ContinueStatement',
                'DebuggerStatement', 'DoWhileStatement', 'EmptyStatement',
                'ExpressionStatement', 'ForInStatement', 'ForStatement', 'IfStatement',
                'LabeledStatement', 'ReturnStatement', 'SwitchStatement',
                'ThrowStatement', 'TryStatement', 'VariableDeclaration', 'WhileStatement',
                'WithStatement'
            ];
            return statements.includes(node.type);
        },

        isIterationStatement(node) {
            const iterationStatements = [
                'DoWhileStatement', 'ForInStatement', 'ForStatement', 'WhileStatement'
            ];
            return iterationStatements.includes(node.type);
        },

        isSourceElement(node) {
            return ESUtils.ast.isStatement(node) || node.type === 'FunctionDeclaration';
        },

        trailingStatement(node) {
            if (node.type === 'IfStatement') {
                return node.consequent;
            }
            return null;
        },

        isProblematicIfStatement(node) {
            return node.type === 'IfStatement' &&
                   node.consequent && node.consequent.type === 'WithStatement' &&
                   node.consequent.body && node.consequent.body.type === 'IfStatement' &&
                   node.consequent.body.consequent.type === 'EmptyStatement' &&
                   node.alternate.type === 'EmptyStatement';
        }
    };

    static code = {
        isDecimalDigit(code) {
            return code >= 48 && code <= 57;  // 0-9
        },

        isHexDigit(code) {
            return (code >= 48 && code <= 57) || // 0-9
                   (code >= 65 && code <= 70) || // A-F
                   (code >= 97 && code <= 102);  // a-f
        },

        isOctalDigit(code) {
            return code >= 48 && code <= 55;  // 0-7
        },

        isWhiteSpace(code) {
            return (code === 32) ||    // space
                   (code === 9) ||     // tab
                   (code === 0xB) ||   // vertical tab
                   (code === 0xC) ||   // form feed
                   (code === 160) ||   // non-breaking space
                   (code >= 5760 && code <= 6158);  // other unicode whitespaces
        },

        isLineTerminator(code) {
            return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
        },

        isIdentifierStart(code) {
            return (code === 36) ||   // $
                (code === 95) ||      // _
                (code >= 65 && code <= 90) ||    // A-Z
                (code >= 97 && code <= 122);     // a-z
        },

        isIdentifierPart(code) {
            return ESUtils.code.isIdentifierStart(code) || ESUtils.code.isDecimalDigit(code);
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
            return ESUtils.keyword.isKeywordES5(id, strict);
        },

        isReservedWordES6(id, strict) {
            return ESUtils.keyword.isKeywordES6(id, strict);
        },

        isRestrictedWord(id) {
            return id === 'eval' || id === 'arguments';
        },

        isIdentifierNameES5(id) {
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id);
        },

        isIdentifierNameES6(id) {
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id);
        },

        isIdentifierES5(id, strict) {
            return ESUtils.keyword.isIdentifierNameES5(id) &&
                   !ESUtils.keyword.isKeywordES5(id, strict);
        },

        isIdentifierES6(id, strict) {
            return ESUtils.keyword.isIdentifierNameES6(id) &&
                   !ESUtils.keyword.isKeywordES6(id, strict);
        }
    };
}

module.exports = ESUtils;
