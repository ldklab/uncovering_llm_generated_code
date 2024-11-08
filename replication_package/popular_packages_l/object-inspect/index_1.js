const util = require('util');

function inspectObject(obj, options = {}) {
  const {
    depth = 2,
    quoteStyle = 'single',
    maxStringLength = Infinity,
    customInspect = true,
    indent = null,
    numericSeparator = false
  } = options;

  const quote = (str) => (quoteStyle === 'single' ? `'${str}'` : `"${str}"`);

  const inspectRecursively = (obj, currentDepth, visited) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? quote(obj) : String(obj);
    }

    if (visited.has(obj)) {
      return '[Circular]';
    }

    visited.add(obj);

    if (Array.isArray(obj)) {
      if (currentDepth > depth) return '[Array]';
      return `[ ${obj.map(item => inspectRecursively(item, currentDepth + 1, visited)).join(', ')} ]`;
    } else if (obj instanceof HTMLElement) {
      if (currentDepth > depth) return `<${obj.tagName.toLowerCase()}>...</${obj.tagName.toLowerCase()}>`;
      return `<${obj.tagName.toLowerCase()} id="${obj.id}">...</${obj.tagName.toLowerCase()}>`;
    } else {
      if (currentDepth > depth) return '[Object]';
      const keys = Object.keys(obj);
      const inspected = keys.map(key => `${quote(key)}: ${inspectRecursively(obj[key], currentDepth + 1, visited)}`);
      return `{ ${inspected.join(', ')} }`;
    }
  };

  return inspectRecursively(obj, 0, new WeakSet());
}

function inspect(obj, opts) {
  return inspectObject(obj, opts);
}

module.exports = inspect;
