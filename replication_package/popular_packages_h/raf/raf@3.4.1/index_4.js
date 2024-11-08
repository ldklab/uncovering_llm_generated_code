var now = require('performance-now');
var root = typeof window === 'undefined' ? global : window;
var vendors = ['moz', 'webkit'];
var suffix = 'AnimationFrame';

function getVendorMethod(prefix, method) {
  return root[prefix + method + suffix];
}

var raf = root['request' + suffix];
var caf = root['cancel' + suffix] || root['cancelRequest' + suffix];

for (var i = 0; !raf && i < vendors.length; i++) {
  raf = getVendorMethod(vendors[i], 'Request');
  caf = getVendorMethod(vendors[i], 'Cancel') || getVendorMethod(vendors[i], 'CancelRequest');
}

if (!raf || !caf) {
  var last = 0;
  var id = 0;
  var queue = [];
  var frameDuration = 1000 / 60;

  raf = function(callback) {
    if (queue.length === 0) {
      var _now = now();
      var next = Math.max(0, frameDuration - (_now - last));
      last = next + _now;

      setTimeout(function() {
        var cp = queue.slice(0);
        queue.length = 0;
        cp.forEach(function(item) {
          if (!item.cancelled) {
            try {
              item.callback(last);
            } catch (e) {
              setTimeout(function() { throw e; }, 0);
            }
          }
        });
      }, Math.round(next));
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    });
    return id;
  };

  caf = function(handle) {
    queue.forEach(function(item) {
      if (item.handle === handle) {
        item.cancelled = true;
      }
    });
  };
}

module.exports = function(fn) {
  return raf.call(root, fn);
};

module.exports.cancel = function() {
  caf.apply(root, arguments);
};

module.exports.polyfill = function(object) {
  object = object || root;
  object.requestAnimationFrame = raf;
  object.cancelAnimationFrame = caf;
};
