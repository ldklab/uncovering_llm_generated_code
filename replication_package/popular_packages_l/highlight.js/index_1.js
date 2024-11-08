// my-highlight-package/index.js
const fs = require('fs');
const hljs = require('highlight.js');

function highlightAuto(code) {
  return hljs.highlightAuto(code).value;
}

function highlight(code, language) {
  return hljs.highlight(code, { language }).value;
}

function registerLanguage(langName, langFunc) {
  hljs.registerLanguage(langName, langFunc);
}

function highlightFileToHtml(inputPath, outputPath, language) {
  const code = fs.readFileSync(inputPath, 'utf8');
  const html = language ? highlight(code, language) : highlightAuto(code);
  const htmlContent = `<html><body><pre><code class="hljs">${html}</code></pre></body></html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

module.exports = {
  highlightAuto,
  highlight,
  registerLanguage,
  highlightFileToHtml
};
