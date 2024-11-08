// pretend-package/index.js

const path = require('path');

// Function to get the current node environment
function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

// Function to get the correct Vue build path for SSR
function getVueBuildForSSR() {
  const env = getEnvironment();
  const vueBuildPath = env === 'production' 
    ? 'vue.cjs.prod.js' 
    : 'vue.cjs.js';
  return path.join(__dirname, 'node_modules/vue/dist', vueBuildPath);
}

// Exporting the Vue build path function
module.exports = {
  getVueBuildForSSR,
};

// Example of using the exported function
const { getVueBuildForSSR } = require('./index.js');
console.log(`Using Vue.js build for SSR: ${getVueBuildForSSR()}`);
