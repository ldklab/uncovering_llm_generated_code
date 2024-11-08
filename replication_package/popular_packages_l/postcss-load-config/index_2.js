const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const { cosmiconfigSync } = require('cosmiconfig');

// Load PostCSS configuration
function getPostCSSConfig(context = {}) {
  const configExplorer = cosmiconfigSync('postcss');
  const result = configExplorer.search();

  if (result) {
    const { config } = result;
    return typeof config === 'function' ? config(context) : config;
  } else {
    throw new Error('Unable to locate PostCSS configuration.');
  }
}

// Process the CSS file
function handleCSSProcessing(filePath, customOptions = {}) {
  const cssContent = fs.readFileSync(filePath, 'utf8');
  const context = { env: process.env.NODE_ENV || 'development', ...customOptions };

  const { parser, map, plugins } = getPostCSSConfig(context);

  postcss(plugins)
    .process(cssContent, { from: filePath, map, parser })
    .then(result => {
      console.log(result.css);
    })
    .catch(error => {
      console.error('CSS processing failed:', error);
    });
}

// Demonstration of command line usage
const resolvedCssPath = path.resolve(__dirname, 'styles.css');
handleCSSProcessing(resolvedCssPath, { map: 'inline' });
