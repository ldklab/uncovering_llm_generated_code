// my-highlight-package/index.js
const fs = require('fs');
const hljs = require('highlight.js');

/**
 * Highlights code with automatic language detection.
 * @param {string} code - The code snippet to highlight.
 * @returns {string} - The highlighted code as HTML.
 */
function highlightAuto(code) {
  return hljs.highlightAuto(code).value;
}

/**
 * Highlights code specifying the language.
 * @param {string} code - The code snippet to highlight.
 * @param {string} language - The language of the code snippet.
 * @returns {string} - The highlighted code.
 */
function highlight(code, language) {
  return hljs.highlight(code, { language }).value;
}

/**
 * Load a single language to reduce the library footprint.
 * @param {string} langName - The name of the language to register.
 * @param {function} langFunc - The language function from `highlight.js`.
 */
function registerLanguage(langName, langFunc) {
  hljs.registerLanguage(langName, langFunc);
}

/** 
 * Highlight code within a file and write to an HTML file.
 * @param {string} inputPath - File path to read code from.
 * @param {string} outputPath - File path to write the highlighted HTML.
 * @param {string} [language] - Specific language for highlighting (optional).
 */
function highlightFileToHtml(inputPath, outputPath, language) {
  const code = fs.readFileSync(inputPath, 'utf8');
  const html = language ? highlight(code, language) : highlightAuto(code);
  const htmlContent = `<html><body><pre><code class="hljs">${html}</code></pre></body></html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

// Export the functions
module.exports = {
  highlightAuto,
  highlight,
  registerLanguage,
  highlightFileToHtml
};

// Usage Example:
/*
const { highlightAuto, highlight, registerLanguage, highlightFileToHtml } = require('./index');

// Automatic language detection:
console.log(highlightAuto('const foo = 1;'));

// Highlight with JavaScript:
const jsCode = 'function hello() { return "Hello World"; }';
console.log(highlight(jsCode, 'javascript'));

// Register and use specific languages:
const xmlLang = require('highlight.js/lib/languages/xml');
registerLanguage('xml', xmlLang);

// Highlight XML code:
const xmlCode = '<tag>Hello</tag>';
console.log(highlight(xmlCode, 'xml'));

// Highlight file contents and save as HTML:
highlightFileToHtml('example.js', 'example.html', 'javascript');
*/
