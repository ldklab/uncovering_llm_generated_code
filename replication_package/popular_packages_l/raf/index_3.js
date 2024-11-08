// raf.js
(function(global) {
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  let lastTime = 0;

  // Define fallback functions
  const fallbackRequestAnimationFrame = function(callback) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = global.setTimeout(() => { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  const fallbackCancelAnimationFrame = function(id) {
    global.clearTimeout(id);
  };

  // Attempt to set native raf/caf
  vendors.some(prefix => {
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = global[`${prefix}RequestAnimationFrame`];
      global.cancelAnimationFrame = global[`${prefix}CancelAnimationFrame`] ||
                                    global[`${prefix}CancelRequestAnimationFrame`];
    }
    return global.requestAnimationFrame;
  });

  // Use fallback if raf not available
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = fallbackRequestAnimationFrame;
    global.cancelAnimationFrame = fallbackCancelAnimationFrame;
  }

  function raf(callback) {
    return global.requestAnimationFrame(callback);
  }

  raf.cancel = function(handle) {
    global.cancelAnimationFrame(handle);
  };

  raf.polyfill = function(object = (typeof window !== 'undefined' ? window : global)) {
    object.requestAnimationFrame = global.requestAnimationFrame;
    object.cancelAnimationFrame = global.cancelAnimationFrame;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = raf;
  } else {
    global.raf = raf;
  }
})(typeof window !== 'undefined' ? window : global);
