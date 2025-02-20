// import necessary modules
const express = require('express');
const { build } = require('esbuild');

// Create a simple development server similar to Vite
function createDevServer() {
  const app = express();

  // Middleware to set the Content-Type for JavaScript files 
  app.get('*.js', (req, res, next) => {
    res.type('application/javascript'); // Respond with JavaScript mime type
    next(); // Pass control to the next middleware
  });

  // Endpoint for Hot Module Replacement (HMR) - currently a placeholder
  app.get('/hmr', (req, res) => {
    res.json({ message: 'HMR endpoint hit!' }); // Return a simple message
  });

  // Serve static files from the 'src' directory
  app.use(express.static('src'));

  // Start the development server on port 3000
  app.listen(3000, () => {
    console.log('Dev server running at http://localhost:3000');
  });
}

// Function to build the application for production using esbuild
async function buildForProduction() {
  try {
    // Call esbuild to compile, bundle, and minify the JavaScript
    await build({
      entryPoints: ['src/main.js'], // Entry point of the application
      bundle: true, // Bundle all dependencies into a single file
      minify: true, // Minify the output
      outfile: 'dist/bundle.js', // Output file destination
      format: 'esm', // Output format as ES Modules
      plugins: [], // No plugins used here
    });
    console.log('Build complete!'); // Log success message
  } catch (error) {
    console.error('Build failed:', error); // Log any errors encountered
  }
}

// Export the createDevServer and buildForProduction functions as module exports
module.exports = {
  createDevServer,
  buildForProduction,
};

// Example plugin interface for use with esbuild (for demonstration)
function examplePlugin() {
  return {
    name: 'example-plugin', // Name of the plugin
    setup(build) { // Setup function for the plugin
      build.onStart(() => { // Hook into the build start event
        console.log('Build started with example plugin'); 
      });
    },
  };
}
