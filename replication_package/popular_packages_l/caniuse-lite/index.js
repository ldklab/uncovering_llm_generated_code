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

// Function to check support of a feature in a browser version
function isSupported(feature, browser, version) {
  if (!features[feature]) {
    throw new Error(`Feature '${feature}' is not available in the dataset.`);
  }
  
  const browserSupport = features[feature].browsers[browser];
  if (!browserSupport) {
    return false; // Browser not in list means no support
  }
  
  // 'none' indicates that the feature isn't supported at all
  if (browserSupport === 'none') {
    return false;
  }
  
  // Compare version number strings
  return version >= browserSupport;
}

// Example usage:
console.log(isSupported('flexbox', 'chrome', '29')); // true
console.log(isSupported('grid', 'ie', '11'));        // false

module.exports = { isSupported, features };
```

This implementation includes a minimal feature data set and a function `isSupported` to check the support status of CSS features in different browser versions. It would be used by importing this module and calling the `isSupported` function with the appropriate parameters.