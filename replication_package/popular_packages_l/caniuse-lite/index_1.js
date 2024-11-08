// caniuse-lite.js

// Simplified data structure mimicking caniuse database with CSS features
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
      'ie': 'none' // No support for this feature in IE
    }
  }
};

// Function to check if a specific browser version supports a given feature
function isSupported(feature, browser, version) {
  if (!features[feature]) { // Check if the feature exists
    throw new Error(`Feature '${feature}' is not available in the dataset.`);
  }
  
  const browserSupportVersion = features[feature].browsers[browser];
  if (!browserSupportVersion) { // No browser entry implies no support
    return false;
  }
  
  // Handle the case where 'none' indicates no support
  if (browserSupportVersion === 'none') {
    return false;
  }
  
  // Compare the provided version string against the support version
  return version >= browserSupportVersion;
}

// Example usage of the isSupported function
console.log(isSupported('flexbox', 'chrome', '29')); // Outputs: true
console.log(isSupported('grid', 'ie', '11'));        // Outputs: false

// Export the isSupported function and features dataset for use in other modules
module.exports = { isSupported, features };
```