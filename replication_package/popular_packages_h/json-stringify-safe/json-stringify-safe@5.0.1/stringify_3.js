module.exports = stringify;
module.exports.getSerialize = serializer;

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, createSerializer(replacer, cycleReplacer), spaces);
}

function createSerializer(replacer, cycleReplacer) {
  let stack = [];
  let keys = [];

  if (cycleReplacer == null) {
    cycleReplacer = function(key, value) {
      if (stack[0] === value) return "[Circular ~]";
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
    };
  }

  return function(key, value) {
    if (stack.length > 0) {
      let thisPos = stack.indexOf(this);
      if (~thisPos) {
        stack.splice(thisPos + 1);
        keys.splice(thisPos, Infinity, key);
      } else {
        stack.push(this);
        keys.push(key);
      }
      if (~stack.indexOf(value)) {
        value = cycleReplacer.call(this, key, value);
      }
    } else {
      stack.push(value);
    }

    return replacer == null ? value : replacer.call(this, key, value);
  };
}
