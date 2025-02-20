// vite/index.js

const express = require('express');
const { build } = require('esbuild');

// Function to create a simple development server similar to Vite
function createDevServer() {
  const app = express();

  // Middleware that sets the response type for JavaScript files to 'application/javascript'
  app.get('*.js', (req, res, next) => {
    res.type('application/javascript');
    next();
  });

  // Endpoint to simulate Hot Module Replacement (HMR)
  app.get('/hmr', (req, res) => {
    // Respond with a simple JSON message when the HMR endpoint is hit
    res.json({ message: 'HMR endpoint hit!' });
  });

  // Serve static files from the 'src' directory
  app.use(express.static('src'));

  // Start the development server on port 3000
  app.listen(3000, () => {
    console.log('Dev server running at http://localhost:3000');
  });
}

// Function to build application for production using esbuild
async function buildForProduction() {
  try {
    // Build configuration
    await build({
      entryPoints: ['src/main.js'],
      bundle: true,  // Bundle the output
      minify: true,  // Minify the output
      outfile: 'dist/bundle.js',  // Output file path
      format: 'esm',  // Output format as ES Modules
      plugins: [],  // No plugins used in this example
    });
    console.log('Build complete!');  // Log success message
  } catch (error) {
    console.error('Build failed:', error);  // Log any errors that occur during build
  }
}

// Export the development server and build functions
module.exports = {
  createDevServer,
  buildForProduction,
};

// Example plugin to demonstrate the plugin interface for esbuild
function examplePlugin() {
  return {
    name: 'example-plugin',  // Name of the plugin
    setup(build) {
      build.onStart(() => {
        // Log a message when the build starts
        console.log('Build started with example plugin');
      });
    },
  };
}
