// index.js
const semver = require('semver');
const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

// Function to get the version of the current Node.js runtime
function getCurrentNodeVersion() {
  return process.versions.node;
}

// Load test fixtures from a JSON file located in the 'test' directory
function loadTestFixtures() {
  const fixturesPath = path.join(__dirname, 'test', 'fixtures.json');
  const fileContent = fs.readFileSync(fixturesPath, 'utf-8');
  return JSON.parse(fileContent);
}

// Tests JS syntax against current Node version using Babel's parser
function testSyntaxAgainstNodeVersion() {
  const currentNodeVersion = getCurrentNodeVersion();
  const fixtures = loadTestFixtures();

  // Iterate over each fixture for testing
  fixtures.forEach(({ code, minNodeVersion, name }) => {
    // Check if the current Node version supports the given syntax
    if (semver.gte(currentNodeVersion, minNodeVersion)) {
      try {
        // Try to parse the code, expecting success
        babelParser.parse(code, { sourceType: 'module' });
        console.log(`PASS: ${name}`);
      } catch (error) {
        console.error(`FAIL: ${name} - Unexpected parse error`);
        console.error(error);
      }
    } else {
      try {
        // Try to parse the code, expecting it to fail
        babelParser.parse(code, { sourceType: 'module' });
        console.error(`FAIL: ${name} - Should not support this syntax`);
      } catch {
        console.log(`PASS: ${name} - Correctly threw parse error`);
      }
    }
  });
}

// Execute the syntax testing against the current Node version
testSyntaxAgainstNodeVersion();
