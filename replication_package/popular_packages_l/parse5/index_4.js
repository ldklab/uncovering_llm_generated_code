// parse5-package.js
const parse5 = require('parse5');

/**
 * Parses an HTML string and returns a representation of the Document object.
 * 
 * @param {string} html - The HTML string to be parsed into a DOM structure.
 * @return {object} The parsed document presented as an object.
 */
function parseHtml(html) {
    // Use parse5 to transform the HTML string into a document object model
    return parse5.parse(html);
}

/**
 * Serializes a Document object back into an HTML string representation.
 * 
 * @param {object} document - The DOM-like representation of the previously parsed HTML.
 * @return {string} A string containing the HTML serialization of the document.
 */
function serializeDocument(document) {
    // Convert the document object back to an HTML string using parse5
    return parse5.serialize(document);
}

// Example usage demonstration:
const htmlString = `<!DOCTYPE html><html><head><title>An Example Page</title></head><body><h1>Hello World!</h1></body></html>`;
const document = parseHtml(htmlString);

console.log('Parsed document as object:', document); // Outputs the parsed document object to console

const serializedHtml = serializeDocument(document);
console.log('Serialized HTML string:', serializedHtml); // Outputs the serialized HTML string to console

module.exports = {
    parseHtml,
    serializeDocument
};
```
