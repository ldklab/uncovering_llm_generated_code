// Ensure you have escodegen installed: npm install escodegen

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

// Example usage with a basic AST for the expression "40 + 2"
const ast = {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: 40 },
    right: { type: 'Literal', value: 2 }
};

// Log the generated code to the console
console.log(generateCode(ast));  // Outputs: '40 + 2'

// Export the generateCode function for use in other modules
module.exports = {
    generateCode
};
