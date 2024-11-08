// Import the "esbuild" package
const esbuild = require('esbuild');

// Define an asynchronous function to bundle and minify JavaScript files
async function bundleAndMinify(entryFilePath, outputFilePath) {
  try {
    // Build the JavaScript code using esbuild, which includes bundling and minification
    const result = await esbuild.build({
      entryPoints: [entryFilePath], // Define the main file to start bundling from
      bundle: true,                 // Enable bundling of all dependencies into one file
      minify: true,                 // Enable minification for reducing file size
      outfile: outputFilePath,      // Destination for the output file
    });

    console.log('Build succeeded:', result); // Log success message if build succeeds
  } catch (error) {
    console.error('Build failed:', error); // Log error message if build fails
  }
}

// Example usage of the bundleAndMinify function
const entryFilePath = './src/index.js';  // Path to the main source JavaScript file
const outputFilePath = './dist/bundle.js'; // Output path for the bundled and minified file

bundleAndMinify(entryFilePath, outputFilePath);

// Export the function to make it available for import in other files
module.exports = {
  bundleAndMinify,
};
