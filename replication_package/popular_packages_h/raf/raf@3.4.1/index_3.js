const performanceNow = require('performance-now');

let globalRoot = typeof window === 'undefined' ? global : window;
let requestAnimationFrame = globalRoot.requestAnimationFrame;
let cancelAnimationFrame = globalRoot.cancelAnimationFrame || globalRoot.cancelRequestAnimationFrame;

const vendorPrefixes = ['moz', 'webkit'];
const animationSuffix = 'AnimationFrame';

// Check for vendor-prefixed implementations
for (let i = 0; !requestAnimationFrame && i < vendorPrefixes.length; i++) {
  requestAnimationFrame = globalRoot[vendorPrefixes[i] + 'Request' + animationSuffix];
  cancelAnimationFrame = globalRoot[vendorPrefixes[i] + 'Cancel' + animationSuffix] ||
                         globalRoot[vendorPrefixes[i] + 'CancelRequest' + animationSuffix];
}

// Fallback implementation if necessary
if (!requestAnimationFrame || !cancelAnimationFrame) {
  let lastTime = 0;
  let currentId = 0;
  const callbackQueue = [];
  const frameTime = 1000 / 60; // 60 FPS

  requestAnimationFrame = function(callback) {
    if (callbackQueue.length === 0) {
      const currentTime = performanceNow();
      const nextFrameTime = Math.max(0, frameTime - (currentTime - lastTime));
      lastTime = currentTime + nextFrameTime;

      setTimeout(() => {
        const processedQueue = callbackQueue.slice(0);
        callbackQueue.length = 0;

        for (let i = 0; i < processedQueue.length; i++) {
          if (!processedQueue[i].cancelled) {
            try {
              processedQueue[i].callback(lastTime);
            } catch (error) {
              setTimeout(() => { throw error }, 0);
            }
          }
        }
      }, Math.round(nextFrameTime));
    }

    const handle = ++currentId;
    callbackQueue.push({
      handle,
      callback,
      cancelled: false
    });

    return handle;
  };

  cancelAnimationFrame = function(handle) {
    for (let i = 0; i < callbackQueue.length; i++) {
      if (callbackQueue[i].handle === handle) {
        callbackQueue[i].cancelled = true;
      }
    }
  };
}

// Export the functions
module.exports = function(fn) {
  return requestAnimationFrame.call(globalRoot, fn);
};

module.exports.cancel = function() {
  cancelAnimationFrame.apply(globalRoot, arguments);
};

module.exports.polyfill = function(target) {
  if (!target) {
    target = globalRoot;
  }
  target.requestAnimationFrame = requestAnimationFrame;
  target.cancelAnimationFrame = cancelAnimationFrame;
};
