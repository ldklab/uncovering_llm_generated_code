// caniuse-lite.js

// Sample data mimicking the structure of caniuse db but greatly simplified
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
      'ie': 'none' // Indicating no support
    }
  }
};

// Function to determine if a feature is supported by a given browser version
function isSupported(feature, browser, version) {
  const featureInfo = features[feature];
  if (!featureInfo) {
    throw new Error(`Feature '${feature}' is not available in the dataset.`);
  }
  
  const browserVersionSupport = featureInfo.browsers[browser];
  if (!browserVersionSupport || browserVersionSupport === 'none') {
    return false; // No support if browser is not listed or explicitly 'none'
  }

  // Return true if the provided version is greater than or equal to the required version
  return version >= browserVersionSupport;
}

// Export function and dataset for usage in other modules
module.exports = { isSupported, features };

// Example log statements for testing the function in a Node environment
console.log(isSupported('flexbox', 'chrome', '29')); // true
console.log(isSupported('grid', 'ie', '11'));        // false
```