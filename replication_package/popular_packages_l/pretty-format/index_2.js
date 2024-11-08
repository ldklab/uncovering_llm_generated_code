// Elegant formatting implementation
const DEFAULT_OPTIONS = { indent: 2, printFunctionName: true };

function format(value, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  return serializeValue(value, config, '', 0, []);
}

function serializeValue(value, options, indent, depth, seen) {
  if (seen.includes(value)) return '[Circular]';
  if (Array.isArray(value)) return serializeArray(value, options, indent, depth, seen);
  if (value && typeof value === 'object') {
    seen.push(value);
    return serializeObject(value, options, indent, depth, seen);
  }
  return serializePrimitive(value, options);
}

function serializeArray(array, options, indent, depth, seen) {
  const nextIndent = indent + ' '.repeat(options.indent);
  const items = array.map(item => `${nextIndent}${serializeValue(item, options, nextIndent, depth + 1, seen)}`);
  return `[\n${items.join(',\n')}\n${indent}]`;
}

function serializeObject(obj, options, indent, depth, seen) {
  const nextIndent = indent + ' '.repeat(options.indent);
  const entries = Object.entries(obj).map(
    ([key, value]) => `${nextIndent}${JSON.stringify(key)}: ${serializeValue(value, options, nextIndent, depth + 1, seen)}`
  );
  return `{\n${entries.join(',\n')}\n${indent}}`;
}

function serializePrimitive(value, options) {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string': return JSON.stringify(value);
    case 'number': case 'boolean': return String(value);
    case 'function': 
      return options.printFunctionName && value.name ? `[Function ${value.name}]` : '[Function]';
    default: return String(value);
  }
}

module.exports = { format };

// Custom plugin example
const customFunctionPlugin = {
  test: (val) => typeof val === 'function',
  serialize: (val) => `[Function ${val.name || 'anonymous'} ${val.length}]`,
};

// Example usage with custom plugin
const { format: prettyFormat } = require('./pretty-format');
const testObject = {
  onClick: function(event) {},
  render: function() {},
};

console.log(prettyFormat(testObject, { plugins: [customFunctionPlugin] }));
