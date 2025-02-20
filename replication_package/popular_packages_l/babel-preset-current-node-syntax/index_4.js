// index.js
const semver = require('semver');
const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

// This function retrieves the current version of Node.js.
function getCurrentNodeVersion() {
  return process.versions.node;
}

// This function loads test fixture data from a JSON file.
function loadTestFixtures() {
  const fixturesPath = path.join(__dirname, 'test', 'fixtures.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
  return fixtures;
}

// This function tests if the syntax described in each fixture is compatible
// with the current Node.js version.
function testSyntaxAgainstNodeVersion() {
  const currentNodeVersion = getCurrentNodeVersion();
  const fixtures = loadTestFixtures();

  // Iterate over each test fixture, which includes the code to test,
  // the minimum Node.js version that should support the syntax, and a test name.
  fixtures.forEach(({ code, minNodeVersion, name }) => {
    // If the current Node.js version supports the code syntax (i.e., the
    // current version is greater than or equal to the minimum Node.js version),
    if (semver.gte(currentNodeVersion, minNodeVersion)) {
      // Attempt to parse the code using Babel's parser.
      try {
        babelParser.parse(code, { sourceType: 'module' });
        // If parsing succeeds, log that the test passed.
        console.log(`PASS: ${name}`);
      } catch (error) {
        // If parsing fails unexpectedly, log an error with the test name.
        console.error(`FAIL: ${name} - Unexpected parse error`);
        console.error(error);
      }
    } else {
      // If the current Node.js version should NOT support the code syntax,
      try {
        babelParser.parse(code, { sourceType: 'module' });
        // If parsing unexpectedly succeeds, log a failure message.
        console.error(`FAIL: ${name} - Should not support this syntax`);
      } catch {
        // If parsing correctly throws an error, log that the test passed.
        console.log(`PASS: ${name} - Correctly threw parse error`);
      }
    }
  });
}

// Execute the syntax tests based on Node version.
testSyntaxAgainstNodeVersion();
