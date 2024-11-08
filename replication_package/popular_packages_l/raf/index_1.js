// raf.js
(function(global) {
  var rafPrefix;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  var lastTime = 0;

  // Try to find a native requestAnimationFrame
  vendors.some(function(vendor) {
    if (!global.requestAnimationFrame) {
      rafPrefix = vendor;
      global.requestAnimationFrame = global[rafPrefix + 'RequestAnimationFrame'];
      global.cancelAnimationFrame = global[rafPrefix + 'CancelAnimationFrame'] ||
                                    global[rafPrefix + 'CancelRequestAnimationFrame'];
    }
    return global.requestAnimationFrame;
  });

  // Fallback to setTimeout if requestAnimationFrame isn't supported
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = global.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  // Main raf function to use requestAnimationFrame
  function raf(callback) {
    return global.requestAnimationFrame(callback);
  }

  // Attach a method to cancel the raf callback
  raf.cancel = function(handle) {
    global.cancelAnimationFrame(handle);
  };

  // Polyfill method to attach to different objects
  raf.polyfill = function(object) {
    if (!object) {
      object = typeof window !== 'undefined' ? window : global;
    }
    object.requestAnimationFrame = global.requestAnimationFrame;
    object.cancelAnimationFrame = global.cancelAnimationFrame;
  };

  // Export the raf function for Node.js or attach to global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = raf;
  } else {
    global.raf = raf;
  }
})(typeof window !== 'undefined' ? window : global);
