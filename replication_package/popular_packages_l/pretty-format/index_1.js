// pretty-format package implementation and custom plugin usage

const defaultTheme = { // Unused but defines potential styling options
  comment: 'gray',
  content: 'reset',
  prop: 'yellow',
  tag: 'cyan',
  value: 'green',
};

// Main function to format a given value based on options
function format(value, options = {}) {
  // Merge default options with provided options
  options = { indent: 2, printFunctionName: true, ...options };
  return stringify(value, options, '', 0, []);
}

// Helper function to recursively stringify values
function stringify(value, options, indentation, depth, refs) {
  // Prevent circular reference issues by checking existing references
  if (refs.includes(value)) return `[Circular]`;

  if (Array.isArray(value)) {
    return formatArray(value, options, indentation, depth, refs);
  } else if (typeof value === 'object' && value !== null) {
    refs.push(value);
    return formatObject(value, options, indentation, depth, refs);
  } else {
    return formatPrimitive(value, options);
  }
}

// Format arrays with proper indentation
function formatArray(array, options, indentation, depth, refs) {
  const newIndentation = indentation + ' '.repeat(options.indent);
  const elements = array.map(
    item => newIndentation + stringify(item, options, newIndentation, depth + 1, refs)
  );
  return `[\n${elements.join(',\n')}\n${indentation}]`;
}

// Format objects with proper indentation
function formatObject(object, options, indentation, depth, refs) {
  const newIndentation = indentation + ' '.repeat(options.indent);
  const entries = Object.entries(object).map(
    ([key, value]) => 
      `${newIndentation}${JSON.stringify(key)}: ${stringify(value, options, newIndentation, depth + 1, refs)}`
  );
  return `{\n${entries.join(',\n')}\n${indentation}}`;
}

// Format primitive types
function formatPrimitive(value, options) {
  if (value === null) {
    return 'null';
  }
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'number':
    case 'boolean':
      return String(value);
    case 'function':
      return options.printFunctionName && value.name ? `[Function ${value.name}]` : '[Function]';
    default:
      return String(value);
  }
}

module.exports = { format };

// Example custom plugin to handle function types differently
const customPlugin = {
  test(val) {
    return typeof val === 'function';
  },
  serialize(val) {
    return `[Function ${val.name || 'anonymous'} ${val.length}]`;
  }
};

// Demonstrating plugin usage with custom function serialization
const { format: prettyFormat } = require('./pretty-format');
const val = {
  onClick: function(event) {},
  render: function() {},
};

// Output formatted representation of the object using the custom plugin
console.log(prettyFormat(val, {
  plugins: [customPlugin]
}));
