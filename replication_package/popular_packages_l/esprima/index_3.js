// File: index.js
const TokenTypes = {
    Keyword: 'Keyword',
    Identifier: 'Identifier',
    Punctuator: 'Punctuator',
    Numeric: 'Numeric'
};

class Esprima {
    // This method tokenizes a given JavaScript program string
    tokenize(program) {
        let tokens = [];
        // Regular expression to match JavaScript tokens: keywords, identifiers, punctuators, numbers
        const tokenRegExp = /\s*(=>|const|var|{|}|\=|\d+|[A-Za-z_]\w*)\s*/g;

        // Use replace to iterate over the matches and categorize each token
        program.replace(tokenRegExp, (match, token) => {
            let type;
            if (/const|var/.test(token)) type = TokenTypes.Keyword; // Matches JavaScript keywords
            else if (/=/.test(token)) type = TokenTypes.Punctuator; // Matches assignment operator
            else if (/\d+/.test(token)) type = TokenTypes.Numeric;  // Matches numeric literals
            else type = TokenTypes.Identifier;  // Matches variable names and identifiers

            // Add the identified token with its type to the tokens array
            tokens.push({ type, value: token });
        });

        // Return the array of tokens
        return tokens;
    }

    // This method parses a JavaScript program and returns an AST (abstract syntax tree)
    parseScript(program) {
        let tokens = this.tokenize(program);
        let body = [];
        let tokenIndex = 0;

        // Helper function to parse variable declarations
        function parseVariableDeclaration() {
            const token = tokens[tokenIndex++];
            if (token.type === TokenTypes.Keyword && token.value === 'const') {
                const idToken = tokens[tokenIndex++];
                const eqToken = tokens[tokenIndex++];
                const numToken = tokens[tokenIndex++];
                
                if (idToken.type === TokenTypes.Identifier && 
                    eqToken.value === '=' && 
                    numToken.type === TokenTypes.Numeric) {
                    // Return a simple AST node representing a variable declaration
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
            // If the structure doesn't match, throw an error
            throw new Error('Unexpected token');
        }

        // Loop through the tokens and parse each statement
        while (tokenIndex < tokens.length) {
            body.push(parseVariableDeclaration());
        }

        // Return the program's abstract syntax tree
        return {
            type: 'Program',
            body: body,
            sourceType: 'script'
        };
    }
}

// Export the Esprima class to be used in other modules
module.exports = Esprima;

// If this script is run directly, execute the following example
if (require.main === module) {
    const esprima = new Esprima();
    const program = 'const answer = 42';
    console.log(esprima.tokenize(program));  // Output tokens
    console.log(esprima.parseScript(program));  // Output AST
}
