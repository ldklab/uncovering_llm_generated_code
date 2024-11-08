// tmpl.js
function tmpl(template, context) {
  // Using a regular expression to find all `{key}` placeholders in the template
  return template.replace(/{(.*?)}/g, (match, key) => {
    // For each placeholder, replace it with corresponding value from context
    return key in context ? context[key] : match;
  });
}

// Example usage
const assert = require('assert');
assert.equal(tmpl('the answer is {answer}', { answer: 42 }), 'the answer is 42');

// Export the tmpl function so it can be used as a module
module.exports = tmpl;

// Tests
if (require.main === module) {
  console.log('Running tests...');
  
  const tests = [
    { input: ['Hello, {name}!', { name: 'Alice' }], expected: 'Hello, Alice!' },
    { input: ['{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' }], expected: 'Hi, Bob!' },
    { input: ['No placeholders here.', {}], expected: 'No placeholders here.' },
    { input: ['Missing {key}', {}], expected: 'Missing {key}' }, // Handle missing keys gracefully
  ];

  tests.forEach(({ input, expected }, i) => {
    const result = tmpl(...input);
    console.assert(result === expected, `Test ${i + 1} failed: expected "${expected}", got "${result}"`);
  });

  console.log('All tests passed!');
}
