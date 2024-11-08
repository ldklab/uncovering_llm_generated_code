const util = require('util');

function objectInspect(obj, options = {}) {
  // Destructure configuration options or use default values
  const {
    depth = 2,
    quoteStyle = 'single',
    maxStringLength = Infinity,
    customInspect = true,
    indent = null,
    numericSeparator = false
  } = options;

  // Helper function to apply quotes based on quoteStyle
  const quote = (str) => (quoteStyle === 'single' ? `'${str}'` : `"${str}"`);

  // Recursive function to inspect an object
  const inspectRecursive = (obj, currentDepth, visited) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? quote(obj) : String(obj);
    }

    if (visited.has(obj)) {
      return '[Circular]';
    }
    visited.add(obj);

    if (Array.isArray(obj)) {
      return currentDepth > depth ? '[Array]' : `[${obj.map(item => inspectRecursive(item, currentDepth + 1, visited)).join(', ')}]`;
    } else if (obj instanceof HTMLElement) {
      return currentDepth > depth ? `<${obj.tagName.toLowerCase()}>...</${obj.tagName.toLowerCase()}>` : `<${obj.tagName.toLowerCase()} id="${obj.id}">...</${obj.tagName.toLowerCase()}>`;
    } else {
      if (currentDepth > depth) return '[Object]';
      const keys = Object.keys(obj);
      const inspected = keys.map(key => `${quote(key)}: ${inspectRecursive(obj[key], currentDepth + 1, visited)}`);
      return `{ ${inspected.join(', ')} }`;
    }
  };

  return inspectRecursive(obj, 0, new WeakSet());
}

function inspect(obj, opts) {
  return objectInspect(obj, opts);
}

module.exports = inspect;
