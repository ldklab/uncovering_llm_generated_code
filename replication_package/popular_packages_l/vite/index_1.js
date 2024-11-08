// vite/index.js

const express = require('express');
const { build } = require('esbuild');

// Function to create a simple development server mimicking Vite
function createDevServer() {
  const app = express();

  // Middleware to modify JS files' MIME type to ES module format
  app.get('*.js', (req, res, next) => {
    res.type('application/javascript');
    next();
  });

  // Endpoint placeholder for hot module replacement (HMR) functionality
  app.get('/hmr', (req, res) => {
    // Responds with a simple message, serves as a dummy endpoint
    res.json({ message: 'HMR endpoint hit!' });
  });

  // Serves static files from the "src" directory
  app.use(express.static('src'));

  // Starts the server, listening on port 3000
  app.listen(3000, () => {
    console.log('Dev server running at http://localhost:3000');
  });
}

// Function to build the project for production, simulating a Vite build process
async function buildForProduction() {
  try {
    // Uses esbuild to bundle and minify the code for production
    await build({
      entryPoints: ['src/main.js'],
      bundle: true,
      minify: true,
      outfile: 'dist/bundle.js',
      format: 'esm',
      plugins: [],
    });
    console.log('Build complete!');
  } catch (error) {
    // Logs an error message if the build fails
    console.error('Build failed:', error);
  }
}

// Exporting the development server creation and build functions
module.exports = {
  createDevServer,
  buildForProduction,
};

// Demonstration of a simple plugin interface for esbuild
function examplePlugin() {
  return {
    name: 'example-plugin',
    setup(build) {
      // Logs a message when a build starts
      build.onStart(() => {
        console.log('Build started with example plugin');
      });
    },
  };
}
