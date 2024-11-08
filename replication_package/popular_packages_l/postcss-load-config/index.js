const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const { cosmiconfigSync } = require('cosmiconfig');

// Load PostCSS configuration
function loadPostCSSConfig(ctx = {}) {
  const explorerSync = cosmiconfigSync('postcss');
  const searchResult = explorerSync.search();

  if (searchResult) {
    const { config } = searchResult;
    return typeof config === 'function' ? config(ctx) : config;
  }

  throw new Error('PostCSS configuration not found.');
}

// Example usage
function processCSS(cssFilePath, options = {}) {
  const css = readFileSync(cssFilePath, 'utf8');
  const ctx = { env: process.env.NODE_ENV || 'development', ...options };

  const { parser, map, plugins } = loadPostCSSConfig(ctx);

  return postcss(plugins)
    .process(css, { from: cssFilePath, map, parser })
    .then(result => console.log(result.css))
    .catch(err => console.error('Error processing CSS:', err));
}

// Example command line invocation
const cssPath = path.resolve(__dirname, 'styles.css');
processCSS(cssPath, { map: 'inline' });
