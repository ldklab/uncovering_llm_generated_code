// Import the "esbuild" package
const esbuild = require('esbuild');

// Define an asynchronous function to bundle and minify JavaScript
async function bundleAndMinify(entryFilePath, outputFilePath) {
  try {
    // Use esbuild to build (bundle and minify) the code
    const result = await esbuild.build({
      entryPoints: [entryFilePath], // Specify the entry file
      bundle: true,                 // Enable bundling
      minify: true,                 // Enable minification
      outfile: outputFilePath,      // Output file path
    });

    console.log('Build succeeded:', result);
  } catch (error) {
    console.error('Build failed:', error);
  }
}

// Example usage
const entryFilePath = './src/index.js';  // Path to the entry JavaScript file
const outputFilePath = './dist/bundle.js'; // Path to the output bundled file

bundleAndMinify(entryFilePath, outputFilePath);

// Export the function for potential use elsewhere
module.exports = {
  bundleAndMinify,
};
