// index.js
const path = require('path');
const fs = require('fs');

function cssLoader(content, options = {}) {
  const { url = true, import: importOption = true, modules = false } = options;

  if (url) {
    content = processUrls(content);
  }

  if (importOption) {
    content = processImports(content);
  }

  if (modules) {
    content = transformModules(content);
  }

  return content;
}

function processUrls(content) {
  return content.replace(/url\(([^)]+)\)/g, (match, url) => {
    if (!isAbsoluteUrl(url) && !isExternal(url)) {
      return `url(require('${url}'))`;
    }
    return match;
  });
}

function processImports(content) {
  return content.replace(/@import\s+['"]([^'"]+)['"]/g, (match, importUrl) => {
    if (!isAbsoluteUrl(importUrl) && !isExternal(importUrl)) {
      return `require('${importUrl}')`;
    }
    return match;
  });
}

function transformModules(content) {
  return content.replace(/\.([a-zA-Z0-9_-]+)/g, (match, className) => `.${className}_${generateHash()}`);
}

function isAbsoluteUrl(url) {
  return /^~?\/|^[a-z]+:/i.test(url);
}

function isExternal(url) {
  return /^[a-z]+:\/\//i.test(url);
}

function generateHash() {
  return Math.random().toString(36).slice(2, 7);
}

module.exports = cssLoader;

const cssContent = fs.readFileSync(path.resolve(__dirname, 'styles.css'), 'utf8');
const processedCSS = cssLoader(cssContent, { url: true, modules: true });

console.log(processedCSS);
