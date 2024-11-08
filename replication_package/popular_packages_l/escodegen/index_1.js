// Install the package through npm: npm install escodegen

const escodegen = require('escodegen');

/**
 * Converts an AST to JavaScript code.
 *
 * @param {Object} ast - An Abstract Syntax Tree of the code.
 * @returns {string} - JavaScript code generated from the AST.
 */
function generateCode(ast) {
    return escodegen.generate(ast);
}

// Demonstration
const exampleAST = {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: 40 },
    right: { type: 'Literal', value: 2 }
};

console.log(generateCode(exampleAST));  // Outputs: '40 + 2'

// Exporting the function for external modules
module.exports = {
    generateCode
};
