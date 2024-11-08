// htmlParser.js
const parse5 = require('parse5');

/**
 * Converts an HTML string into a Document object.
 * 
 * @param {string} html - The HTML content to parse.
 * @returns {object} The resulting Document object.
 */
function parseHtml(html) {
    return parse5.parse(html);
}

/**
 * Converts a Document object back to an HTML string.
 * 
 * @param {object} doc - The Document object to serialize.
 * @returns {string} The HTML string representation of the document.
 */
function serializeDocument(doc) {
    return parse5.serialize(doc);
}

// Demonstration of functionality
const exampleHtml = `<!DOCTYPE html><html><head><title>Sample Page</title></head><body><h1>Hello World!</h1></body></html>`;

// Parse the HTML string into a Document object
const parsedDoc = parseHtml(exampleHtml);
console.log('Parsed Document:', parsedDoc);

// Serialize the Document object back into an HTML string
const htmlOutput = serializeDocument(parsedDoc);
console.log('Serialized HTML:', htmlOutput);

module.exports = {
    parseHtml,
    serializeDocument
};
```