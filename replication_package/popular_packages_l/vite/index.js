// vite/index.js

const express = require('express');
const { build } = require('esbuild');

// Simple Vite-like dev server
function createDevServer() {
  const app = express();

  // Middleware to serve JavaScript as ES modules
  app.get('*.js', (req, res, next) => {
    res.type('application/javascript');
    next();
  });

  // Placeholder for hot module replacement functionality
  app.get('/hmr', (req, res) => {
    // Dummy endpoint for HMR
    res.json({ message: 'HMR endpoint hit!' });
  });

  // Static file server
  app.use(express.static('src'));

  // Start server
  app.listen(3000, () => {
    console.log('Dev server running at http://localhost:3000');
  });
}

// Simple Vite-like build command
async function buildForProduction() {
  try {
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
    console.error('Build failed:', error);
  }
}

// Export API
module.exports = {
  createDevServer,
  buildForProduction,
};

// Simple plugin interface (for demonstration)
function examplePlugin() {
  return {
    name: 'example-plugin',
    setup(build) {
      build.onStart(() => {
        console.log('Build started with example plugin');
      });
    },
  };
}
