const util = require('util');

function formatValue(value, options) {
  const {
    quoteStyle,
    depth,
    maxStringLength,
    customInspect,
    indent,
    numericSeparator
  } = options;

  const quote = (str) => quoteStyle === 'single' ? `'${str}'` : `"${str}"`;

  function recursiveInspect(item, currentDepth, seen) {
    if (item === null || typeof item !== 'object') {
      return typeof item === 'string' ? quote(item) : String(item);
    }

    if (seen.has(item)) {
      return '[Circular]';
    }

    seen.add(item);

    if (Array.isArray(item)) {
      if (currentDepth > depth) return '[Array]';
      return `[ ${item.map(i => recursiveInspect(i, currentDepth + 1, seen)).join(', ')} ]`;
    } else if (item instanceof HTMLElement) {
      if (currentDepth > depth) return `<${item.tagName.toLowerCase()}>...</${item.tagName.toLowerCase()}>`;
      return `<${item.tagName.toLowerCase()} id="${item.id}">...</${item.tagName.toLowerCase()}>`;
    } else {
      if (currentDepth > depth) return '[Object]';
      const keys = Object.keys(item);
      const inspected = keys.map(key => `${quote(key)}: ${recursiveInspect(item[key], currentDepth + 1, seen)}`);
      return `{ ${inspected.join(', ')} }`;
    }
  }

  return recursiveInspect(value, 0, new WeakSet());
}

function inspect(object, options = {}) {
  const defaultOptions = {
    depth: 2,
    quoteStyle: 'single',
    maxStringLength: Infinity,
    customInspect: true,
    indent: null,
    numericSeparator: false,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return formatValue(object, mergedOptions);
}

module.exports = inspect;
