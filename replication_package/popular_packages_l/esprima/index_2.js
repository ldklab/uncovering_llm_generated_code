// File: index.js
const TokenTypes = {
    Keyword: 'Keyword',
    Identifier: 'Identifier',
    Punctuator: 'Punctuator',
    Numeric: 'Numeric'
};

class Esprima {
    // A basic tokenizer that breaks down the input program into tokens
    tokenize(program) {
        let tokens = [];
        const tokenRegExp = /\s*(=>|const|var|{|}|\=|\d+|[A-Za-z_]\w*)\s*/g; // Regular expression for tokenization

        // Replacing segments using regular expressions to match and classify tokens
        program.replace(tokenRegExp, (match, token) => {
            let type;
            if (/const|var/.test(token)) type = TokenTypes.Keyword;  // Identify keywords
            else if (/=/.test(token)) type = TokenTypes.Punctuator;  // Identify punctuators
            else if (/\d+/.test(token)) type = TokenTypes.Numeric;   // Identify numbers
            else type = TokenTypes.Identifier;                       // Default to identifiers

            // Push token type and value into the tokens array
            tokens.push({ type, value: token });
        });

        return tokens;
    }

    // A basic parser that creates an Abstract Syntax Tree (AST) from tokens
    parseScript(program) {
        let tokens = this.tokenize(program);
        let body = [];
        let tokenIndex = 0;

        // Function to handle variable declarations
        function parseVariableDeclaration() {
            const token = tokens[tokenIndex++];
            if (token.type === TokenTypes.Keyword && token.value === 'const') {  // Check if token is 'const'
                const idToken = tokens[tokenIndex++];
                const eqToken = tokens[tokenIndex++];
                const numToken = tokens[tokenIndex++];
                
                // Validate expected sequence of Identifier = Numeric
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

        // Parse tokens until all are processed
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

// Exporting the class for external use
module.exports = Esprima;

// Usage example when run directly
if (require.main === module) {
    const esprima = new Esprima();
    const program = 'const answer = 42';
    console.log(esprima.tokenize(program)); // Outputs the tokens for the program string
    console.log(esprima.parseScript(program)); // Outputs the AST for the program string
}
