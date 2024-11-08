const now = require('performance-now');
const root = typeof window === 'undefined' ? global : window;
const vendors = ['moz', 'webkit'];
const suffix = 'AnimationFrame';
let raf = root['request' + suffix];
let caf = root['cancel' + suffix] || root['cancelRequest' + suffix'];

for (let i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix];
  caf = root[vendors[i] + 'Cancel' + suffix] || root[vendors[i] + 'CancelRequest' + suffix];
}

if (!raf || !caf) {
  let lastTime = 0;
  let id = 0;
  const queue = [];
  const frameDuration = 1000 / 60;

  raf = function(callback) {
    if (queue.length === 0) {
      const currentTime = now();
      const nextTime = Math.max(0, frameDuration - (currentTime - lastTime));
      lastTime = nextTime + currentTime;
      setTimeout(() => {
        const callbacks = queue.slice(0);
        queue.length = 0;
        for (let i = 0; i < callbacks.length; i++) {
          if (!callbacks[i].cancelled) {
            try {
              callbacks[i].callback(lastTime);
            } catch (e) {
              setTimeout(() => { throw e; }, 0);
            }
          }
        }
      }, Math.round(nextTime));
    }
    queue.push({ handle: ++id, callback, cancelled: false });
    return id;
  };

  caf = function(handle) {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].handle === handle) {
        queue[i].cancelled = true;
      }
    }
  };
}

module.exports = function(fn) {
  return raf.call(root, fn);
};

module.exports.cancel = function() {
  caf.apply(root, arguments);
};

module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf;
  object.cancelAnimationFrame = caf;
};
