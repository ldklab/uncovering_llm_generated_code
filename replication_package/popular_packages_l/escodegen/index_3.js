// Install the package using npm: npm install escodegen

const escodegen = require('escodegen');

/**
 * Generates JavaScript code from an Abstract Syntax Tree (AST).
 *
 * @param {Object} ast - An Abstract Syntax Tree to be converted to code.
 * @returns {string} - The generated JavaScript code string.
 */
function generateJavaScriptCode(ast) {
    return escodegen.generate(ast);
}

// Example to demonstrate functionality
const exampleAST = {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: 40 },
    right: { type: 'Literal', value: 2 }
};

// Generate and display JavaScript code from the AST
console.log(generateJavaScriptCode(exampleAST));  // Outputs: '40 + 2'

// Export the function for usage in other files
module.exports = {
    generateJavaScriptCode
};
