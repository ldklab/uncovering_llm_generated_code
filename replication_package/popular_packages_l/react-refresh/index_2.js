// This function integrates Fast Refresh with a given bundler by hooking into its lifecycle events.
// It requires a bundler object with specific lifecycle hooks: beforeCompile and afterCompile.

exports.integrateWithBundler = function (bundler) {
  // Ensure a valid bundler instance is provided.
  if (!bundler) {
    throw new Error("A bundler instance must be provided.");
  }

  console.log("Integrating Fast Refresh with the bundler...");

  // Hook into the 'beforeCompile' lifecycle event of the bundler.
  // This is where setup for Fast Refresh is typically performed before the build starts.
  bundler.hooks.beforeCompile.tap('ReactRefreshPlugin', () => {
    console.log("Before bundle compilation - setting up Fast Refresh...");
    // Setup logic for Fast Refresh can be placed here.
  });

  // Hook into the 'afterCompile' lifecycle event of the bundler.
  // This stage indicates that Fast Refresh should now be active, often injecting specific code for it.
  bundler.hooks.afterCompile.tap('ReactRefreshPlugin', () => {
    console.log("After bundle compilation - Fast Refresh is active!");
    // Logic to finalize Fast Refresh setup can be added here.
  });

  console.log("Fast Refresh has been successfully integrated.");
};

// Example usage of the integrate function with a mock bundler object.
// This mock object emulates a bundler with hooks that plugins can use to execute code during build events.
const mockBundler = {
  hooks: {
    beforeCompile: {
      tap: (pluginName, callback) => {
        console.log(`Registering ${pluginName} for beforeCompile.`);
        callback();  // Execute the callback function registered for this event.
      }
    },
    afterCompile: {
      tap: (pluginName, callback) => {
        console.log(`Registering ${pluginName} for afterCompile.`);
        callback();  // Execute the callback function registered for this event.
      }
    }
  }
};

// Integrate Fast Refresh with the mock bundler to demonstrate usage.
exports.integrateWithBundler(mockBundler);
