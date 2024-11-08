// Import the "esbuild" package
const esbuild = require('esbuild');

// Define an asynchronous function to bundle and minify JavaScript
async function bundleAndMinify(entryFilePath, outputFilePath) {
  try {
    // Use esbuild to bundle and minify the code
    const result = await esbuild.build({
      entryPoints: [entryFilePath], // Specify the entry point file
      bundle: true,                 // Enable bundling
      minify: true,                 // Enable minification
      outfile: outputFilePath,      // Specify the output file path
    });

    console.log('Build succeeded:', result);
  } catch (error) {
    console.error('Build failed:', error);
  }
}

// Example usage of the bundleAndMinify function
const entryPath = './src/index.js';       // Entry point file path
const outputPath = './dist/bundle.js';    // Output file path

bundleAndMinify(entryPath, outputPath);

// Export the function for potential use in other modules
module.exports = {
  bundleAndMinify,
};
