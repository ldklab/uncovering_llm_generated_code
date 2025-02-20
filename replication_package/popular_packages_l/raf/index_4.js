// raf.js
(function(global) {
  // Initialize a variable for potential vendor prefix
  var rafPrefix;
  // Array of vendor prefixes for compatibility
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  // Keep track of the last time a callback was executed with fallback
  var lastTime = 0;

  // Attempt to use the vendor-prefixed versions of requestAnimationFrame
  for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    rafPrefix = vendors[x];
    // Assign the vendor-prefixed requestAnimationFrame if it exists
    global.requestAnimationFrame = global[rafPrefix + 'RequestAnimationFrame'];
    // Assign the vendor-prefixed cancelAnimationFrame if it exists
    global.cancelAnimationFrame = global[rafPrefix + 'CancelAnimationFrame'] ||
                                  global[rafPrefix + 'CancelRequestAnimationFrame'];
  }

  // Fallback to setTimeout if requestAnimationFrame is not supported
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function(callback) {
      // Get the current time
      var currTime = new Date().getTime();
      // Calculate the time to call to aim for a 60fps rate (16ms per frame)
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      // Use setTimeout as a polyfill
      var id = global.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      // Update lastTime
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  // Fallback for cancelAnimationFrame using clearTimeout
  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  // Function to wrap requestAnimationFrame
  function raf(callback) {
    return global.requestAnimationFrame(callback);
  }

  // Provide a method to cancel an animation frame
  raf.cancel = function(handle) {
    global.cancelAnimationFrame(handle);
  };

  // Polyfill method to extend target object with raf functions
  raf.polyfill = function(object) {
    if (!object) {
      object = typeof window !== 'undefined' ? window : global;
    }
    // Add the raf functions to the target object
    object.requestAnimationFrame = global.requestAnimationFrame;
    object.cancelAnimationFrame = global.cancelAnimationFrame;
  };

  // Export the module for Node.js or attach to the global object
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = raf;
  } else {
    global.raf = raf;
  }
})(typeof window !== 'undefined' ? window : global);
