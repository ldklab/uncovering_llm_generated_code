const path = require('path');
const fs = require('fs');

function cssLoader(content, options = {}) {
  const { url = true, import: importOption = true, modules = false } = options;

  if (url) content = handleUrls(content);
  if (importOption) content = handleImports(content);
  if (modules) content = processModules(content, modules);

  return content;
}

function handleUrls(content) {
  return content.replace(/url\(([^)]+)\)/g, (match, p1) => {
    return (!isAbsolute(p1) && !isExternalResource(p1))
      ? `url(require('${p1}'))`
      : match;
  });
}

function handleImports(content) {
  return content.replace(/@import\s+['"]([^'"]+)['"]/g, (match, p1) => {
    return (!isAbsolute(p1) && !isExternalResource(p1))
      ? `require('${p1}')`
      : match;
  });
}

function processModules(content, modules) {
  return content.replace(/\.([a-zA-Z0-9_-]+)/g, (match, className) => {
    return `.${className}_${createHash()}`;
  });
}

function isAbsolute(url) {
  return url.match(/^~?\/|^[a-z]+:/i);
}

function isExternalResource(url) {
  return url.match(/^[a-z]+:\/\//i);
}

function createHash() {
  return Math.random().toString(36).substring(2, 5);
}

module.exports = cssLoader;

const cssContent = fs.readFileSync(path.resolve(__dirname, 'styles.css'), 'utf8');
const transformedCSS = cssLoader(cssContent, { url: true, modules: true });

console.log(transformedCSS);
