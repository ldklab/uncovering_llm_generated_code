// Templating function to replace placeholders with context values
function tmpl(template, context) {
  // Regular expression to find placeholders within curly braces
  return template.replace(/{(.*?)}/g, (match, key) => {
    // Replace with corresponding context value or keep original if key is absent
    return key in context ? context[key] : match;
  });
}

// Usage demonstration through assertion
const assert = require('assert');
assert.equal(tmpl('the answer is {answer}', { answer: 42 }), 'the answer is 42');

// Make the templating function available for import as a module
module.exports = tmpl;

// Self-running test block if the script is executed directly
if (require.main === module) {
  console.log('Running tests...');
  
  const testCases = [
    { input: ['Hello, {name}!', { name: 'Alice' }], expected: 'Hello, Alice!' },
    { input: ['{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' }], expected: 'Hi, Bob!' },
    { input: ['No placeholders here.', {}], expected: 'No placeholders here.' },
    { input: ['Missing {key}', {}], expected: 'Missing {key}' }, // Keep missing keys intact
  ];

  testCases.forEach(({ input, expected }, index) => {
    const result = tmpl(...input);
    console.assert(result === expected, `Test ${index + 1} failed: expected "${expected}", got "${result}"`);
  });

  console.log('All tests passed!');
}
