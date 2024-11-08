// process-nextick-args/index.js

module.exports = {
  nextTick: function (fn) {
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
    if (args.length === 0) {
      return process.nextTick(fn);
    } else {
      return process.nextTick(function () {
        fn.apply(null, args);
      });
    }
  }
};
