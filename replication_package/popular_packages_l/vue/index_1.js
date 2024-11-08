// pretend-package/index.js

const path = require('path');

// Function to determine the running environment
const getEnvironment = () => process.env.NODE_ENV || 'development';

// Determine the path to the appropriate Vue.js build for SSR
const getVueBuildForSSR = () => {
  const environment = getEnvironment();
  const basePath = path.join(__dirname, 'node_modules/vue/dist/');
  return environment === 'production' 
    ? basePath + 'vue.cjs.prod.js' 
    : basePath + 'vue.cjs.js';
};

// Export the function for external usage
module.exports = { getVueBuildForSSR };

// Example usage to print the selected Vue.js build for SSR
const { getVueBuildForSSR } = require('./index');
console.log(`Using Vue.js build for SSR: ${getVueBuildForSSR()}`);
