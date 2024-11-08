// Install the package through npm: npm install escodegen

const escodegen = require('escodegen');

/**
 * Converts an AST to JavaScript code.
 *
 * @param {Object} ast - The AST to convert.
 * @returns {string} - The resulting JavaScript code.
 */
function generateCode(ast) {
    return escodegen.generate(ast);
}

// Sample AST for a binary expression '40 + 2'
const exampleAST = {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: 40 },
    right: { type: 'Literal', value: 2 }
};

// Generate and log the JavaScript code
console.log(generateCode(exampleAST));  // Logs: '40 + 2'

// Export the function for use in other modules
module.exports = {
    generateCode
};
