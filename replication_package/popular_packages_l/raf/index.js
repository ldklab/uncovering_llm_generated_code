// raf.js
(function(global) {
  var rafPrefix;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  var lastTime = 0;

  // Try to find native raf
  for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    rafPrefix = vendors[x];
    global.requestAnimationFrame = global[rafPrefix + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[rafPrefix + 'CancelAnimationFrame'] ||
                                  global[rafPrefix + 'CancelRequestAnimationFrame'];
  }

  // Fallback to setTimeout when raf not supported
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

  function raf(callback) {
    return global.requestAnimationFrame(callback);
  }

  raf.cancel = function(handle) {
    global.cancelAnimationFrame(handle);
  };

  raf.polyfill = function(object) {
    if (!object) {
      object = typeof window !== 'undefined' ? window : global;
    }
    object.requestAnimationFrame = global.requestAnimationFrame;
    object.cancelAnimationFrame = global.cancelAnimationFrame;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = raf;
  } else {
    global.raf = raf;
  }
})(typeof window !== 'undefined' ? window : global);
