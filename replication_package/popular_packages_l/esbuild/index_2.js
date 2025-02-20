// Import the "esbuild" package
const esbuild = require('esbuild');

/**
 * Asynchronously bundles and minifies a JavaScript file.
 * @param {string} entryFilePath - The path to the input JavaScript file.
 * @param {string} outputFilePath - The path to the output bundled and minified file.
 */
async function bundleAndMinify(entryFilePath, outputFilePath) {
  try {
    const result = await esbuild.build({
      entryPoints: [entryFilePath],  // Entry JavaScript file to process
      bundle: true,                  // Enable code bundling
      minify: true,                  // Enable code minification
      outfile: outputFilePath,       // Destination for the bundled file
    });
    console.log('Build succeeded:', result); // Log success message
  } catch (error) {
    console.error('Build failed:', error); // Log error message if build fails
  }
}

// Example usage paths
const entryFilePath = './src/index.js';   // Entry file path for the build process
const outputFilePath = './dist/bundle.js'; // Output file path for the processed file

// Execute the bundling and minification process
bundleAndMinify(entryFilePath, outputFilePath);

// Export the function for reuse in other modules
module.exports = {
  bundleAndMinify,
};
