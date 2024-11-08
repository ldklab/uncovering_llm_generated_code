// caniuse-lite.js

// A simplified dataset representing feature support by different browsers
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
      'ie': 'none' // No support for IE
    }
  }
};

// Function to determine if a specific browser version supports the given feature
function isSupported(feature, browser, version) {
  const featureData = features[feature];
  
  if (!featureData) {
    throw new Error(`Feature '${feature}' is not available in the dataset.`);
  }
  
  const versionRequired = featureData.browsers[browser];
  if (!versionRequired || versionRequired === 'none') {
    return false; // Unsupported if browser/version data is missing or explicitly 'none'
  }
  
  return version >= versionRequired; // Compare versions as strings
}

// Sample usage for testing the isSupported function
console.log(isSupported('flexbox', 'chrome', '29')); // Should return true
console.log(isSupported('grid', 'ie', '11'));        // Should return false

// Exporting the isSupported function and the features dataset
module.exports = { isSupported, features };
```