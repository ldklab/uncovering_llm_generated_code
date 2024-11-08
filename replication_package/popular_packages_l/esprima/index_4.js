// File: index.js
const TokenTypes = {
    Keyword: 'Keyword',
    Identifier: 'Identifier',
    Punctuator: 'Punctuator',
    Numeric: 'Numeric'
};

class SimpleParser {
    // Tokenizes a given program string into an array of tokens
    tokenize(program) {
        const tokens = [];
        const regex = /\s*(=>|const|var|{|}|\=|\d+|[A-Za-z_]\w*)\s*/g;

        program.replace(regex, (match, token) => {
            let type;
            if (/const|var/.test(token)) type = TokenTypes.Keyword;
            else if (/=/.test(token)) type = TokenTypes.Punctuator;
            else if (/\d+/.test(token)) type = TokenTypes.Numeric;
            else type = TokenTypes.Identifier;

            tokens.push({ type, value: token });
        });

        return tokens;
    }

    // Parses a list of tokens into an abstract syntax tree (AST)
    parseScript(program) {
        const tokens = this.tokenize(program);
        const body = [];
        let currentIndex = 0;

        const parseVariableDeclaration = () => {
            const { type, value } = tokens[currentIndex++];
            if (type === TokenTypes.Keyword && value === 'const') {
                const identifier = tokens[currentIndex++];
                const assignment = tokens[currentIndex++];
                const literal = tokens[currentIndex++];

                if (
                    identifier.type === TokenTypes.Identifier &&
                    assignment.value === '=' &&
                    literal.type === TokenTypes.Numeric
                ) {
                    return {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: { type: 'Identifier', name: identifier.value },
                                init: { type: 'Literal', value: Number(literal.value) }
                            }
                        ],
                        kind: 'const'
                    };
                }
            }
            throw new Error('Unexpected token');
        };

        while (currentIndex < tokens.length) {
            body.push(parseVariableDeclaration());
        }

        return {
            type: 'Program',
            body,
            sourceType: 'script'
        };
    }
}

// Exporting the class for external use
module.exports = SimpleParser;

// Usage example, executed if the script is run directly
if (require.main === module) {
    const parser = new SimpleParser();
    const sampleProgram = 'const answer = 42';
    console.log(parser.tokenize(sampleProgram));
    console.log(parser.parseScript(sampleProgram));
}
