const util = require('util');

function customInspect(obj, options = {}) {
  const {
    depth = 2,
    quoteStyle = 'single',
    maxStringLength = Infinity,
    customInspect = true,
    indent = null,
    numericSeparator = false
  } = options;

  const wrapWithQuotes = str => (quoteStyle === 'single' ? `'${str}'` : `"${str}"`);

  const recursiveInspect = (obj, currentDepth, seenObjects) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? wrapWithQuotes(obj) : String(obj);
    }

    if (seenObjects.has(obj)) {
      return '[Circular]';
    }

    seenObjects.add(obj);

    if (Array.isArray(obj)) {
      if (currentDepth > depth) return '[Array]';
      return `[ ${obj.map(item => recursiveInspect(item, currentDepth + 1, seenObjects)).join(', ')} ]`;
    } else if (obj instanceof HTMLElement) {
      if (currentDepth > depth) return `<${obj.tagName.toLowerCase()}>...</${obj.tagName.toLowerCase()}>`;
      return `<${obj.tagName.toLowerCase()} id="${obj.id}">...</${obj.tagName.toLowerCase()}>`;
    } else {
      if (currentDepth > depth) return '[Object]';
      const entries = Object.keys(obj).map(key => `${wrapWithQuotes(key)}: ${recursiveInspect(obj[key], currentDepth + 1, seenObjects)}`);
      return `{ ${entries.join(', ')} }`;
    }
  };

  return recursiveInspect(obj, 0, new WeakSet());
}

function inspect(obj, opts) {
  return customInspect(obj, opts);
}

module.exports = inspect;
