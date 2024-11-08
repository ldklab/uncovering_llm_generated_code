// index.js
const semver = require('semver');
const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

// Function to get the current Node.js version
function getCurrentNodeVersion() {
  return process.versions.node;
}

// Function to load the test fixtures from a specified JSON file
function loadTestFixtures() {
  const fixturesPath = path.join(__dirname, 'test', 'fixtures.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
  return fixtures;
}

// Function to test if the syntax in the fixtures is supported by the current Node.js version
function testSyntaxAgainstNodeVersion() {
  const currentNodeVersion = getCurrentNodeVersion();
  const fixtures = loadTestFixtures();

  fixtures.forEach(({ code, minNodeVersion, name }) => {
    if (semver.gte(currentNodeVersion, minNodeVersion)) {
      // If the current Node.js version supports the syntax
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.log(`PASS: ${name}`);
      } catch (error) {
        console.error(`FAIL: ${name} - Unexpected parse error`);
        console.error(error);
      }
    } else {
      // If the current Node.js version does not support the syntax
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.error(`FAIL: ${name} - Should not support this syntax`);
      } catch {
        console.log(`PASS: ${name} - Correctly threw parse error`);
      }
    }
  });
}

// Execute the syntax test function
testSyntaxAgainstNodeVersion();
