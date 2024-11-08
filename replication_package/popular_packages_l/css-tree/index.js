markdown
// File: index.js

const parseCSS = require('./parser');
const generateCSS = require('./generator');
const walkAST = require('./walker');
const lexer = require('./lexer');

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

function parseCSS(source, options) {
    // Parse CSS source into AST
    return {}; // returns AST
}

module.exports = parseCSS;

// File: generator.js

function generateCSS(ast, options) {
    // Convert AST back to CSS string
    return ''; // returns CSS string
}

module.exports = generateCSS;

// File: walker.js

function walk(ast, callback) {
    // Traverse AST and apply callback
}

function find(ast, fn) {
    // Find specific node
}

function findLast(ast, fn) {
    // Find last matching node
}

function findAll(ast, fn) {
    // Find all matching nodes
}

module.exports = { walk, find, findLast, findAll };

// File: lexer.js

function matchProperty(propertyName, ast) {
    // Matches CSS property syntax
    return {
        isType: function(node, type) {
            // Check if node is of specified type
        },
        getTrace: function(node) {
            // Get trace of type matches for node
        }
    };
}

module.exports = {
    matchProperty
};

// Usage Example

const csstree = require('./index');

const ast = csstree.parse('.example { world: "!" }');
csstree.walk(ast, node => {
    if (node.type === 'ClassSelector' && node.name === 'example') {
        node.name = 'hello';
    }
});
console.log(csstree.generate(ast));

const valueAst = csstree.parse('red 1px solid', { context: 'value' });
const matchResult = csstree.lexer.matchProperty('border', valueAst);
console.log(matchResult.isType(valueAst.children.first, 'color'));
console.log(matchResult.getTrace(valueAst.children.first));
