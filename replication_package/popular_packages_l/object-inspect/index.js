const util = require('util');

function objectInspect(obj, options = {}) {
  const {
    depth = 2,
    quoteStyle = 'single',
    maxStringLength = Infinity,
    customInspect = true,
    indent = null,
    numericSeparator = false
  } = options;

  function quote(str) {
    if (quoteStyle === 'single') {
      return `'${str}'`;
    }
    return `"${str}"`;
  }

  function inspectRecursive(obj, currentDepth, visited) {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? quote(obj) : String(obj);
    }
    
    if (visited.has(obj)) {
      return '[Circular]';
    }
    
    visited.add(obj);
    
    if (Array.isArray(obj)) {
      if (currentDepth > depth) return '[Array]';
      return `[ ${obj.map(item => inspectRecursive(item, currentDepth + 1, visited)).join(', ')} ]`;
    } else if (obj instanceof HTMLElement) {
      if (currentDepth > depth) return `<${obj.tagName.toLowerCase()}>...</${obj.tagName.toLowerCase()}>`;
      return `<${obj.tagName.toLowerCase()} id="${obj.id}">...</${obj.tagName.toLowerCase()}>`;
    } else {
      if (currentDepth > depth) return '[Object]';
      const keys = Object.keys(obj);
      const inspected = keys.map(key => `${quote(key)}: ${inspectRecursive(obj[key], currentDepth + 1, visited)}`);
      return `{ ${inspected.join(', ')} }`;
    }
  }

  return inspectRecursive(obj, 0, new WeakSet());
}

function inspect(obj, opts) {
  return objectInspect(obj, opts);
}

module.exports = inspect;
