const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const { cosmiconfigSync } = require('cosmiconfig');

// Function to load PostCSS configuration
function loadPostCSSConfig(ctx = {}) {
  // Synchronously search for PostCSS config
  const explorerSync = cosmiconfigSync('postcss');
  const searchResult = explorerSync.search();

  // If a configuration is found, return it
  if (searchResult) {
    const { config } = searchResult;
    return typeof config === 'function' ? config(ctx) : config;
  }

  // If no configuration is found, throw an error
  throw new Error('PostCSS configuration not found.');
}

// Function to process a CSS file using PostCSS
function processCSS(cssFilePath, options = {}) {
  // Read the contents of the CSS file
  const css = readFileSync(cssFilePath, 'utf8');
  
  // Construct context with environment and additional options
  const ctx = { env: process.env.NODE_ENV || 'development', ...options };

  // Load the PostCSS configuration
  const { parser, map, plugins } = loadPostCSSConfig(ctx);

  // Process the CSS with the loaded PostCSS plugins and options
  return postcss(plugins)
    .process(css, { from: cssFilePath, map, parser })
    .then(result => console.log(result.css)) // Log the processed CSS
    .catch(err => console.error('Error processing CSS:', err)); // Handle errors
}

// Determine the path of the CSS file to process
const cssPath = path.resolve(__dirname, 'styles.css');

// Process the CSS file with specific options
processCSS(cssPath, { map: 'inline' });
