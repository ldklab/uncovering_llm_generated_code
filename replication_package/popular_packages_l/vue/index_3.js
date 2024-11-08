// pretend-package/index.js

const path = require('path');

// Function to determine the current node environment
const getEnvironment = () => process.env.NODE_ENV || 'development';

// Function to select the correct Vue.js build for server-side rendering
const getVueBuildForSSR = () => {
  const env = getEnvironment();
  const vueBuild = env === 'production' 
    ? 'vue.cjs.prod.js' 
    : 'vue.cjs.js';
  
  return path.join(__dirname, 'node_modules/vue/dist/', vueBuild);
};

// Export the function that provides the correct Vue file path for SSR
module.exports = {
  getVueBuildForSSR,
};

// Example usage of the function
const vueFilePath = require('./index.js').getVueBuildForSSR();
console.log(`Using Vue.js build for SSR: ${vueFilePath}`);
