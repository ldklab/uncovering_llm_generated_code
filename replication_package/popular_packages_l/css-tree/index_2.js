// The provided code consists of multiple JavaScript modules related to CSS manipulation and processing. The code is modularized into different files for different functionality including parsing, generating, walking, and lexing CSS. 

// File: index.js
// This file is the main entry point, exporting functions from other modules.

const parseCSS = require('./parser'); // Parses CSS strings into AST
const generateCSS = require('./generator'); // Generates CSS strings from AST
const walkAST = require('./walker'); // Traverses or finds nodes in AST
const lexer = require('./lexer'); // Contains lexing functionalities such as property matching

module.exports = {
    parse: parseCSS,
    generate: generateCSS,
    walk: walkAST.walk,
    find: walkAST.find,
    findLast: walkAST.findLast,
    findAll: walkAST.findAll,
    lexer
};

// File: parser.js
// Parses CSS source code into an Abstract Syntax Tree (AST).

function parseCSS(source, options) {
    // Logic to transform CSS source into an AST
    return {}; // Returns AST
}

module.exports = parseCSS;

// File: generator.js
// Converts an Abstract Syntax Tree (AST) back into a CSS string.

function generateCSS(ast, options) {
    // Logic to convert AST to CSS string
    return ''; // Returns the CSS string
}

module.exports = generateCSS;

// File: walker.js
// Provides functionality to traverse and find nodes in an AST.

function walk(ast, callback) {
    // Logic to traverse the AST and execute a callback on each node
}

function find(ast, fn) {
    // Logic to find a single node that matches a condition
}

function findLast(ast, fn) {
    // Logic to find the last node that matches a condition
}

function findAll(ast, fn) {
    // Logic to find all nodes that match a condition
}

module.exports = { walk, find, findLast, findAll };

// File: lexer.js
// Provides utilities for lexing CSS, such as checking property syntax.

function matchProperty(propertyName, ast) {
    // Logic to match property syntax against AST
    return {
        isType: function(node, type) {
            // Logic to check if a given node is a specific type
        },
        getTrace: function(node) {
            // Logic to get a trace or path of the node's type
        }
    };
}

module.exports = {
    matchProperty
};

// Usage Example
// Example of how to use this modular CSS processing tool.

const csstree = require('./index');

// Parsing CSS and modifying AST
const ast = csstree.parse('.example { world: "!" }');
csstree.walk(ast, node => {
    if (node.type === 'ClassSelector' && node.name === 'example') {
        node.name = 'hello'; // Modify class name in AST
    }
});
console.log(csstree.generate(ast)); // Generates the modified CSS from AST

// Parsing CSS values and doing lexical analysis
const valueAst = csstree.parse('red 1px solid', { context: 'value' });
const matchResult = csstree.lexer.matchProperty('border', valueAst);
console.log(matchResult.isType(valueAst.children.first, 'color')); // Checks if first value is a 'color'
console.log(matchResult.getTrace(valueAst.children.first)); // Gets type trace of first value
