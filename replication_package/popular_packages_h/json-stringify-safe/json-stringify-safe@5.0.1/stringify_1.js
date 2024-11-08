// Main function export for stringify
module.exports = stringify;

// Function to get a serializer, also exported
module.exports.getSerialize = getSerialize;

// Convert an object to a JSON string with handling for cycles
function stringify(obj, replacer, spaces, cycleReplacer) {
  // Use the custom serializer function to handle circular references
  return JSON.stringify(obj, getSerialize(replacer, cycleReplacer), spaces);
}

// Create a serializer function with options for replacing values and handling cycles
function getSerialize(replacer, cycleReplacer) {
  // Stack and keys arrays to keep track of position in the structure
  const stack = [];
  const keys = [];

  // Default cycle handler if not provided
  if (cycleReplacer == null) {
    cycleReplacer = function (key, value) {
      // Handle cycle at the root reference
      if (stack[0] === value) return "[Circular ~]";
      // Handle cycle references deeper in the object
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
    };
  }

  // The actual serializer function to handle replacing and cycle references
  return function (key, value) {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      // Update the stack and keys based on current position
      if (~thisPos) stack.splice(thisPos + 1);
      else stack.push(this);
      
      if (~thisPos) keys.splice(thisPos, Infinity, key);
      else keys.push(key);

      // If a cycle is detected, use the cycleReplacer to handle it
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    } else {
      stack.push(value);
    }

    // Apply replacer if provided, otherwise return the unmodified value
    return replacer == null ? value : replacer.call(this, key, value);
  };
}
