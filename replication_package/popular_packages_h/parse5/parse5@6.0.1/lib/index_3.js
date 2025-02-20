'use strict';

const Parser = require('./parser');
const Serializer = require('./serializer');

// Function to parse the full HTML document
exports.parse = function(html, options) {
    const parser = new Parser(options); // Create a new parser with the given options
    return parser.parse(html); // Parse the full HTML document using the parser and return the result
};

// Function to parse an HTML fragment
exports.parseFragment = function(fragmentContext, html, options) {
    // Check if the fragmentContext is actually the HTML string
    if (typeof fragmentContext === 'string') {
        options = html; // Reassign options
        html = fragmentContext; // Reassign html
        fragmentContext = null; // Nullify fragmentContext
    }

    const parser = new Parser(options); // Create a new parser with the given options
    return parser.parseFragment(html, fragmentContext); // Parse the HTML fragment and return the result
};

// Function to serialize a DOM node
exports.serialize = function(node, options) {
    const serializer = new Serializer(node, options); // Create a serializer for the given node and options
    return serializer.serialize(); // Serialize the node to an HTML string and return it
};
