module.exports = stringify;
module.exports.getSerialize = serializer;

/**
 * Converts a JavaScript object into a JSON string, supporting custom serialization and handling of circular references.
 * @param {Object} obj - The object to stringify.
 * @param {Function} [replacer] - A function to alter the behavior of the stringification process.
 * @param {Number|String} [spaces] - Controls spacing in the final string output.
 * @param {Function} [cycleReplacer] - A function to handle circular references in objects.
 * @returns {String} The JSON string representation of the object.
 */
function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
}

/**
 * Creates a serialization function for JSON.stringify, optionally replacing how an object is serialized,
 * and handling circular references.
 * @param {Function} [replacer] - A custom replacer function that alters the serialization.
 * @param {Function} [cycleReplacer] - A function for serializing circular structures.
 * @returns {Function} A custom serialization function.
 */
function serializer(replacer, cycleReplacer) {
  var stack = [], keys = [];

  if (cycleReplacer == null) {
    cycleReplacer = function(key, value) {
      if (stack[0] === value) return "[Circular ~]";
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
    };
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      if (~thisPos) {
        stack.splice(thisPos + 1);
        keys.splice(thisPos, Infinity, key);
      } else {
        stack.push(this);
        keys.push(key);
      }
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    } else {
      stack.push(value);
    }

    return replacer == null ? value : replacer.call(this, key, value);
  };
}
