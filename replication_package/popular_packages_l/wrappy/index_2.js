// wrappy.js
function wrappy(wrapperFn) {
  return function(fn) {
    var wrapped = wrapperFn(fn);
    Object.assign(wrapped, fn);
    return wrapped;
  };
}

module.exports = wrappy;

// Example usage:

var wrappy = require("./wrappy");

var once = wrappy(function (cb) {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return cb.apply(this, args);
  };
});

function printBoo() {
  console.log('boo');
}

printBoo.iAmBooPrinter = true;

var onlyPrintOnce = once(printBoo);

onlyPrintOnce(); // Expected output: 'boo'
onlyPrintOnce(); // Nothing happens

console.assert(onlyPrintOnce.iAmBooPrinter === true, "Property not retained");
