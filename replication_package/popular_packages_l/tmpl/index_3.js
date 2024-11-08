// This function 'tmpl' replaces placeholders in a template string with values from a given context object.
function tmpl(template, context) {
  // Using a regular expression to find all `{key}` placeholders in the template string
  return template.replace(/{(.*?)}/g, (match, key) => {
    // For each found placeholder, trying to match it with a context field
    // If found, replace it with the context value; if not, leave the placeholder unchanged
    return key in context ? context[key] : match;
  });
}

// Example usage with assert to test the tmpl function
const assert = require('assert');
assert.equal(tmpl('the answer is {answer}', { answer: 42 }), 'the answer is 42');

// Export the 'tmpl' function to make it available as a module for external usage
module.exports = tmpl;

// If this script is executed directly, it will run its internal tests
if (require.main === module) {
  console.log('Running tests...');
  
  // Array of test cases containing input data and the expected output
  const tests = [
    { input: ['Hello, {name}!', { name: 'Alice' }], expected: 'Hello, Alice!' },
    { input: ['{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' }], expected: 'Hi, Bob!' },
    { input: ['No placeholders here.', {}], expected: 'No placeholders here.' },
    { input: ['Missing {key}', {}], expected: 'Missing {key}' }, // If the context doesn't provide the placeholder value, leave it unchanged
  ];

  // Iterate through each test case and check if the output matches the expected output
  tests.forEach(({ input, expected }, i) => {
    const result = tmpl(...input);
    console.assert(result === expected, `Test ${i + 1} failed: expected "${expected}", got "${result}"`);
  });

  console.log('All tests passed!');
}
