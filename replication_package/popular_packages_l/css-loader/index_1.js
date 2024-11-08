// index.js
const path = require('path');
const fs = require('fs');

function cssLoader(content, options = {}) {
  // Destructures the options with defaults for handling urls, imports, and modules
  const { url = true, import: importOption = true, modules = false } = options;

  // Processes URLs if enabled
  if (url) {
    content = processUrls(content);
  }

  // Processes @import statements if enabled
  if (importOption) {
    content = processImports(content);
  }

  // Transforms content to simulate module support if enabled
  if (modules) {
    content = transformModules(content, modules);
  }

  return content;
}

function processUrls(content) {
  // Replaces relative or non-external URLs in css with require syntax
  return content.replace(/url\(([^)]+)\)/g, (match, p1) => {
    if (!isAbsoluteUrl(p1) && !isExternal(p1)) {
      return `url(require('${p1}'))`;
    }
    return match;
  });
}

function processImports(content) {
  // Replaces @import statements with require syntax for non-external paths
  return content.replace(/@import\s+['"]([^'"]+)['"]/g, (match, p1) => {
    if (!isAbsoluteUrl(p1) && !isExternal(p1)) {
      return `require('${p1}')`;
    }
    return match;
  });
}

function transformModules(content, modules) {
  // Appends a hash to class names to simulate CSS module transformations
  return content.replace(/\.([a-zA-Z0-9_-]+)/g, (match, p1) => `.${p1}_${generateHash()}`);
}

function isAbsoluteUrl(url) {
  // Checks if a URL is absolute or protocol-based
  return url.match(/^~?\/|^[a-z]+:/i);
}

function isExternal(url) {
  // Checks if a URL is external by checking for protocol
  return url.match(/^[a-z]+:\/\//i);
}

function generateHash() {
  // Generates a pseudo-random hash for demonstration
  return Math.random().toString(36).substr(2, 5);
}

// Exports the cssLoader function for use as a module
module.exports = cssLoader;

// Example usage of the cssLoader
const cssContent = fs.readFileSync(path.resolve(__dirname, 'styles.css'), 'utf8');
const processedCSS = cssLoader(cssContent, { url: true, modules: true });

console.log(processedCSS);

// Note: This is a simplified demonstration and not fully representative of advanced css-loader features.
