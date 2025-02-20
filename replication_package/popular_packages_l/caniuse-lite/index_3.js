// caniuse-lite.js

// Simplified feature support database simulating Can I Use data structure
const features = {
  'flexbox': {
    title: 'CSS Flexible Box Layout',
    browsers: {
      'chrome': '29',
      'firefox': '28',
      'safari': '9',
      'edge': '12',
      'ie': '11'
    }
  },
  'grid': {
    title: 'CSS Grid Layout',
    browsers: {
      'chrome': '57',
      'firefox': '52',
      'safari': '10.1',
      'edge': '16',
      'ie': 'none' // Indicates no support
    }
  }
};

/**
 * Checks if a specific feature is supported by a given browser version.
 * 
 * @param {string} feature - The name of the feature to check.
 * @param {string} browser - The browser to check support for.
 * @param {string} version - The version of the browser to check.
 * @returns {boolean} - True if the feature is supported, false otherwise.
 */
function isSupported(feature, browser, version) {
  if (!features[feature]) {
    throw new Error(`Feature '${feature}' not found.`);
  }
  
  const browserSupport = features[feature].browsers[browser];
  if (!browserSupport) {
    return false; // No entry implies no support
  }
  
  // 'none' specifies complete lack of support
  if (browserSupport === 'none') {
    return false;
  }
  
  // Check if provided version is greater than or equal to supported version
  return version >= browserSupport;
}

// Example usage:
console.log(isSupported('flexbox', 'chrome', '29')); // Expected: true
console.log(isSupported('grid', 'ie', '11'));        // Expected: false

module.exports = { isSupported, features };
```