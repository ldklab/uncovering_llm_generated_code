// index.js
const semver = require('semver');
const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

function getCurrentNodeVersion() {
  return process.versions.node;
}

function loadTestFixtures() {
  const fixturesPath = path.join(__dirname, 'test', 'fixtures.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
  return fixtures;
}

function testSyntaxAgainstNodeVersion() {
  const currentNodeVersion = getCurrentNodeVersion();
  const fixtures = loadTestFixtures();

  fixtures.forEach(({ code, minNodeVersion, name }) => {
    if (semver.gte(currentNodeVersion, minNodeVersion)) {
      // Node supports this syntax
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.log(`PASS: ${name}`);
      } catch (error) {
        console.error(`FAIL: ${name} - Unexpected parse error`);
        console.error(error);
      }
    } else {
      // Node does not support this syntax
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.error(`FAIL: ${name} - Should not support this syntax`);
      } catch {
        console.log(`PASS: ${name} - Correctly threw parse error`);
      }
    }
  });
}

// Run the syntax test checks
testSyntaxAgainstNodeVersion();

