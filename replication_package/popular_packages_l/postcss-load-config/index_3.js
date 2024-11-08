const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const { cosmiconfigSync } = require('cosmiconfig');

/**
 * Function to load PostCSS configuration.
 * It searches for the configuration file using 'cosmiconfig', specifically looking for settings under 'postcss'.
 * If it finds a configuration, it returns it, otherwise throws an error indicating the configuration is not found.
 * The configuration can be a function which is executed with the provided context and its result is returned.
 * 
 * @param {Object} ctx - The context object to be used when the configuration is a function. Defaults to an empty object.
 * @returns {Object|Function} - The configuration object or the result of the configuration function.
 */
function loadPostCSSConfig(ctx = {}) {
  const explorerSync = cosmiconfigSync('postcss');
  const searchResult = explorerSync.search();

  if (searchResult) {
    const { config } = searchResult;
    return typeof config === 'function' ? config(ctx) : config;
  }

  throw new Error('PostCSS configuration not found.');
}

/**
 * Function to process a CSS file using the PostCSS configuration.
 * It reads the CSS content from a given file path, loads PostCSS plugins configuration, 
 * and processes the CSS content with these plugins.
 * It logs the processed CSS or an error message to the console.
 * 
 * @param {string} cssFilePath - The path to the CSS file to be processed.
 * @param {Object} options - Additional options like source map configurations. Defaults to an empty object.
 */
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
