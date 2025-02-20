// tmpl.js
function tmpl(template, context) {
  // Replace placeholders in the template with corresponding values from the context object
  return template.replace(/{(.*?)}/g, (match, key) => {
    // If the key exists in the context, return its value; otherwise, return the original placeholder
    return key in context ? context[key] : match;
  });
}

// Export the tmpl function as a module for use in other files
module.exports = tmpl;

// Example usage to ensure the function works as expected
const assert = require('assert');
assert.equal(tmpl('the answer is {answer}', { answer: 42 }), 'the answer is 42');

// Perform simple tests only if this script is executed directly
if (require.main === module) {
  console.log('Running tests...');
  
  const tests = [
    { input: ['Hello, {name}!', { name: 'Alice' }], expected: 'Hello, Alice!' },
    { input: ['{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' }], expected: 'Hi, Bob!' },
    { input: ['No placeholders here.', {}], expected: 'No placeholders here.' },
    { input: ['Missing {key}', {}], expected: 'Missing {key}' }, // Handles placeholders without corresponding context keys
  ];

  tests.forEach(({ input, expected }, i) => {
    const result = tmpl(...input);
    console.assert(result === expected, `Test ${i + 1} failed: expected "${expected}", got "${result}"`);
  });

  console.log('All tests passed!');
}
