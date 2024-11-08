// vite/index.js

const express = require('express');
const { build } = require('esbuild');

// Function to create a development server similar to Vite
function createDevServer() {
  const app = express();

  // Middleware to ensure JavaScript files are served as ES modules
  app.get('*.js', (req, res, next) => {
    res.type('application/javascript');
    next();
  });

  // Simulated endpoint for hot module replacement feature
  app.get('/hmr', (req, res) => {
    res.json({ message: 'HMR endpoint hit!' });
  });

  // Static files are served from the 'src' directory
  app.use(express.static('src'));

  // Server listens on port 3000
  app.listen(3000, () => {
    console.log('Dev server running at http://localhost:3000');
  });
}

// Function to handle production build similar to Vite
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

// Exporting functionalities for use in other modules
module.exports = {
  createDevServer,
  buildForProduction,
};

// Example plugin to demonstrate a plugin interface
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
