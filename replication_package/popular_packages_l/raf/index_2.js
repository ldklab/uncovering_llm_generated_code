// raf.js
(function(globalScope) {
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  let lastTime = 0;

  // Find a prefixed version of requestAnimationFrame if available
  for (let vendor of vendors) {
    if (!globalScope.requestAnimationFrame) {
      globalScope.requestAnimationFrame = globalScope[`${vendor}RequestAnimationFrame`];
      globalScope.cancelAnimationFrame = globalScope[`${vendor}CancelAnimationFrame`] ||
                                         globalScope[`${vendor}CancelRequestAnimationFrame`];
    }
  }

  // Use setTimeout if requestAnimationFrame is unavailable
  if (!globalScope.requestAnimationFrame) {
    globalScope.requestAnimationFrame = (callback) => {
      const currTime = Date.now();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = globalScope.setTimeout(() => callback(currTime + timeToCall), timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!globalScope.cancelAnimationFrame) {
    globalScope.cancelAnimationFrame = (id) => {
      globalScope.clearTimeout(id);
    };
  }

  function raf(callback) {
    return globalScope.requestAnimationFrame(callback);
  }

  raf.cancel = function(handle) {
    globalScope.cancelAnimationFrame(handle);
  };

  raf.polyfill = function(object = (typeof window !== 'undefined' ? window : globalScope)) {
    object.requestAnimationFrame = globalScope.requestAnimationFrame;
    object.cancelAnimationFrame = globalScope.cancelAnimationFrame;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = raf;
  } else {
    globalScope.raf = raf;
  }
})(typeof window !== 'undefined' ? window : global);
