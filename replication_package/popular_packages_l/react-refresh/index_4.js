// Function to perform integration with a given bundler
function integrateWithBundler(bundler) {
  if (!bundler) {
    throw new Error("A bundler instance must be provided.");
  }

  console.log("Integrating Fast Refresh with the bundler...");

  // Hook into the bundler's lifecycle
  bundler.hooks.beforeCompile.tap('ReactRefreshPlugin', () => {
    console.log("Before bundle compilation - setting up Fast Refresh...");
  });

  bundler.hooks.afterCompile.tap('ReactRefreshPlugin', () => {
    console.log("After bundle compilation - Fast Refresh is active!");
  });

  console.log("Fast Refresh has been successfully integrated.");
}

// Mock bundler object to demonstrate integration
const mockBundler = {
  hooks: {
    beforeCompile: {
      tap: (pluginName, callback) => {
        console.log(`Registering ${pluginName} for beforeCompile.`);
        callback();
      }
    },
    afterCompile: {
      tap: (pluginName, callback) => {
        console.log(`Registering ${pluginName} for afterCompile.`);
        callback();
      }
    }
  }
};

// Integrate with the mock bundler
integrateWithBundler(mockBundler);
