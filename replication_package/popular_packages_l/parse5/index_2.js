// parse5-package.js
const parse5 = require('parse5');

/**
 * Parses an HTML string and returns the Document object.
 * 
 * @param {string} html - The HTML to be parsed.
 * @return {object} The document as an object.
 */
function parseHtml(html) {
    return parse5.parse(html);
}

/**
 * Serializes a Document object back to an HTML string.
 * 
 * @param {object} document - The parsed document object.
 * @return {string} The HTML string.
 */
function serializeDocument(document) {
    return parse5.serialize(document);
}

// Example usage:
const htmlString = `<!DOCTYPE html><html><head><title>Sample Page</title></head><body><h1>Hello World!</h1></body></html>`;
const document = parseHtml(htmlString);

console.log('Parsed document:', document);

const serializedHtml = serializeDocument(document);
console.log('Serialized HTML:', serializedHtml);

module.exports = {
    parseHtml,
    serializeDocument
};
```