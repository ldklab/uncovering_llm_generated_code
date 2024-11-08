// Import the esbuild package for bundling and minification
const esbuild = require('esbuild');

// Define a function to perform JavaScript bundling and minification
async function bundleAndMinify(entryFilePath, outputFilePath) {
  try {
    // Configure and execute the build process
    const result = await esbuild.build({
      entryPoints: [entryFilePath], // Specify the entry file
      bundle: true,                 // Enable code bundling
      minify: true,                 // Enable code minification
      outfile: outputFilePath,      // Set output file path
    });
    
    // Log message indicating a successful build
    console.log('Build succeeded:', result);
  } catch (error) {
    // Log error message if build fails
    console.error('Build failed:', error);
  }
}

// Specify the source file and the destination for the bundle
const entryFilePath = './src/index.js';  // Entry JavaScript file
const outputFilePath = './dist/bundle.js'; // Destination for bundled output

// Run the bundling and minification process
bundleAndMinify(entryFilePath, outputFilePath);

// Export the function for use in other parts of an application
module.exports = {
  bundleAndMinify,
};
