const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cosmiconfig = require('cosmiconfig');

// Function to load PostCSS configuration
function loadPostCSSConfig(context = {}) {
  const explorer = cosmiconfig.cosmiconfigSync('postcss');
  const result = explorer.search();

  if (result && result.config) {
    const config = result.config;
    return typeof config === 'function' ? config(context) : config;
  }

  throw new Error('No PostCSS configuration found.');
}

// Function to process a CSS file using PostCSS
function processCSS(cssFilePath, userOptions = {}) {
  const cssContent = fs.readFileSync(cssFilePath, 'utf8');
  const context = { env: process.env.NODE_ENV || 'development', ...userOptions };

  const { parser, map, plugins } = loadPostCSSConfig(context);

  postcss(plugins)
    .process(cssContent, { from: cssFilePath, map, parser })
    .then(result => {
      console.log(result.css);
    })
    .catch(error => {
      console.error('Error processing CSS:', error);
    });
}

// Execute the CSS processing with an example file
const cssFile = path.resolve(__dirname, 'styles.css');
processCSS(cssFile, { map: 'inline' });
