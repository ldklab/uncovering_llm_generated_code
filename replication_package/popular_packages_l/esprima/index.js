// File: index.js
const TokenTypes = {
    Keyword: 'Keyword',
    Identifier: 'Identifier',
    Punctuator: 'Punctuator',
    Numeric: 'Numeric'
};

class Esprima {
    // Simple tokenizer for demonstration purposes
    tokenize(program) {
        let tokens = [];
        const tokenRegExp = /\s*(=>|const|var|{|}|\=|\d+|[A-Za-z_]\w*)\s*/g; // Simplified

        program.replace(tokenRegExp, (match, token) => {
            let type;
            if (/const|var/.test(token)) type = TokenTypes.Keyword;
            else if (/=/.test(token)) type = TokenTypes.Punctuator;
            else if (/\d+/.test(token)) type = TokenTypes.Numeric;
            else type = TokenTypes.Identifier;

            tokens.push({ type, value: token });
        });

        return tokens;
    }

    // Simple parser for demonstration purposes
    parseScript(program) {
        let tokens = this.tokenize(program);
        let body = [];
        let tokenIndex = 0;

        function parseVariableDeclaration() {
            const token = tokens[tokenIndex++];
            if (token.type === TokenTypes.Keyword && token.value === 'const') {
                const idToken = tokens[tokenIndex++];
                const eqToken = tokens[tokenIndex++];
                const numToken = tokens[tokenIndex++];
                
                if (idToken.type === TokenTypes.Identifier && 
                    eqToken.value === '=' && 
                    numToken.type === TokenTypes.Numeric) {
                    return {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: { type: 'Identifier', name: idToken.value },
                                init: { type: 'Literal', value: Number(numToken.value) }
                            }
                        ],
                        kind: 'const'
                    };
                }
            }
            throw new Error('Unexpected token');
        }

        while (tokenIndex < tokens.length) {
            body.push(parseVariableDeclaration());
        }

        return {
            type: 'Program',
            body: body,
            sourceType: 'script'
        };
    }
}

// Exporting the class for usage
module.exports = Esprima;

// Usage Example
if (require.main === module) {
    const esprima = new Esprima();
    const program = 'const answer = 42';
    console.log(esprima.tokenize(program));
    console.log(esprima.parseScript(program));
}