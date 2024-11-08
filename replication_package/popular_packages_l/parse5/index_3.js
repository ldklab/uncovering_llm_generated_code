// html-parser.js
const parse5 = require('parse5');

/**
 * Converts an HTML string into a Document object representation.
 *
 * @param {string} html - HTML content to be converted.
 * @return {object} Document object structure derived from HTML.
 */
function parseHtml(html) {
    return parse5.parse(html);
}

/**
 * Converts a Document object structure back into an HTML string.
 *
 * @param {object} document - Document object to be serialized to HTML.
 * @return {string} HTML content as a string.
 */
function serializeDocument(document) {
    return parse5.serialize(document);
}

// Example demonstration:
const exampleHtml = `<!DOCTYPE html><html><head><title>Sample Page</title></head><body><h1>Hello World!</h1></body></html>`;
const parsedDocument = parseHtml(exampleHtml);

console.log('Parsed Document:', parsedDocument);

const recreatedHtml = serializeDocument(parsedDocument);
console.log('Serialized HTML:', recreatedHtml);

module.exports = {
    parseHtml,
    serializeDocument
};
```