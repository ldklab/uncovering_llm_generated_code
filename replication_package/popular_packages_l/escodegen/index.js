// Install the package through npm: npm install escodegen

const escodegen = require('escodegen');

/**
 * Generates JavaScript code from an AST.
 *
 * @param {Object} ast - The Abstract Syntax Tree representing the code.
 * @returns {string} - The generated JavaScript code.
 */
function generateCode(ast) {
    return escodegen.generate(ast);
}

// Example usage
const ast = {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: 40 },
    right: { type: 'Literal', value: 2 }
};

console.log(generateCode(ast));  // Output: '40 + 2'

// Export the generateCode function for external use
module.exports = {
    generateCode
};
