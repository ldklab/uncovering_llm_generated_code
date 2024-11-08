// tmpl.js
function tmpl(template, context) {
  // Replace placeholders in the template string with corresponding values from context
  return template.replace(/{(.*?)}/g, (match, key) => {
    // If the key exists in context, replace it with its value, otherwise retain the placeholder
    return key in context ? context[key] : match;
  });
}

// Example usage with assertion
const assert = require('assert');
assert.equal(tmpl('the answer is {answer}', { answer: 42 }), 'the answer is 42');

// Export the tmpl function to allow usage as a module
module.exports = tmpl;

// Self-contained tests when script is executed directly
if (require.main === module) {
  console.log('Running tests...');

  // Define test cases with expected results
  const tests = [
    { input: ['Hello, {name}!', { name: 'Alice' }], expected: 'Hello, Alice!' },
    { input: ['{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' }], expected: 'Hi, Bob!' },
    { input: ['No placeholders here.', {}], expected: 'No placeholders here.' },
    { input: ['Missing {key}', {}], expected: 'Missing {key}' }, // Case where context key is missing
  ];

  // Execute tests and compare results against expected outcomes
  tests.forEach(({ input, expected }, index) => {
    const result = tmpl(...input);
    console.assert(result === expected, `Test ${index + 1} failed: expected "${expected}", got "${result}"`);
  });

  console.log('All tests passed!');
}
